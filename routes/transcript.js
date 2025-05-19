const express = require("express");
const router = express.Router();
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");
const {
    uploadAudioAndTranscribe,
    chatWithTranscriptStream,
    getChatHistory,
} = require("../controllers/transcriptController");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", authMiddleware, upload.single("audio"), uploadAudioAndTranscribe);
router.post("/chat-with-transcript/stream", authMiddleware, chatWithTranscriptStream);
router.get("/chat-with-transcript/:meetingId", authMiddleware, getChatHistory);

module.exports = router;
