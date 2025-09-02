// pages/api/quick-tools/quick-tools.js
import { generateQuickContent } from "@/lib/models/providers";

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

    try {
        const output = await generateQuickContent(toolType, inputText);
        res.status(200).json({ output });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error generating output" });
    }
}
