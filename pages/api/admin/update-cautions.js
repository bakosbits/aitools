import {
    createManyCautions,
    getAllTools,
    deleteAllCautions,
} from "@/lib/airtable";
import { generateCautions } from "@/lib/models/providers";
import { createSSEStream } from "@/lib/createSSEStream";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { model } = req.query;
    const { sendStatus, sendError, close } = createSSEStream(res);
    const clearedCautions = await deleteAllCautions();

    if (clearedCautions) {
        const tools = await getAllTools(); // Use getAllTools from airtable.js
        for (const tool of tools) {
            try {
                const generatedCautions = await generateCautions(tool, model);

                const cautionsArray = Array.isArray(generatedCautions.Caution)
                    ? generatedCautions.Caution
                    : generatedCautions;

                if (Array.isArray(cautionsArray) && cautionsArray.length > 0) {
                    await createManyCautions(
                        cautionsArray.map((c) => ({
                            Caution: c,
                            Tool: tool.Slug,
                        })),
                    );

                    sendStatus(`Added cautions for ${tool.Name}`);
                }
            } catch (error) {
                sendError(
                    `Error processing tool ${tool.Name}: ${error.message}`,
                );
                close();
            }
        }
    } else {
        sendStatus("Cautions were not cleared.");
        close();
    }
    sendStatus("Bulk update for features completed.");
    close();
}
