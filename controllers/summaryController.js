const { OpenAI } = require("openai");
const Meeting = require("../models/Meeting");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Generate summary from the transcript recorded and with GPT-40 model
exports.generateSummary = async (req, res) => {
    const { meetingId } = req.body;

    if (!meetingId) {
        return res.status(400).json({ success: false, error: "meetingId required" });
    }

    try {
        const meeting = await Meeting.findOne({
            _id: meetingId,
            userId: req.user._id,
        });

        if (!meeting || !meeting.transcript) {
            return res.status(404).json({ success: false, error: "Meeting not found or transcript missing" });
        }

        const systemPrompt = `You are a professional AI meeting summarizer. Your job is to extract clear, structured, and detailed summaries from meeting transcripts.

Return a JSON object like:
{
  "topics": ["Summarized bullet points of key discussion areas in depth."],
  "actions": ["Clearly outlined tasks, assignments, or decisions made."],
  "notes": ["Other observations, insights, or context mentioned."]
}

Make sure each section has multiple meaningful points. Emphasize:
- Names, dates, deadlines
- Goals, blockers, agreements
- Follow-ups or pending items

Keep the language professional and informative.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            temperature: 0.4,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: meeting.transcript },
            ],
        });

        let raw = completion.choices[0].message.content;
        raw = raw.replace(/```json|```/g, "").trim();

        let summary;
        try {
            summary = JSON.parse(raw);
        } catch (err) {
            console.error("Failed to parse GPT response as JSON:", raw);
            return res.status(500).json({
                success: false,
                error: "AI did not return valid JSON. Please try again.",
            });
        }

        meeting.summary = summary;
        await meeting.save();

        res.json({ success: true, summary });
    } catch (err) {
        console.error("Summary generation failed:", err.message);
        res.status(500).json({ success: false, error: "Failed to generate summary" });
    }
};
