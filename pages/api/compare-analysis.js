import { generateCompareAnalysis } from "@/lib/model/providers";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { toolA, toolB, toolAItems, toolBItems, type } = req.body;

    console.log("API received request body:", req.body);
    console.log("toolA:", toolA);
    console.log("toolB:", toolB);
    console.log("toolAItems:", toolAItems);
    console.log("toolBItems:", toolBItems);
    console.log("type:", type);

    if (!toolA || !toolB || !toolAItems || !toolBItems || !type) {
        console.error("Missing required parameters in API request.");
        return res.status(400).json({ message: "Missing required parameters." });
    }

    try {
        const stream = await generateCompareAnalysis(toolA, toolB, toolAItems, toolBItems, type);

        res.writeHead(200, {
            "Content-Type": "text/plain; charset=utf-8",
            "Transfer-Encoding": "chunked",
        });

        // Pipe the stream to the response
        for await (const chunk of stream) {
            res.write(chunk);
        }
        res.end();
    } catch (error) {
        console.error("Error in compare-analysis API:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}