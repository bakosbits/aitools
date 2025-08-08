import { getAllTools, updateToolCategories } from "@/lib/airtable/tools";
import { getAllCategories } from "@/lib/airtable/categories";
import { generateToolCategories } from "@/lib/model/providers";

async function handler(req, res) {
    // Set the headers for Server-Sent Events (SSE) immediately
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        // This header can be crucial if you are behind a proxy like Nginx
        // that might buffer responses by default.
        'X-Accel-Buffering': 'no',
    });

    res.flushHeaders();

    // Helper function to send SSE messages
    const sendEvent = (event, data) => {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
        const model = req.query.model;

        if (!model) {
            sendEvent('fatal_error', { message: "Model is required." });
            res.end();
            return;
        }

        if (req.method !== "GET") {
            sendEvent('fatal_error', { message: "Method Not Allowed. Please use GET for stream." });
            res.end();
            return;
        }


        const [tools, categories] = await Promise.all([
            getAllTools(),
            getAllCategories(),
        ]);


        // Map category names to their IDs for the AI model and Airtable update
        const categoryNameMap = new Map(categories.map(cat => [cat.Name, cat.id]));
        const availableCategoryNames = categories.map(cat => cat.Name);

        for (const tool of tools) {
            try {
                const generatedCategories = await generateToolCategories(tool, availableCategoryNames, model);

                if (generatedCategories && generatedCategories.Categories && generatedCategories.Categories.length > 0) {
                    // Convert category names returned by AI to their corresponding IDs
                    const categoryIdsToUpdate = generatedCategories.Categories
                        .map(catName => categoryNameMap.get(catName))
                        .filter(id => id); // Filter out any undefined IDs if a name wasn't found

                    if (categoryIdsToUpdate.length > 0) {
                        await updateToolCategories(tool.id, categoryIdsToUpdate);
                    }
                }
            } catch (error) {
                console.error(`Error processing tool ${tool.Name}:`, error);
            }
        }
        sendEvent('status', { message: "The bulk update for tool categories is complete. " });
        res.end();
        return;
    } catch (error) {
        console.error("Error during bulk update for tool tags:", error);
        res.end();
        return;
    }
}

export default handler;
