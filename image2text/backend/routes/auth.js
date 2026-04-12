import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", async (req, res) => {
    const hashed = await bcrypt.hash(req.body.password, 10);

    await User.create({
        email: req.body.email,
        password: hashed,
    });

    res.json({ message: "Registered" });
});

router.post("/login", async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(req.body.password, user.password);

    if (!valid) return res.status(401).json({ error: "Invalid password" });

    const token = jwt.sign({ id: user._id }, "secret");

    res.json({ token });
});

export default router;
