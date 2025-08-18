// pages/api/extract-quotes.js
import { fetch } from "undici";

function extractQuotesFromText(text) {
    // Simple regex for sentences in quotes, or fallback to long sentences
    const quoteRegex = /[“"']([^”"']{10,})[”"']/g;
    const matches = [];
    let match;
    while ((match = quoteRegex.exec(text))) {
        matches.push(match[1].trim());
    }
    // If no matches, fallback to long sentences
    if (matches.length === 0) {
        matches.push(...(text.match(/[^.!?\n]{40,}[.!?]/g) || []));
    }
    return matches.slice(0, 10); // Limit to 10 quotes
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }
    const { url, text } = req.body || {};
    let content = text || "";

    if (inputText.startsWith("http")) {
        try {
            const response = await fetch(inputText);
            const html = await response.text();
            // Very basic text extraction from HTML
            content = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
        } catch (err) {
            return res.status(400).json({ error: "Failed to fetch URL." });
        }
    }
    if (!content || content.length < 20) {
        return res
            .status(400)
            .json({ error: "No content to extract quotes from." });
    }
    const quotes = extractQuotesFromText(content);
    res.status(200).json({ quotes });
}
