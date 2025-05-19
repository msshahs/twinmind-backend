const Meeting = require("../models/Meeting");
const { OpenAI } = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


// API for creating new meeting.
exports.createMeeting = async (req, res) => {
    try {
        const meeting = await Meeting.create({ userId: req.user._id });
        res.json({ success: true, meeting });
    } catch (err) {
        console.error("Create meeting error:", err);
        res.status(500).json({ error: "Failed to create meeting" });
    }
};

// API to get a list of all meetings
exports.getAllMeetings = async (req, res) => {
    try {
        const meetings = await Meeting.find({ userId: req.user._id });
        res.json({ success: true, meetings });
    } catch (err) {
        console.error("Fetch meetings error:", err);
        res.status(500).json({ error: "Failed to fetch meetings" });
    }
};

// Rename Meeting titled initially Untitled
exports.updateMeetingTitle = async (req, res) => {
    const { title } = req.body;
    try {
        const meeting = await Meeting.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { title },
            { new: true }
        );
        res.json({ success: true, meeting });
    } catch (err) {
        console.error("Update title error:", err);
        res.status(500).json({ error: "Update failed" });
    }
};

// Get Meeting by Meeting Id
exports.getMeetingById = async (req, res) => {
    try {
        const meeting = await Meeting.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!meeting) {
            return res.status(404).json({ success: false, error: "Meeting not found" });
        }

        res.json({ success: true, meeting });
    } catch (err) {
        console.error("Error fetching meeting:", err);
        res.status(500).json({ success: false, error: "Server error" });
    }
};

// Delete Meeting with help of id
exports.deleteMeeting = async (req, res) => {
    try {
        const deleted = await Meeting.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!deleted) {
            return res.status(404).json({ success: false, error: "Meeting not found" });
        }

        res.json({ success: true, message: "Meeting deleted successfully" });
    } catch (err) {
        console.error("Delete error:", err.message);
        res.status(500).json({ success: false, error: "Failed to delete meeting" });
    }
};

// Generates Top 3 Questions as per the transcript recorded automatically every 30 seconds
exports.getAutoQuestions = async (req, res) => {
    try {
        const meetingId = req.params.id;
        const meeting = await Meeting.findById(meetingId);

        if (!meeting) {
            return res.status(404).json({ success: false, error: "Meeting not found" });
        }

        const transcriptText = meeting.transcript || "";
        if (!transcriptText.trim()) {
            return res.status(400).json({ success: false, error: "Transcript is empty" });
        }

        const prompt = `You are a helpful assistant. Based on the meeting transcript below, generate the **top 3 insightful questions** a participant might ask — along with **detailed answers**.

Please respond in **valid JSON format**, like:

[
  {
    "question": "What is the deadline for the project?",
    "answer": "The deadline is next Friday, May 24."
  },
  {
    "question": "Who will handle frontend development?",
    "answer": "Alice is responsible for frontend work."
  },
  {
    "question": "What tools are we using?",
    "answer": "The team agreed on using React, MongoDB, and TailwindCSS."
  }
]

Transcript:
${transcriptText}`;

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            temperature: 0.6,
            messages: [
                {
                    role: "system",
                    content:
                        "You are a helpful assistant. Only respond with strict JSON in the specified format. Do not include any explanation or extra text.",
                },
                { role: "user", content: prompt },
            ],
        });

        const textOutput = response.choices[0]?.message?.content?.trim();
        let qa = [];
        try {
            qa = JSON.parse(textOutput);
        } catch (err) {
            console.error("Failed to parse GPT response:", textOutput);
            return res.status(500).json({
                success: false,
                error: "Failed to parse AI output. Check logs for GPT response.",
            });
        }

        res.json({ success: true, qa });
    } catch (err) {
        console.error("Auto-question generation error:", err);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};
