const express = require("express");
const router = express.Router();
const { verifyToken } = require("../controllers/authController");

router.post("/auth/verify-token", verifyToken);

module.exports = router;
