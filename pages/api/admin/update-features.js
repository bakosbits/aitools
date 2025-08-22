import { getToolSummaries } from "@/lib/airtable/tools";
import { createMany as createFeatures } from "@/lib/airtable/features";
import { generateFeatures } from "@/lib/model/providers";
import { createSSEStream } from "@/lib/createSSEStream";

async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { model } = req.query;
    const { sendStatus, sendError, close } = createSSEStream(res);
    const tools = await getToolSummaries();

    for (const tool of tools) {
        try {
            const generatedFeatures = await generateFeatures(tool, model);

            const featuresArray = Array.isArray(generatedFeatures.Feature)
                ? generatedFeatures.Feature
                : generatedFeatures;

            if (Array.isArray(featuresArray) && featuresArray.length > 0) {
                await createFeatures(featuresArray.map(f => ({ Feature: f, Tool: tool.Slug })));

                sendStatus(`Added features for ${tool.Name}`);
            }


        } catch (error) {
            sendError(`Error processing tool ${tool.Name}: ${error.message}`);
        }
    }

    sendStatus("Bulk update for features completed.");
    close();
}

export default handler;
