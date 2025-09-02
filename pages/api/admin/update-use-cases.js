import { getToolSummaries } from "@/lib/airtable/tools";
import { createManyUseCases, deleteAllUseCases } from "@/lib/airtable/useCases";
import { generateUseCases } from "@/lib/models/providers";
import { createSSEStream } from "@/lib/createSSEStream";

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

                const useCasesArray = Array.isArray(generatedUseCases.UseCase)
                    ? generatedUseCases.UseCase
                    : generatedUseCases;

                if (Array.isArray(useCasesArray) && useCasesArray.length > 0) {
                    await createManyUseCases(
                        useCasesArray.map((f) => ({
                            UseCase: f,
                            Tool: tool.Slug,
                        })),
                    );

                    sendStatus(`Added useCases for ${tool.Name}`);
                }
            } catch (error) {
                sendError(`Error processing tool ${tool.Name}: ${error.message}`);
                close();
            }
        }
    } else {
        sendStatus("Use cases were not cleared.");
        close();
    }
    sendStatus("Task Complete.");
    close();
}
