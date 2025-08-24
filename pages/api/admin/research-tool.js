import { generateToolResearch } from "@/lib/modelss/providers";
import { getAllCategories } from "@/lib/airtable/categories";
import { getAllUseCaseTags } from "@/lib/airtable/use-case-tags";
import { getAllCautionTags } from "@/lib/airtable/caution-tags";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { toolName, model } = req.body;

    if (!toolName) {
        return res.status(400).json({ message: "toolName is required" });
    }

    let categories = [];
    let useCaseTags = [];
    let cautionTags = [];

    try {
        [categories, useCaseTags, cautionTags] = await Promise.all([
            getAllCategories(),
            getAllUseCaseTags(),
            getAllCautionTags(),
        ]);
    } catch (error) {
        console.error("Error fetching data from Airtable:", error);
        return res.status(500).json({
            message: "Failed to fetch required data from the database. Please check the Airtable connection.",
        });
    }

    if (!categories || categories.length === 0) {
        return res.status(500).json({ message: "Could not find any tool categories in the database. Please add categories before researching." });
    }
    if (!useCaseTags || useCaseTags.length === 0) {
        return res.status(500).json({ message: "Could not find any tool tags in the database. Please add tags before researching." });
    }
    if (!cautionTags || cautionTags.length === 0) {
        return res.status(500).json({ message: "Could not find any caution tags in the database. Please add caution tags before researching." });
    }

    try {
        // 1. Run all research/generation and mapping first (NO DB SAVES YET)
        const researchResult = await generateToolResearch(toolName, model, categories, useCaseTags, cautionTags);


        // 2. Now save the tool and related data to Airtable
        // Map category names to their IDs         
        const categoryIds = (researchResult.Categories || [])
            .map(catName => {
                const found = categories.find(cat => cat.Name === catName);
                return found ? found.id : null;
            })
            .filter(Boolean);

        // Always overwrite Categories in the response with IDs, never names
        const response = {
            ...researchResult,
            Categories: categoryIds,
        };
        // Remove any possible Categories with names from the spread
        if (Array.isArray(response.Categories)) {
            response.Categories = categoryIds;
        }
        res.status(200).json(response);
    } catch (error) {
        console.error("Full error from AI provider:", JSON.stringify(error, null, 2));
        const errorMessage = error.message || "An unknown error occurred";
        if (errorMessage.includes("API key not valid")) {
            return res.status(401).json({
                message: "API key is not valid or missing. Please check your environment variables.",
            });
        }
        return res.status(500).json({
            message: `Failed to get data from AI provider: ${errorMessage}`,
        });
    }
}