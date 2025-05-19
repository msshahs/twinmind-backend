const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        transcript: { type: String, default: "" },
        summary: {
            topics: [String],
            actions: [String],
            notes: [String]
        },
        chatLog: [
            {
                role: { type: String, enum: ["user", "assistant"], required: true },
                text: { type: String, required: true },
            },
        ],
        title: { type: String, default: "Untitled Meeting" },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Meeting", meetingSchema);