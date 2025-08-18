import { getAllTools } from "@/lib/airtable/tools";
import { createCaution } from "@/lib/airtable/cautions";
import { generateCautions } from "@/lib/model/providers";
import { createSSEStream } from "@/lib/createSSEStream";

async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { model } = req.query;
    const { sendStatus, sendError, close } = createSSEStream(res);
    const tools = await getAllTools();

    for (const tool of tools) {
        try {
            const generatedCautions = await generateCautions(tool, model);

            if (
                generatedCautions &&
                generatedCautions.Caution &&
                generatedCautions.Caution.length > 0
            ) {
                for (const cautionText of generatedCautions.Caution) {
                    await createCaution({
                        Tool: tool.Slug,
                        Caution: cautionText,
                    });
                    sendStatus(
                        `Added caution for ${tool.Name}: ${cautionText}`,
                    );
                }
            }
        } catch (error) {
            sendError(`Error processing tool ${tool.Name}: ${error.message}`);
        }
    }

    sendStatus("Bulk update for cautions completed.");
    close();
}

export default handler;
