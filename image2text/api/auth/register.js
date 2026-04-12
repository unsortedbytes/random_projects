import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "../../backend/models/User.js";
import { handleCors } from "../middleware/cors.js";

export default async (req, res) => {
    // Handle CORS
    if (handleCors(req, res, process.env.FRONTEND_URL || "*")) {
        return;
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        await mongoose.connect(
            process.env.MONGO_URI || "mongodb://localhost:27017/ocr-app",
        );

        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ error: "Email and password required" });
        }

        const hashed = await bcrypt.hash(password, 10);

        await User.create({
            email,
            password: hashed,
        });

        res.status(200).json({ message: "Registered" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Registration failed" });
    }
};
