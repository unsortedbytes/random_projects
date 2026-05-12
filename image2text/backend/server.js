import express from "express";
ximport multer from "multer";
import cors from "cors";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { writeFileSync, unlinkSync, mkdirSync, readFileSync, rmSync, existsSync } from "fs";
import { tmpdir } from "os";
import { join, basename, extname } from "path";
import { exec } from "child_process";
import { promisify } from "util";
import sharp from "sharp";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const execPromise = promisify(exec);

// OCR timeout: 2 minutes (optimized for lightweight model)
const OCR_TIMEOUT = 2 * 60 * 1000;

// Memory optimization settings
const MAX_IMAGE_DIMENSION = 1920; // Max width/height before downscaling
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB limit before compression
const JPEG_QUALITY = 85; // Compression quality for preprocessing

import authRoutes from "./routes/auth.js";
import History from "./models/History.js";

// ✅ MongoDB connection
mongoose
    .connect(process.env.MONGO_URI || "mongodb://localhost:27017/ocr-app")
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

const app = express();

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "http://localhost:3000",
            process.env.FRONTEND_URL || "http://localhost:5173",
            "https://images2text.vercel.app",
        ],
        credentials: true,
    }),
);
app.use(express.json());

// ✅ Auth routes
app.use("/auth", authRoutes);

// ✅ Multer setup - use memory storage for Render compatibility
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Optional Auth Middleware
const optionalAuth = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        req.userId = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
        req.userId = decoded.id;
    } catch {
        req.userId = null;
    }

    next();
};

// ✅ Health check endpoint
app.get("/", async (req, res) => {
    try {
        await execPromise("chandra --help");
        res.json({ status: "Backend is running ✅", ocr: "Chandra OCR is ready" });
    } catch (err) {
        console.error("Health Check OCR Error:", err.message);
        res.json({ status: "Backend is running ✅", ocr: "Chandra OCR ERROR", details: err.message });
    }
});

// ✅ OCR Route
app.post("/extract", optionalAuth, upload.single("image"), async (req, res) => {
    const timestamp = Date.now();
    const tmpInputPath = join(tmpdir(), `input-${timestamp}.jpg`);
    const tmpOutputDir = join(tmpdir(), `output-${timestamp}`);

    try {
        console.log("📤 Upload request received");
        console.log("File:", req.file ? "✓ Present" : "✗ Missing");

        if (!req.file) {
            console.log("❌ No file uploaded");
            return res.status(400).json({ error: "No file uploaded" });
        }

        console.log("📝 Original file size:", req.file.size, "bytes");

        // Preprocess image to reduce memory usage
        let processedBuffer = sharp(req.file.buffer);
        const metadata = await processedBuffer.metadata();
        
        console.log(`📐 Original dimensions: ${metadata.width}x${metadata.height}`);

        // Downscale if image is too large
        if (metadata.width > MAX_IMAGE_DIMENSION || metadata.height > MAX_IMAGE_DIMENSION) {
            processedBuffer = processedBuffer.resize({
                width: Math.min(metadata.width, MAX_IMAGE_DIMENSION),
                height: Math.min(metadata.height, MAX_IMAGE_DIMENSION),
                fit: 'inside',
                withoutEnlargement: true
            });
            console.log(`📐 Resized to max ${MAX_IMAGE_DIMENSION}px`);
        }

        // Convert to optimized JPEG to reduce file size
        const optimizedBuffer = await processedBuffer
            .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
            .toBuffer();

        console.log(`📦 Optimized file size: ${(optimizedBuffer.length / 1024).toFixed(1)}KB (${((1 - optimizedBuffer.length / req.file.size) * 100).toFixed(0)}% reduction)`);

        // Create temp input file and output directory
        writeFileSync(tmpInputPath, optimizedBuffer);
        mkdirSync(tmpOutputDir, { recursive: true });
        console.log("💾 Temp directories created");

        // Run Chandra OCR with optimized settings
        const hfToken = process.env.HF_TOKEN;
        const command = `chandra "${tmpInputPath}" "${tmpOutputDir}" --method hf`;
        console.log(`🚀 Running optimized OCR...`);

        const { stdout, stderr } = await execPromise(command, { 
            timeout: OCR_TIMEOUT,
            maxBuffer: 10 * 1024 * 1024, // 10MB buffer
            env: {
                ...process.env,
                HF_TOKEN: hfToken
            }
        });
        console.log("✅ Chandra CLI completed");
        if (stderr) console.warn("stderr:", stderr);

        // Chandra creates a subfolder named after the input file (without extension)
        const inputBaseName = basename(tmpInputPath, extname(tmpInputPath));
        const mdFilePath = join(tmpOutputDir, inputBaseName, `${inputBaseName}.md`);

        console.log(`📖 Reading result from: ${mdFilePath}`);
        
        let text = "";

        if (!existsSync(mdFilePath)) {
            // Try to find any .md file in the output directory
            console.log("⚠️ Expected md file not found, searching output directory...");
            const { readdirSync } = await import("fs");
            let foundMd = null;
            
            try {
                const outputFiles = readdirSync(tmpOutputDir, { recursive: true });
                foundMd = outputFiles.find(f => f.endsWith('.md'));
            } catch (e) {
                console.warn("Could not search output directory:", e.message);
            }
            
            if (foundMd) {
                const fullPath = join(tmpOutputDir, foundMd);
                console.log(`📖 Found alternative result: ${fullPath}`);
                text = readFileSync(fullPath, "utf-8");
            } else {
                throw new Error("OCR completed but no output file was generated");
            }
        } else {
            text = readFileSync(mdFilePath, "utf-8");
        }
        
        console.log("📖 Extracted text length:", text.length);

        // ✅ Save ONLY if user is logged in and text is not empty
        if (req.userId && text.trim()) {
            await History.create({
                userId: req.userId,
                extractedText: text,
            });
            console.log("💾 History saved for user:", req.userId);
        }

        res.json({ text });
    } catch (err) {
        console.error("❌ OCR Error:", err.message);
        
        // Provide more specific error messages
        let errorMessage = "OCR failed";
        if (err.killed) {
            errorMessage = "OCR process was killed (likely out of memory). Try a smaller image.";
        } else if (err.code === "KILL" || err.signal === "SIGKILL") {
            errorMessage = "OCR process ran out of memory. Try a smaller image.";
        } else if (err.code === "ETIMEDOUT" || err.killed) {
            errorMessage = "OCR timed out. The image may be too complex.";
        } else if (err.message) {
            errorMessage = "OCR failed: " + err.message;
        }
        
        res.status(500).json({ error: errorMessage });
    } finally {
        // Cleanup
        try {
            if (existsSync(tmpInputPath)) {
                unlinkSync(tmpInputPath);
                console.log("🗑️ Temp input deleted");
            }
            if (existsSync(tmpOutputDir)) {
                rmSync(tmpOutputDir, { recursive: true, force: true });
                console.log("🗑️ Temp output dir deleted");
            }
        } catch (cleanupErr) {
            console.warn("Cleanup error:", cleanupErr.message);
        }
    }
});

// ✅ Get user history
app.get("/history", async (req, res) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ error: "Login required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const data = await History.find({ userId: decoded.id }).sort({
            createdAt: -1,
        }); // latest first

        res.json(data);
    } catch (err) {
        console.log("History Error:", err);
        res.status(401).json({ error: "Invalid token" });
    }
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
