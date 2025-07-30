import OpenAI from "openai";
import { PRICING_OPTIONS } from "@/lib/constants";
import { sendImageIdeasEmail } from "@/lib/email";

// --- Schema Definitions ---

// This is the base schema definition, used by both providers.
const getBaseSchema = (categoryNames) => ({
    "Name": {
        type: "STRING",
        description: "Required - The official name of the tool."
    },
    "Domain": {
        type: "STRING",
        description: "Required - The main domain of the tool's website (e.g., figma.com)."
    },
    "Website": {
        type: "STRING",
        description: "Required - The official website of the tool."
    },
    "Why": {
        type: "STRING",
        description: "Required - A concise single sentence explaining why someone should care about this tool."
    },
    "Description": {
        type: "STRING",
        description: "Required - A very short paragraph, 2 sentences, on why someone would use this tool."
    },
    "Details": {
        type: "STRING",
        description: "Required - A more in-depth paragraph about the tool's capabilities."
    },
    "Features": {
        type: "ARRAY",
        items: { type: "STRING" },
        description: "Required - An array of 5 separate strings. Each string should be a distinct key feature as a short sentence."
    },
    "Cautions": {
        type: "ARRAY",
        items: { type: "STRING" },
        description: "Required - An array of 3 separate strings. Each string should be a distinct caution as a short sentence."
    },
    "Buyer": {
        type: "STRING",
        description: "Required - A short paragraph about who would best benefit from purchasing this tool."
    },
    "Pricing": {
        type: "ARRAY",
        items: {
            type: "STRING",
            enum: PRICING_OPTIONS
        },
        description: "One or more of these predefined price models."
    },
    "Base_Model": { type: "STRING", description: "Required - Identify the underlying AI or Machine Learning technology. If it's a known LLM (like GPT-4), name it. If not, describe the type of AI used (e.g., 'Proprietary computer vision model', 'Diffusion model'). This field must not be empty." },
    "Tags": {
        type: "ARRAY",
        items: { type: "STRING" },
        description: "An array of seperate strings, with each string being a tag for a tag cloud (3 to 7 cloud tags total)."
    },
    "Categories": {
        type: "ARRAY",
        items: {
            type: "STRING",
            enum: categoryNames,
        },
        description: "Select one or more professions the tool is designed for from the provided categoryNames list."
    }
});

// This is the schema for a new blog post.
const getArticleSchema = () => ({
    "Title": {
        type: "STRING",
        description: "Required - A catchy, SEO-friendly title for the article. It should be different from the input topic if possible, but related."
    },
    "Summary": {
        type: "STRING",
        description: "Required - A short (155-160 characters) summary or meta description for search engines."
    },
    "Content": {
        type: "STRING",
        description: "Required - The full content of the blog post, written in engaging and informative markdown, following the requested layout (e.g., how-to, affiliate, general)."
    },
    "ImageIdeas": {
        type: "ARRAY",
        items: { type: "STRING" },
        description: "Required - An array of 3 to 5 distinct image ideas. Each string should be a detailed description suitable for an image generation AI."
    }
});

// --- Schema Converters ---

/**
 * Creates a generic tool definition for OpenAI/OpenRouter function calling.
 * @param {object} schema The input schema definition.
 * @param {string} functionName The name for the tool function.
 * @param {string} functionDescription The description for the tool function.
 * @returns {object} The formatted tool object.
 */
const createOpenAITool = (schema, functionName, functionDescription) => {
    const properties = {};
    const required = [];
    const typeMap = { "STRING": "string", "ARRAY": "array" };

    for (const [key, value] of Object.entries(schema)) {
        properties[key] = {
            type: typeMap[value.type],
            description: value.description,
        };
        if (value.items) {
            properties[key].items = { type: typeMap[value.items.type] };
            if (value.items.enum) {
                properties[key].items.enum = value.items.enum;
            }
        }
        if (value.enum) {
            properties[key].enum = value.enum;
        }
        if (value.description && value.description.toLowerCase().startsWith("required")) {
            required.push(key);
        }
    }
    return {
        type: "function",
        function: {
            name: functionName,
            description: functionDescription,
            parameters: { type: "object", properties, required },
        },
    };
};

// --- Provider Implementations ---

/**
 * A generic function to make a chat completion request to OpenRouter with a specified tool.
 * @param {string} prompt The user prompt for the AI.
 * @param {object} tool The tool definition object.
 * @param {string} modelName The name of the model to use.
 * @returns {Promise<object>} The parsed JSON arguments from the tool call.
 */
const _generateWithOpenRouter = async (prompt, tool, modelName) => {
    const openRouter = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
        defaultHeaders: {
            "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
            "X-Title": process.env.SITE_TITLE || "AI Tool Pouch Admin",
        },
    });

    const response = await openRouter.chat.completions.create({
        model: modelName,
        messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
        tools: [tool],
        tool_choice: { type: "function", function: { name: tool.function.name } },
    });

    const toolCall = response.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== tool.function.name) {
        throw new Error(`OpenRouter did not return the expected tool call for '${tool.function.name}'.`);
    }
    return JSON.parse(toolCall.function.arguments);
}

// --- Main Exported Function ---

