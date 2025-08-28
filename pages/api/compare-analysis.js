import { generateComparisonAnalysis } from "@/lib/models/providers";
import { getUseCasesByTool } from "@/lib/airtable/useCases";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { toolA, toolB, category } = req.body;

    if (!toolA || !toolB || !category) {
        return res.status(400).json({ message: "Missing required data: toolA, toolB, and category are required." });
    }

    try {
        const { useCasesA, useCasesB } = await Promise.all([
            getUseCasesByTool(toolA.Slug),
            getUseCasesByTool(toolB.Slug),
        
        ]);

        const analysis = await generateComparisonAnalysis(toolA, toolB, useCasesA, useCasesB, category);
        return res.status(200).json(analysis);
    } catch (error) {
        console.error("Error generating comparison analysis:", error);
        return res.status(500).json({ message: "Failed to generate comparison analysis.", error: error.message });
    }
}
