import { getAllTools, updateToolCategories } from "@/lib/airtable/tools";
import { getAllCategories } from "@/lib/airtable/categories";
import { mapToolCategories } from "@/lib/models/providers";
import { createSSEStream } from "@/lib/createSSEStream";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { model } = req.query;
    const { sendStatus, sendError, close } = createSSEStream(res);

    const [tools, categories] = await Promise.all([
        getAllTools(),
        getAllCategories(),
    ]);

    const categoryNameMap = new Map(
        categories.map((cat) => [cat.Name, cat.id]),
    );
    const availableCategoryNames = categories.map((cat) => cat.Name);

    for (const tool of tools) {
        try {
            const generatedCategories = await mapToolCategories(
                tool,
                availableCategoryNames,
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