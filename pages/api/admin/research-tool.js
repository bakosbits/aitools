import { generateToolResearch } from "@/lib/models/providers";
import { getAllCategories } from "@/lib/airtable/categories";
import { getAllUseCaseTags } from "@/lib/airtable/useCases";
import { getAllCautionTags } from "@/lib/airtable/cautions";

export default async function handler(req, res) {

    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { toolName, model } = req.body;

    if (!toolName) {
        return res.status(400).json({ message: "toolName is required" });
    }

    try {

        // 1. Get all available categories and tags
        const [categories, useCaseTags, cautionTags] = await Promise.all([
            getAllCategories(),
            getAllUseCaseTags(),
            getAllCautionTags(),
        ]);

        // 4. Generate new research data
        const researchResult = await generateToolResearch(
            toolName,
            model,
            categories,
            useCaseTags,
            cautionTags,
        );
        
        if (!researchResult) {
            throw new Error("Failed to generate research result");
        }

        res.status(200).json(researchResult);

    } catch (error) {
        console.error(
            "Full error from AI provider:",
            JSON.stringify(error, null, 2),
        );
        return res.status(500).json({
            message: `Failed to get data from AI provider: ${errorMessage}`,
        });
    }
}
