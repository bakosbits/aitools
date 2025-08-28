import { getToolSummaries } from "@/lib/airtable/tools";
import { createManyFeatures, deleteAllFeatures } from "@/lib/airtable/features";
import { generateFeatures } from "@/lib/models/providers";
import { createSSEStream } from "@/lib/createSSEStream";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { model } = req.query;
    const { sendStatus, sendError, close } = createSSEStream(res);
    const clearedFeatures = await deleteAllFeatures();

    if (clearedFeatures) {
        const tools = await getToolSummaries();

        for (const tool of tools) {
            try {
                const generatedFeatures = await generateFeatures(tool, model);

                const featuresArray = Array.isArray(generatedFeatures.Feature)
                    ? generatedFeatures.Feature
                    : generatedFeatures;

                if (Array.isArray(featuresArray) && featuresArray.length > 0) {
                    await createManyFeatures(
                        featuresArray.map((f) => ({
                            Feature: f,
                            Tool: tool.Slug,
                        })),
                    );

                    sendStatus(`Added features for ${tool.Name}`);
                }
            } catch (error) {
                sendError(`Error processing tool ${tool.Name}: ${error.message}`);
                close();
            }
        }
    } else {
        sendStatus("Features were not cleared.");
        close();
    }
    sendStatus("Task Complete.");
    close();
}
