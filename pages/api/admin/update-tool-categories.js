import { getToolSummaries, updateToolCategories } from "@/lib/airtable/tools";
import { getAllCategories } from "@/lib/airtable/categories";
import { getAllFeatures } from "@/lib/airtable/features"
import { mapToolCategories } from "@/lib/modelss/providers";
import { createSSEStream } from "@/lib/createSSEStream";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { model } = req.query;
    const { sendStatus, sendError, close } = createSSEStream(res);

    const [tools, categories, features] = await Promise.all([
        getToolSummaries(),
        getAllCategories(),
        getAllFeatures()
    ]);

    const featuresByTool = new Map();
    for (const feature of features) {
        if (!featuresByTool.has(feature.Tool)) {
            featuresByTool.set(feature.Tool, []);
        }
        featuresByTool.get(feature.Tool).push(feature);
    }

    const categoryNameMap = new Map(
        categories.map((cat) => [cat.Name, cat.id]),
    );

    const availableCategoryNames = categories.map((cat) => cat.Name);
    for (const tool of tools) {
        try {

            const toolFeatures = featuresByTool.get(tool.Slug);
            const availableFeatures = toolFeatures.map((feat) => feat.Feature);
            const generatedCategories = await mapToolCategories(
                tool,
                availableCategoryNames,
                availableFeatures,
                model,
            );

            if (
                generatedCategories &&
                generatedCategories.Categories &&
                generatedCategories.Categories.length > 0
            ) {
                const categoryIdsToUpdate = generatedCategories.Categories.map(
                    (catName) => categoryNameMap.get(catName),
                ).filter((id) => id);

                if (categoryIdsToUpdate.length > 0) {
                    await updateToolCategories(tool.id, categoryIdsToUpdate);
                    sendStatus(`Updated categories for ${tool.Name}`);
                }
            }
        } catch (error) {
            sendError(`Error processing tool ${tool.Name}: ${error.message}`);
        }
    }
    sendStatus("Task Complete");
    close();
}


