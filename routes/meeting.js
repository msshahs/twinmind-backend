const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const meetingController = require("../controllers/meetingController");

// Routes
router.post("/", authMiddleware, meetingController.createMeeting);
router.get("/", authMiddleware, meetingController.getAllMeetings);
router.put("/:id", authMiddleware, meetingController.updateMeetingTitle);
router.get("/:id", authMiddleware, meetingController.getMeetingById);
router.delete("/:id", authMiddleware, meetingController.deleteMeeting);
router.get("/:id/auto-questions", authMiddleware, meetingController.getAutoQuestions);

module.exports = router;
