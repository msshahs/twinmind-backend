const { OpenAI } = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.generateMeetingTitle = async (transcript) => {
    const prompt = `Generate a short, clear, and professional title for the following meeting transcript.\n\nTranscript:\n${transcript}\n\nTitle:`;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "Generate a short title for a meeting based on transcript.",
                },
                { role: "user", content: prompt },
            ],
            temperature: 0.5,
            max_tokens: 20,
        });

        const response = completion.choices?.[0]?.message?.content?.trim();

        // Remove surrounding quotes (single or double)
        const cleanTitle = response?.replace(/^["']+|["']+$/g, "").trim();

        return cleanTitle || "Meeting Title";
    } catch (err) {
        console.error("Title generation error:", err.message);
        return "Meeting Title";
    }
};
