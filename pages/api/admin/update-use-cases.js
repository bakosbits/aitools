import { getToolSummaries } from "@/lib/airtable/tools";
import { createUseCase } from "@/lib/airtable/use-cases";
import { generateUseCases } from "@/lib/modelss/providers";
import { createSSEStream } from "@/lib/createSSEStream";
import { deleteAllUseCases } from "@/lib/airtable/bulk-delete";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { model } = req.query;
    const { sendStatus, sendError, close } = createSSEStream(res);
    const clearedUseCases = await deleteAllUseCases();

    if (clearedUseCases) {
        const tools = await getToolSummaries();
        for (const tool of tools) {
            try {
                const generatedUseCases = await generateUseCases(tool, model);
                if (
                    generatedUseCases &&
                    Array.isArray(generatedUseCases.UseCases) &&
                    generatedUseCases.UseCases.length > 0
                ) {
                    for (const useCaseText of generatedUseCases.UseCases) {
                        if (useCaseText && useCaseText.trim()) {
                            await createUseCase({ Tool: tool.Slug, UseCase: useCaseText });
                            sendStatus(`Added use case for ${tool.Name}`);
                        }
                    }
                }
            } catch (error) {
                sendError(`An error occurred during update: ${error.message}`);
            }
        }
        
    } else {
        sendStatus("Use cases were not cleared.");
        close();
    }

    sendStatus("Task Complete.");
    close();
}
