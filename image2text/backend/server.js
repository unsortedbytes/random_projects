import express from "express";
import multer from "multer";
import cors from "cors";
import Tesseract from "tesseract.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { writeFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

import authRoutes from "./routes/auth.js";
import History from "./models/History.js"; // ✅ make sure this file exists

// ✅ MongoDB connection
mongoose
    .connect(process.env.MONGO_URI || "mongodb://localhost:27017/ocr-app")
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log(err));

const app = express();

app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "http://localhost:5173",
            process.env.FRONTEND_URL || "http://localhost:3000",
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
        const decoded = jwt.verify(token, "secret");
        req.userId = decoded.id;
    } catch {
        req.userId = null;
    }

    next();
};

// ✅ OCR Route
app.post("/extract", optionalAuth, upload.single("image"), async (req, res) => {
    try {
        // 🔥 Prevent crash if no file
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // Write buffer to temp file (Render-compatible)
        const tmpPath = join(tmpdir(), `ocr-${Date.now()}.png`);
        writeFileSync(tmpPath, req.file.buffer);

        const result = await Tesseract.recognize(tmpPath, "eng");

        // Clean up temp file
        unlinkSync(tmpPath);

        const text = result.data.text;

        // ✅ Save ONLY if user is logged in
        if (req.userId) {
            await History.create({
                userId: req.userId,
                extractedText: text,
            });
        }

        res.json({ text });
    } catch (err) {
        console.log("OCR Error:", err);
        res.status(500).json({ error: "OCR failed" });
    }
});

// ✅ Get user history
app.get("/history", async (req, res) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ error: "Login required" });
        }

        const decoded = jwt.verify(token, "secret");

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
