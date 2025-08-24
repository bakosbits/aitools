import { sendImageIdeasEmail } from "@/lib/email";
import { createArticlePrompt } from "@/lib/models/prompts";
import { getArticleSchema } from "@/lib/models/schemas";
import {
    _generateWithOpenRouter,
    createOpenAITool,
    generateDataForEntity,
} from "@/lib/models/providers";

export async function generateArticleContent(
    topic,
    model,
    articleType = "blog",
) {
    // Default to a fast and capable OpenRouter model if none is provided.
    const effectiveModel = model || "google/gemini-2.5-flash";
    const schema = getArticleSchema();

    const researchTool = createOpenAITool(
        schema,
        "format_tool_research",
        "Formats the research findings for the specified AI tool.",
    );

    const prompt = createArticlePrompt(topic, articleType);

    const result = await generateDataForEntity(
        prompt,
        researchTool,
        effectiveModel,
    );

    // After getting the result, check for image ideas and send the email
    if (result.ImageIdeas && result.ImageIdeas.length > 0) {
        // Use the AI-generated title for the email subject
        const articleTitle = result.Title || topic;
        // Send email in the background, don't wait for it to complete
        sendImageIdeasEmail(articleTitle, result.ImageIdeas).catch(
            console.error,
        );
    }

    // Return the original result to the API handler
    return result;
}
