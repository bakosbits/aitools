import { getAllModalities, updateModalityTags } from '@/lib/airtable/modalities';
import { getAllTags } from '@/lib/airtable/tags';
import { generateModalityTags } from '@/lib/model/providers';
import { getTagTools } from '@/lib/airtable/tools';

async function handler(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
    });

    res.flushHeaders();

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

        const [modalities, tags, tagTools] = await Promise.all([
            getAllModalities(),
            getAllTags(),
        ]);

        const tagMap = new Map(tags.map(tag => [tag.Name, tag.id]));
        const availableTags = tags.map(tag => tag.Name);

        for (const modality of modalities) {
            try {
                const generatedTags = await  generateModalityTags(modality, availableTags, tagTools, model);
                if (generatedTags && generatedTags.Tags && generatedTags.Tags.length > 0) {
                    const tagIdsToUpdate = generatedTags.Tags
                        .map(tagName => {
                            const sanitizedTagName = tagName.toLowerCase().trim();
                            return tagMap.get(sanitizedTagName);
                        })
                        .filter(id => id);

                    if (tagIdsToUpdate.length > 0) {
                        await updateModalityTags(modality.id, tagIdsToUpdate);
                    }
                }
            } catch (error) {
                console.error(`Error processing modality ${modality.Name}:`, error);
            }
        }
        sendEvent('status', { message: "Bulk update for modality tags completed. " });
        res.end();
        return;
    } catch (error) {
        console.error("Error during bulk update for modality tags:", error);
        res.end();
        return;
    }
}

export default handler;
