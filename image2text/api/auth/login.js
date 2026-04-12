import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return res.status(401).json({ error: "Invalid password" });
        }

        const token = jwt.sign({ id: user._id }, "secret");

        res.status(200).json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Login failed" });
    }
};
