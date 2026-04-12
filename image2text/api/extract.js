import Tesseract from "tesseract.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import multer from "multer";
import History from "../backend/models/History.js";
import { writeFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { handleCors } from "./middleware/cors.js";

const upload = multer({ storage: multer.memoryStorage() });
const uploadMiddleware = upload.single("image");

export default async (req, res) => {
    // Handle CORS
    if (handleCors(req, res, process.env.FRONTEND_URL || "*")) {
        return;
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    // Apply multer middleware
    uploadMiddleware(req, res, async (err) => {
        if (err) {
            return res.status(500).json({ error: "File upload failed" });
        }

        try {
            await mongoose.connect(
                process.env.MONGO_URI || "mongodb://localhost:27017/ocr-app",
            );

            if (!req.file) {
                return res.status(400).json({ error: "No file uploaded" });
            }

            // Save buffer to temp file
            const tmpPath = join(tmpdir(), `ocr-${Date.now()}.png`);
            writeFileSync(tmpPath, req.file.buffer);

            const result = await Tesseract.recognize(tmpPath, "eng");
            const text = result.data.text;

            // Cleanup temp file
            unlinkSync(tmpPath);

            // Get user ID from token if exists
            let userId = null;
            const token = req.headers.authorization;

            if (token) {
                try {
                    const decoded = jwt.verify(token, "secret");
                    userId = decoded.id;

                    // Save to history if user is logged in
                    await History.create({
                        userId,
                        extractedText: text,
                    });
                } catch (err) {
                    console.log(
                        "Token validation failed, continuing without history",
                    );
                }
            }

            res.status(200).json({ text });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "OCR failed" });
        }
    });
};
