// pages/api/quick-tools/quick-tools.js
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { toolType, inputText, company } = req.body; // 'company' is our honeypot

    // Honeypot check — return fake success
    if (company) {
        return res.status(200).json({ output: "" });
    }

    if (!toolType || !inputText) {
        return res.status(400).json({ error: "Missing toolType or inputText" });
    }

    const prompts = {
        headline: `Rewrite the following headline into five different versions with varied tones: ${inputText}`,
        tweet: `Expand the following idea into a 5–8 tweet Twitter thread: ${inputText}`,
        tagline: `Create five catchy taglines for this idea: ${inputText}`,
        image: `Generate three detailed descriptions for an image based on the following input:\n\n${inputText}`,
        blog: `Create a detailed blog post outline for the following topic:\n\n${inputText}`,
        quote: `Generate 3 meaningful quotes from the following input:\n\n${inputText}`,
    };

    const prompt = prompts[toolType] || `Respond to: ${inputText}`;

    try {
        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "google/gemini-2.5-flash",
                    messages: [{ role: "user", content: prompt }],
                }),
            },
        );

        const data = await response.json();
        res.status(200).json({
            output: data.choices?.[0]?.message?.content || "",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error generating output" });
    }
}
