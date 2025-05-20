const { OpenAI } = require("openai");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const Meeting = require("../models/Meeting");
const { generateMeetingTitle } = require("../utils/generateTitle");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
ffmpeg.setFfmpegPath(ffmpegPath);


exports.uploadAudioAndTranscribe = async (req, res) => {
    try {
        const { meetingId } = req.body;
        const audioBuffer = req.file?.buffer;

        if (!meetingId || !audioBuffer) {
            return res.status(400).json({ success: false, error: "Missing data" });
        }

        const meeting = await Meeting.findById(meetingId);
        if (!meeting) {
            return res.status(404).json({ success: false, error: "Meeting not found" });
        }

        const webmPath = path.join(__dirname, "..", "uploads", "audio", `chunk_${Date.now()}.webm`);
        fs.mkdirSync(path.dirname(webmPath), { recursive: true });
        fs.writeFileSync(webmPath, audioBuffer);

        const mp3Path = webmPath.replace(".webm", ".mp3");

        await new Promise((resolve, reject) => {
            ffmpeg(webmPath)
                .audioCodec("libmp3lame")
                .toFormat("mp3")
                .on("end", resolve)
                .on("error", reject)
                .save(mp3Path);
        });

        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(mp3Path),
            model: "whisper-1",
            response_format: "text",
        });

        const line = transcription;
        if (line) {
            meeting.transcript = (meeting.transcript || "") + `\n${line}`;

            if (meeting.title === "Untitled Meeting") {
                try {
                    const title = await generateMeetingTitle(meeting.transcript);
                    if (title) {
                        meeting.title = title;
                        console.log(title);
                    }
                } catch (titleErr) {
                    console.warn("⚠️ Title generation failed:", titleErr.message);
                }
            }

            await meeting.save();
        }

        fs.unlinkSync(webmPath);
        fs.unlinkSync(mp3Path);

        res.json({ success: true, transcript: line, title: meeting.title });
    } catch (err) {
        console.error("Upload error:", err.response?.data || err.message);
        res.status(500).json({ success: false, error: "Transcription failed" });
    }
};

// Live chat with transcript stream in chat section
exports.chatWithTranscriptStream = async (req, res) => {
    try {
        const { meetingId, question } = req.body;
        if (!meetingId || !question) {
            return res.status(400).json({ success: false, error: "Missing meetingId or question" });
        }

        const meeting = await Meeting.findById(meetingId);
        if (!meeting || meeting.userId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ success: false, error: "Meeting not found or access denied" });
        }

        const transcript = meeting.transcript || "";
        if (!transcript.trim()) {
            return res.status(400).json({ success: false, error: "Transcript is empty" });
        }

        const prompt = `Meeting Transcript:\n${transcript}\n\nUser Question: ${question}\n\nBased on the above transcript, provide a concise and helpful answer.`;

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        const stream = await openai.chat.completions.create({
            model: "gpt-4",
            stream: true,
            messages: [
                { role: "system", content: "You are an AI assistant helping users understand their meetings." },
                { role: "user", content: prompt },
            ],
        });

        let answerText = "";
        for await (const chunk of stream) {
            const content = chunk.choices?.[0]?.delta?.content;
            if (content) {
                res.write(`data: ${content}\n\n`);
                answerText += content;
            }
        }

        if (!meeting.chatLog) meeting.chatLog = [];
        meeting.chatLog.push({ role: "user", text: question });
        meeting.chatLog.push({ role: "assistant", text: answerText });
        await meeting.save();

        res.end();
    } catch (err) {
        console.error("Streaming chat error:", err);
        res.status(500).write("data: Error generating response\n\n");
        res.end();
    }
};

//Get chat of user with AI
exports.getChatHistory = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.meetingId);
        if (!meeting || meeting.userId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ success: false, error: "Meeting not found or access denied" });
        }
        res.json({ success: true, chat: meeting.chatLog || [] });
    } catch (err) {
        console.error("Fetch chat history error:", err);
        res.status(500).json({ success: false, error: "Unable to fetch chat history" });
    }
};
