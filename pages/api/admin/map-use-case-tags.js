import { createSSEStream } from "@/lib/createSSEStream";
import { getToolsForTagUpdates, updateUseCaseTags } from "@/lib/airtable/tools";
import { getAllUseCaseTags } from "@/lib/airtable/use-cases";
import { getUseCasesByTool } from "@/lib/airtable/use-cases";
import { mapUseCaseTags } from "@/lib/model/providers";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { model } = req.query;
    const { sendStatus, sendError, close } = createSSEStream(res);
    const [tools, availableTags] = await Promise.all([
        getToolsForTagUpdates(),
        getAllUseCaseTags(),
    ]);
    const availableTagNames = availableTags.map((tag) => tag.Name);

    for (const tool of tools) {
        try {
            const useCases = await getUseCasesByTool(tool.Slug);

            if (useCases?.length > 0) {
                const useCases = useCases.map((u) => u.UseCase);
                const result = await mapUseCaseTags(
                    tool,
                    availableTagNames,
                    model,
                    useCases,
                );
                const validTags = (result?.Tags || [])
                    .map(
                        (tagName) =>
                            availableTags.find((tag) => tag.Name === tagName)
                                ?.id,
                    )
                    .filter(Boolean);

                if (validTags.length > 0) {
                    await updateUseCaseTags(tool.id, validTags);
                    sendStatus(`Updated tags for tool: ${tool.Name}`);
                }
            }
        } catch (error) {
            sendError(`An error occurred during update: ${error.message}`);
        }
    }
    sendStatus("Task Complete.");
    close();
}
