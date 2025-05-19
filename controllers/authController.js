const admin = require("../firebase");
const User = require("../models/User");
const jwt = require("jsonwebtoken");


// API to generate jwt token from firebase token 
exports.verifyToken = async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Token missing" });

    try {
        const decoded = await admin.auth().verifyIdToken(token);
        const { uid, name, email, picture } = decoded;

        let user = await User.findOne({ uid });
        if (!user) {
            user = await User.create({ uid, name, email, picture });
        }

        const jwtToken = jwt.sign(user.toObject(), process.env.JWT_SECRET, {
            expiresIn: "12h",
        });

        res.json({ success: true, user, token: jwtToken });
    } catch (err) {
        console.error("Token verification failed:", err.message);
        res.status(401).json({ error: "Unauthorized" });
    }
};
