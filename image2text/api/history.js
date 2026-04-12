import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import History from "../backend/models/History.js";
import { handleCors } from "./middleware/cors.js";

export default async (req, res) => {
    // Handle CORS
    if (handleCors(req, res, process.env.FRONTEND_URL || "*")) {
        return;
    }

    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        await mongoose.connect(
            process.env.MONGO_URI || "mongodb://localhost:27017/ocr-app",
        );

        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ error: "Login required" });
        }

        const decoded = jwt.verify(token, "secret");

        const data = await History.find({ userId: decoded.id }).sort({
            createdAt: -1,
        });

        res.status(200).json(data);
    } catch (err) {
        console.error(err);
        res.status(401).json({ error: "Invalid token" });
    }
};
