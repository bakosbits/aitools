import { createSSEStream } from "@/lib/createSSEStream";
import { getToolSummaries } from "@/lib/airtable/tools";
import { getUseCasesByTool, getAllUseCaseTags, updateUseCaseTags } from "@/lib/airtable/useCases";
import { mapUseCaseTags } from "@/lib/models/providers";


export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { model } = req.query;
    const { sendStatus, sendError, close } = createSSEStream(res);
    const [tools, availableTags] = await Promise.all([
        getToolSummaries(),
        getAllUseCaseTags(),
    ]);
    const availableTagNames = availableTags.map((tag) => tag.Name);

    for (const tool of tools) {
        try {
            const useCases = await getUseCasesByTool(tool.Slug);

            const result = await mapUseCaseTags(
                tool,
                availableTagNames,
                model,
                useCases,
            );

            if (result && result.Tags && result.Tags.length > 0) {
                const validTags = result.Tags.map((tagName) => {
                    const foundTag = availableTags.find(
                        (tag) => tag.Name === tagName,
                    );
                    return foundTag ? foundTag.id : null;
                }).filter(Boolean);

                if (validTags.length > 0) {
                    await updateUseCaseTags(tool.id, validTags);
                    sendStatus(`Updated tags for tool: ${tool.Name}`);
                }
            }
        } catch (error) {
            console.error(`Error processing tool ${tool.Name}:`, error.message);            
            sendError(`An error occurred during update: ${error.message}`);
        }
    }
    sendStatus("Task Complete.");
    close();
}