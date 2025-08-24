import { createSSEStream } from "@/lib/createSSEStream";
import {
    getToolSummaries,
    updateCautionTags,
    getCautionsByTool,
    getAllCautionTags,
} from "@/lib/airtable";
import { mapCautionTags } from "@/lib/models/providers";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { model } = req.query;
    const { sendStatus, sendError, close } = createSSEStream(res);
    const [tools, availableTags] = await Promise.all([
        getToolSummaries(), // Reverted to getToolSummaries()
        getAllCautionTags(),
    ]);
    const availableTagNames = availableTags.map((tag) => tag.Name);

    for (const tool of tools) {
        try {
            const cautions = await getCautionsByTool(tool.Slug);

            const result = await mapCautionTags(
                tool,
                availableTagNames,
                model,
                cautions,
            );

            if (result && result.Tags && result.Tags.length > 0) {
                const validTags = result.Tags.map((tagName) => {
                    const foundTag = availableTags.find(
                        (tag) => tag.Name === tagName,
                    );
                    return foundTag ? foundTag.id : null;
                }).filter(Boolean);

                if (validTags.length > 0) {
                    await updateCautionTags(tool.id, validTags);
                    sendStatus(`Updated tags for tool: ${tool.Name}`);
                }
            }
        } catch (error) {
            console.error(`Error processing tool ${tool.Name}:`, error.message);
            sendError(`Skipping tool ${tool.Name} due to an error.`);
        }
    }
    sendStatus("Task Complete.");
    close();
}
