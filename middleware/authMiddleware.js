const admin = require("../firebase");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Auth middleware to check the token is valid or not and has not expired
module.exports = async function authMiddleware(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ success: false, error: "Token missing" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded
        if (!req.user) throw new Error("User not found");
        next();
    } catch (err) {
        console.error("JWT verification failed:", err);
        return res.status(401).json({ success: false, error: "Invalid or expired token" });
    }
};