export async function generateToolResearch(toolName, modelName, categoryNames) {
    // Default to a fast and capable OpenRouter model if none is provided.
    const effectiveModel = modelName || "anthropic/claude-3.5-haiku";
    const schema = getBaseSchema(categoryNames);
    const tool = createOpenAITool(schema, "format_tool_research", "Formats the research findings for the specified AI tool.");
    const prompt = `You are an expert AI tool researcher. Research the tool named "${toolName}". Based on your research, identify the most relevant professional categories for this tool. Available Categories: ${categoryNames.join(', ')}. It is critical that all 'Required' fields in the schema are filled accurately and not left empty. Then, call the 'format_tool_research' function with the results.`;

    return _generateWithOpenRouter(prompt, tool, effectiveModel);
}

export async function generateArticleContent(topic, modelName, articleType = 'General') {
    // Default to a fast and capable OpenRouter model if none is provided.
    const effectiveModel = modelName || "anthropic/claude-3.5-haiku";
    const schema = getArticleSchema();
    const tool = createOpenAITool(schema, "format_article_content", "Formats the generated blog post content.");

    let prompt;
    const basePrompt = `You are an expert content writer and SEO specialist. It is critical that all 'Required' fields in the schema are filled accurately and not left empty.

When writing the 'Content', you must use standard Markdown for styling:
- Use '##' for main section headings (H2).
- Use '###' for sub-headings (H3).
- Use '**bold text**' for emphasis.
- Use '*italic text*' for nuance.
- Use bulleted lists with '*' or '-' for key points.
- Use numbered lists for sequential steps.
- Use > to highlight any compelling statements.

After generating the blog content, populate the 'ImageIdeas' field with 3-5 distinct image ideas. Each idea should be a detailed description with a 16:9 format, suitable for Midjourney.

Finally, call the 'format_article_content' function with all the results.`;

    switch (articleType) {
        case 'Affiliate':
            prompt = `You are an expert affiliate marketer and SEO content writer. Your goal is to persuade the reader to click an affiliate link and make a purchase by providing valuable information and building trust.

Write a comprehensive and persuasive affiliate blog post about "${topic}". The blog post should be between 2250-3000 words.

In addition to the title and the summary, the article must follow this structure exactly:

1.  **Introduction**: Hook the reader by identifying a common problem. Briefly introduce the product as the solution and state what the reader will learn.
2.  **Product Deep Dive**: Explain what the product is. Use bullet points for key features and their direct benefits. Explain how it solves the reader's problem.
3.  **Why This Product (Unique Selling Proposition)**: Explain what makes this product better than alternatives. Highlight its unique selling points.
4.  **Pros & Cons**: Provide a balanced view to build trust.
5.  **Who Is This For?**: Clearly define the ideal user for this product.
6.  **Conclusion**: Summarize what makes this tool a compelling choice for the reader and include a clear CTA (call to action).


${basePrompt}`;
            break;
        case 'How-To':
            prompt = `You are an expert technical writer. Your goal is to provide clear, step-by-step instructions that enable the reader to achieve a specific outcome or solve a problem.

Write a detailed how-to guide on the topic of "${topic}".

The article must follow this structure exactly:
1.  **Clear, Action-Oriented Title**: Tells the reader exactly what they will learn to do.
2.  **Introduction**: Hook the reader by stating the problem the "how-to" solves or the benefit of learning this skill. Clearly state what the reader will achieve and briefly mention the difficulty level or time commitment.
3.  **Prerequisites/Tools/Materials Needed**: A concise list of everything the reader needs before starting (e.g., software, hardware, accounts, ingredients).
4.  **Step-by-Step Instructions**: Numbered steps with clear, concise headings for each step. Use simple, direct language. Focus on one action per step.
5.  **Conclusion**: Summarize the outcome, offer encouragement, and optionally provide a "What's Next?" section.
6.  **Troubleshooting Tips (Optional)**: List common issues and their solutions.

${basePrompt}`;
            break;
        case 'General':
        default:
            prompt = `You are an expert content writer. Your goal is to inform, entertain, engage, or share opinions on a topic in a flexible format.

Write a comprehensive and engaging general blog post about "${topic}".

The article must follow this structure exactly:
1.  **Engaging Title**: Hook the reader and reflect the post's tone (e.g., informational, curious, opinionated).
2.  **Introduction**: Grab attention with a compelling hook (a question, anecdote, or surprising statistic). Introduce the main topic and set the tone.
3.  **Main Points/Arguments/Narrative**: Break down the content into logical sections with clear subheadings. Each section should develop a key idea, argument, or part of the story, supported by examples or data.
4.  **Conclusion**: Summarize the main takeaways or re-emphasize the core message. Offer a final thought or a call to reflection.

${basePrompt}`;
            break;
    }

    const result = await _generateWithOpenRouter(prompt, tool, effectiveModel);

    // After getting the result, check for image ideas and send the email
    if (result.ImageIdeas && result.ImageIdeas.length > 0) {
        // Use the AI-generated title for the email subject
        const articleTitle = result.Title || topic;
        // Send email in the background, don't wait for it to complete
        sendImageIdeasEmail(articleTitle, result.ImageIdeas).catch(console.error);
    }

    // Return the original result to the API handler
    return result;
}