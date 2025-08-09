import { getAllCategories, updateCategoryTags } from '@/lib/airtable/categories';
import { getAllTags } from '@/lib/airtable/tags';
import { generateCategoryTags } from '@/lib/model/providers';
import { getTagTools } from '@/lib/airtable/tools';

async function handler(req, res) {
    // Set the headers for Server-Sent Events (SSE) immediately
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        // This header can be crucial if you are behind a proxy like Nginx
        // that might buffer responses by default.
        'X-Accel-Buffering': 'no',
    });

    res.flushHeaders();

    // Helper function to send SSE messages
    const sendEvent = (event, data) => {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
        const model = req.query.model;

        if (!model) {
            sendEvent('fatal_error', { message: 'Model is required.' });
            res.end();
            return;
        }

        if (req.method !== 'GET') {
            sendEvent('fatal_error', { message: 'Method Not Allowed. Please use GET for stream.' });
            res.end();
            return;
        }

        const [categories, tags, tagTools] = await Promise.all([
            getAllCategories(),
            getAllTags(),
            getTagTools()
        ]);

        const tagMap = new Map(tags.map(tag => [tag.Name.toLowerCase().trim(), tag.id]));
        const availableTags = tags.map(tag => tag.Name);

        // This loop will now send updates as each category is processed
        for (const category of categories) {
            try {
                const generatedTags = await generateCategoryTags(category, availableTags, model, tagTools);

                if (generatedTags && generatedTags.Tags && generatedTags.Tags.length > 0) {
                    const tagIdsToUpdate = generatedTags.Tags
                        .map(tagName => {
                            const sanitizedTagName = tagName.toLowerCase().trim();
                            return tagMap.get(sanitizedTagName);
                        })
                        .filter(Boolean);

                    if (tagIdsToUpdate.length > 0) {
                        await updateCategoryTags(category.id, tagIdsToUpdate);
                    }
                }
            } catch (error) {
                console.error(`Error processing category ${category.Name}:`, error);
            }
        }
        sendEvent('status', { message: 'Bulk update for category tags completed.' });
        res.end();
    } catch (error) {
        console.error('Error during bulk update for category tags:', error);
    }
}

export default handler;

