import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { sendImageIdeasEmail } from "@/lib/email";
import {
    mapTagPrompt,
    createCategoryPrompt,
    createToolResearchPrompt,
    createArticlePrompt,
    createUseCasesPrompt,
    createCautionsPrompt,
    createFeaturesPrompt,
    createUseCaseTagsPrompt,
    generateCompareAnalysis as createCompareAnalysisPrompt,
} from "@/lib/model/prompts";
import {
    getBaseSchema,
    getArticleSchema,
    getToolCategoriesSchema,
    getToolTagsSchema,
    getGenericTagsSchema,
    getUseCasesSchema,
    getCautionsSchema,
    getFeaturesSchema,
    getUseCaseTagsSchema,
    getCompareAnalysisSchema,
} from "@/lib/model/schemas";

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
    const typeMap = { STRING: "string", ARRAY: "array" };

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
        if (
            value.description &&
            value.description.toLowerCase().startsWith("required")
        ) {
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

/**
 * Creates a generic tool definition for Gemini function calling.
 * @param {object} schema The input schema definition.
 * @param {string} functionName The name for the tool function.
 * @param {string} functionDescription The description for the tool function.
 * @returns {object} The formatted tool object.
 */
const createGeminiTool = (schema, functionName, functionDescription) => {
    const properties = {};
    const required = [];
    const typeMap = { STRING: "string", ARRAY: "array" };

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
        if (
            value.description &&
            value.description.toLowerCase().startsWith("required")
        ) {
            required.push(key);
        }
    }

    return {
        name: functionName,
        description: functionDescription,
        parameters: {
            type: "OBJECT",
            properties,
            required,
        },
    };
};

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

    const payload = {
        model: modelName,
        messages: [{ role: "user", content: prompt }],
        tools: [tool],
        tool_choice: {
            type: "function",
            function: { name: tool.function.name },
        },
    };

    const response = await openRouter.chat.completions.create({
        model: modelName,
        messages: [{ role: "user", content: prompt }],
        tools: [tool],
        // If you want to force the tool, add tool_choice like this:
        tool_choice: {
            type: "function",
            function: { name: tool.function.name },
        },
    });

    const toolCall = response.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== tool.function.name) {
        console.error(
            "OpenRouter did not return the expected tool call.",
            JSON.stringify(response, null, 2),
        );
        throw new Error(
            `OpenRouter did not return the expected tool call for '${tool.function.name}'.`,
        );
    }

    const args = toolCall.function.arguments;
    try {
        // More robust check for malformed JSON
        if (
            typeof args !== "string" ||
            !args.trim().startsWith("{") ||
            args.trim().startsWith("<!DOCTYPE")
        ) {
            throw new Error(
                "Received malformed JSON or HTML instead of a valid JSON response.",
            );
        }

        return JSON.parse(args);
    } catch (error) {
        console.error("Error processing OpenRouter response:", error);
        console.error("Response content:", JSON.stringify(response, null, 2));
        throw new Error(
            `Failed to process OpenRouter response: ${error.message}`,
        );
    }
};

/**
 * A generic function to make a chat completion request to Gemini with a specified tool.
 * @param {string} prompt The user prompt for the AI.
 * @param {object} tool The tool definition object.
 * @param {string} modelName The name of the model to use.
 * @returns {Promise<object>} The parsed JSON arguments from the tool call.
 */
const _generateWithGemini = async (prompt, tool, modelName) => {
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = genAI.getGenerativeModel({ model: modelName, tools: [tool] });

    const result = await model.generateContent(prompt);
    const call = result.response.functionCalls()[0];

    if (call) {
        return call.args;
    } else {
        console.error(
            "Gemini did not return the expected tool call.",
            JSON.stringify(result.response, null, 2),
        );
        throw new Error(
            `Gemini did not return the expected tool call for '${tool.name}'.`,
        );
    }
};

/**
 * Generates data for a given entity using the specified model and research tool.
 * @param {string} prompt - The prompt to use for generation.
 * @param {object} researchTool - The research tool to use.
 * @param {string} effectiveModel - The model to use for generation.
 * @returns {Promise<object|null>} - The generated data, or null if an error occurred.
 */
const generateDataForEntity = async (prompt, researchTool, effectiveModel) => {
    try {
        let result;
        if (effectiveModel.startsWith("gemini/")) {
            result = await _generateWithGemini(
                prompt,
                researchTool,
                effectiveModel,
            );
        } else {
            result = await _generateWithOpenRouter(
                prompt,
                researchTool,
                effectiveModel,
            );
        }
        return result;
    } catch (error) {
        const errorMessage =
            error.error?.message ||
            error.message ||
            "An unknown error occurred";
        console.error(
            `[generateRawDataForEntity] Failed to generate data. Error: ${errorMessage}`,
        );
        return null;
    }
};

/**
 * Validates the data returned by the AI model for a specific entity and property.
 * @param {string} entityType - The type of the entity (e.g., 'tool').
 * @param {string} propertyType - The property to validate (e.g., 'Categories', 'Tags').
 * @param {object} rawData - The raw data object returned by the AI.
 * @param {object[]} availableItems - An array of valid items (objects with Id and Name) to filter against.
 * @returns {object[]} - An array of validated items.
 */
const validateDataForEntity = (
    entityType,
    propertyType,
    rawData,
    availableItems,
) => {
    if (!rawData || !rawData[propertyType]) {
        console.error(
            `No valid ${propertyType}s generated for ${entityType}. AI returned:`,
            rawData,
        );
        return [];
    }

    const lowerCaseAvailableNames = availableItems.map((item) =>
        item.Name.toLowerCase().trim(),
    );
    const validatedData = [
        ...new Set(
            rawData[propertyType]
                .map((name) => {
                    const lowerCaseName = name.toLowerCase().trim();
                    const index =
                        lowerCaseAvailableNames.indexOf(lowerCaseName);
                    if (index !== -1) {
                        return availableItems[index];
                    }
                    return null;
                })
                .filter(Boolean),
        ),
    ];

    if (validatedData.length !== rawData[propertyType].length) {
        console.warn(
            `Some invalid ${propertyType}s were filtered out for ${entityType}. Original:`,
            rawData[propertyType],
            "Valid:",
            validatedData,
        );
    }

    if (validatedData.length === 0) {
        console.error(
            `No valid ${propertyType}s generated for ${entityType}. AI returned:`,
            rawData[propertyType],
        );
    }

    return validatedData;
};

/**
 * Generates categories for a given entity by calling an AI model and
 * validating the returned categories against a list of available categories.
 *
 * @param {string} entityType - The type of entity being categorized (e.g., 'modality', 'use case', 'preference').
 * @param {string} prompt - The prompt string to send to the AI model.
 * @param {object} researchTool - The research tool to be used by the model.
 * @param {string} effectiveModel - The name of the AI model to use.
 * @param {string[]} availableCategories - An array of all valid categories for filtering.
 * @returns {object} An object containing the filtered, valid categories, e.g., { Categories: ['Category 1', 'Category 2'] } }.
 */
const generateCategoriesForEntity = async (
    entityType,
    prompt,
    researchTool,
    effectiveModel,
    availableCategories,
) => {
    try {
        // Make the model call
        const result = await generateDataForEntity(
            prompt,
            researchTool,
            effectiveModel,
        );

        // Validate that all returned categories exist in the available categories list
        const validCategories =
            result.Categories?.filter((category) =>
                availableCategories.includes(category),
            ) || [];

        if (validCategories.length === 0) {
            console.error(
                `No valid categories generated for ${entityType}. AI returned:`,
                result.Categories,
            );
            return { Categories: [] };
        }

        if (validCategories.length !== result.Categories?.length) {
            console.warn(
                `Some invalid categories were filtered out for ${entityType}. Original:`,
                result.Categories,
                "Valid:",
                validCategories,
            );
        }

        // Return an object with a 'Categories' key
        return { Categories: validCategories };
    } catch (error) {
        const errorMessage =
            error.error?.message ||
            error.message ||
            "An unknown error occurred";
        console.error(
            `[generateCategoriesForEntity] Failed to generate categories for ${entityType}: ${errorMessage}`,
        );

        if (process.env.NODE_ENV === "development" && error.error) {
            console.error(
                `[generateCategoriesForEntity] Full error object for ${entityType}:`,
                JSON.stringify(error, null, 2),
            );
        }

        return { Categories: [] };
    }
};

/**
 * Generates tags for a given entity by calling an AI model and
 * validating the returned tags against a list of available tags.
 *
 * @param {string} entityType - The type of entity being tagged (e.g., 'modality', 'use case', 'preference').
 * @param {string} prompt - The prompt string to send to the AI model.
 * @param {object} researchTool - The research tool to be used by the model.
 * @param {string} effectiveModel - The name of the AI model to use.
 * @param {string[]} availableTags - An array of all valid tags for filtering. Can be strings or objects {id, Name}.
 * @returns {object} An object containing the filtered, valid tags, e.g., { Tags: ['Tag 1', 'Tag 2'] }.
 */
const validateTagsForEntity = async (
    entityType,
    prompt,
    researchTool,
    effectiveModel,
    availableTags, // This is an array of strings: ['Tag1', 'Tag2'] or objects: [{ id: 'rec1', Name: 'Tag1' }]
) => {
    try {
        // Make the model call
        const result = await generateDataForEntity(
            prompt,
            researchTool,
            effectiveModel,
        );

        // Validate that all returned tags exist in the available tags list
        // Handle both array of strings and array of objects for availableTags
        const validTagsNames =
            result.Tags?.filter((tag) => {
                if (
                    availableTags.length > 0 &&
                    typeof availableTags[0] === "string"
                ) {
                    return availableTags.includes(tag);
                } else {
                    return availableTags.some((at) => at.Name === tag);
                }
            }) || [];

        // Remove duplicates
        const uniqueValidTagNames = [...new Set(validTagsNames)];

        if (uniqueValidTagNames.length === 0) {
            console.error(
                `No valid tags generated for ${entityType}. AI returned:`,
                result.Tags,
            );
            return { Tags: [] };
        }

        if (uniqueValidTagNames.length !== result.Tags?.length) {
            console.warn(
                `Some invalid or duplicate tags were filtered out for ${entityType}. Original:`,
                result.Tags,
                "Valid:",
                uniqueValidTagNames,
            );
        }

        // Return names directly, as ID mapping is handled by the caller
        return { Tags: uniqueValidTagNames };
    } catch (error) {
        const errorMessage =
            error.error?.message ||
            error.message ||
            "An unknown error occurred";
        console.error(
            `[validateTagsForEntity] Failed to generate tags for ${entityType}: ${errorMessage}`,
        );

        if (process.env.NODE_ENV === "development" && error.error) {
            console.error(
                `[validateTagsForEntity] Full error object for ${entityType}:`,
                JSON.stringify(error, null, 2),
            );
        }

        return { Tags: [] };
    }
};

export async function generateToolResearch(
    tool,
    model,
    availableCategories,
    availableTags,
) {
    const effectiveModel = model || "google/gemini-1.5-flash";

    // Extract only the names from the available categories and tags
    const categoryNames = availableCategories.map((cat) => cat.Name);
    const tagNames = availableTags.map((tag) => tag.Name);

    const schema = getBaseSchema(categoryNames, tagNames);

    if (schema.Categories && schema.Categories.items) {
        // You only need to provide a description
        schema.Categories.items.description = `Required - Select ONLY 1-3 categories from the provided list.`;
    }
    if (schema.Tags && schema.Tags.items) {
        // You only need to provide a description
        schema.Tags.items.description = `Required - Select ONLY 3-7 tags from the provided list.`;
    }

    let researchTool;
    if (effectiveModel.startsWith("gemini/")) {
        researchTool = createGeminiTool(
            schema,
            "format_tool_research",
            "Formats the research findings for the specified AI tool.",
        );
    } else {
        researchTool = createOpenAITool(
            schema,
            "format_tool_research",
            "Formats the research findings for the specified AI tool.",
        );
    }

    const prompt = createToolResearchPrompt(tool, categoryNames, tagNames);

    const rawResult = await generateDataForEntity(
        prompt,
        researchTool,
        effectiveModel,
    );
    if (!rawResult) {
        return { Categories: [], Tags: [] };
    }

    const validatedCategories = validateDataForEntity(
        "tool",
        "Categories",
        rawResult,
        availableCategories,
    );
    const validatedTags = validateDataForEntity(
        "tool",
        "Tags",
        rawResult,
        availableTags,
    );

    // Update the rawResult with the validated categories and tags
    rawResult.Categories = validatedCategories;
    rawResult.Tags = validatedTags;

    return rawResult;
}

export async function generateArticleContent(
    topic,
    model,
    articleType = "blog",
) {
    // Default to a fast and capable OpenRouter model if none is provided.
    const effectiveModel = model || "google/gemini-1.5-flash";
    const schema = getArticleSchema();
    let researchTool;
    if (effectiveModel.startsWith("gemini/")) {
        researchTool = createGeminiTool(
            schema,
            "format_article_content",
            "Formats the generated blog post content.",
        );
    } else {
        researchTool = createOpenAITool(
            schema,
            "format_article_content",
            "Formats the generated blog post content.",
        );
    }

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

export async function generateToolCategories(tool, availableCategories, model) {
    const effectiveModel = model || "google/gemini-1.5-flash";
    const schema = getToolCategoriesSchema(availableCategories);
    let researchTool;
    if (effectiveModel.startsWith("gemini/")) {
        researchTool = createGeminiTool(
            schema,
            "format_tool_categories",
            "Formats the generated categories for the specified AI tool.",
        );
    } else {
        researchTool = createOpenAITool(
            schema,
            "format_tool_categories",
            "Formats the generated categories for the specified AI tool.",
        );
    }

    const prompt = createCategoryPrompt(tool, availableCategories);
    return generateCategoriesForEntity(
        "tool",
        prompt,
        researchTool,
        effectiveModel,
        availableCategories,
    );
}

export async function generateToolTags(tool, availableTags, model) {
    const effectiveModel = model || "google/gemini-1.5-flash";
    const schema = getToolTagsSchema();
    let researchTool;
    if (effectiveModel.startsWith("gemini/")) {
        researchTool = createGeminiTool(
            schema,
            "format_tool_tags",
            "Formats the generated tags for the specified AI tool.",
        );
    } else {
        researchTool = createOpenAITool(
            schema,
            "format_tool_tags",
            "Formats the generated tags for the specified AI tool.",
        );
    }
    const prompt = createTagPrompt("tool", tool, availableTags);
    return validateTagsForEntity(
        "tool",
        prompt,
        researchTool,
        effectiveModel,
        availableTags,
    );
}

export async function mapUseCaseTags(tool, availableTags, model, useCases) {
    const effectiveModel = model || "google/gemini-1.5-flash";
    const schema = getGenericTagsSchema();
    let researchTool;
    if (effectiveModel.startsWith("gemini/")) {
        researchTool = createGeminiTool(
            schema,
            "format_use_case_tags",
            "Formats the generated tags for the specified AI use case.",
        );
    } else {
        researchTool = createOpenAITool(
            schema,
            "format_use_case_tags",
            "Formats the generated tags for the specified AI use case.",
        );
    }
    const prompt = mapTagPrompt("use cases", tool, availableTags, useCases);

    console.log("Use case tags for", tool, "tags used:", availableTags);
    return validateTagsForEntity(
        "use cases",
        prompt,
        researchTool,
        effectiveModel,
        availableTags,
        useCases,
    );
}

export async function mapCautionTags(tool, availableTags, model, cautions) {
    const effectiveModel = model || "google/gemini-1.5-flash";
    const schema = getGenericTagsSchema();
    let researchTool;
    if (effectiveModel.startsWith("gemini/")) {
        researchTool = createGeminiTool(
            schema,
            "format_caution_tags",
            "Formats the generated tags for the specified AI caution.",
        );
    } else {
        researchTool = createOpenAITool(
            schema,
            "format_caution_tags",
            "Formats the generated tags for the specified AI caution.",
        );
    }
    const prompt = mapTagPrompt("cautions", tool, availableTags, cautions);

    console.log("Caution tags for", tool, "tags used:", availableTags);
    return validateTagsForEntity(
        "cautions",
        prompt,
        researchTool,
        effectiveModel,
        availableTags,
        cautions,
    );
}

export async function generateUseCases(tool, model) {
    const effectiveModel = model || "google/gemini-1.5-flash";
    const schema = getUseCasesSchema();
    let researchTool;
    if (effectiveModel.startsWith("gemini/")) {
        researchTool = createGeminiTool(
            schema,
            "format_tool_use_cases",
            "Formats the generated use cases for the specified AI tool.",
        );
    } else {
        researchTool = createOpenAITool(
            schema,
            "format_tool_use_cases",
            "Formats the generated use cases for the specified AI tool.",
        );
    }

    const prompt = createUseCasesPrompt(tool);

    const result = await generateDataForEntity(
        prompt,
        researchTool,
        effectiveModel,
    );

    return result;
}

export async function generateUseCaseTags(tool, model) {
    const effectiveModel = model || "google/gemini-1.5-flash";
    const schema = getUseCaseTagsSchema();
    let researchTool;
    if (effectiveModel.startsWith("gemini/")) {
        researchTool = createGeminiTool(
            schema,
            "format_tool_use_case_tags",
            "Formats the generated use case tags for the specified AI tool.",
        );
    } else {
        researchTool = createOpenAITool(
            schema,
            "format_tool_use_case_tags",
            "Formats the generated use case tags for the specified AI tool.",
        );
    }

    const prompt = createUseCaseTagsPrompt(tool);

    const result = await generateDataForEntity(
        prompt,
        researchTool,
        effectiveModel,
    );

    return result;
}

export async function generateFeatures(tool, model) {
    const effectiveModel = model || "google/gemini-1.5-flash";
    const schema = getFeaturesSchema();
    let researchTool;
    if (effectiveModel.startsWith("gemini/")) {
        researchTool = createGeminiTool(
            schema,
            "format_tool_features",
            "Formats the generated features for the specified AI tool.",
        );
    } else {
        researchTool = createOpenAITool(
            schema,
            "format_tool_features",
            "Formats the generated features for the specified AI tool.",
        );
    }

    const prompt = createFeaturesPrompt(tool);

    const result = await generateDataForEntity(
        prompt,
        researchTool,
        effectiveModel,
    );

    return result;
}

export async function generateCautions(tool, model) {
    const effectiveModel = model || "google/gemini-1.5-flash";
    const schema = getCautionsSchema();
    let researchTool;
    if (effectiveModel.startsWith("gemini/")) {
        researchTool = createGeminiTool(
            schema,
            "format_tool_cautions",
            "Formats the generated cautions for the specified AI tool.",
        );
    } else {
        researchTool = createOpenAITool(
            schema,
            "format_tool_cautions",
            "Formats the generated cautions for the specified AI tool.",
        );
    }

    const prompt = createCautionsPrompt(tool);

    const result = await generateDataForEntity(
        prompt,
        researchTool,
        effectiveModel,
    );

    return result;
}

export async function generateCompareAnalysis(toolA, toolB, toolAItems, toolBItems, type, model) {
    const effectiveModel = model || "google/gemini-1.5-flash";
    const prompt = createCompareAnalysisPrompt(toolA, toolB, toolAItems, toolBItems, type);

    console.log("effectiveModel:", effectiveModel);
    console.log("effectiveModel.startsWith('gemini/')", effectiveModel.startsWith("gemini/"));

    if (effectiveModel.startsWith("gemini/")) {
        const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const geminiModel = genAI.getGenerativeModel({ model: effectiveModel });
        const result = await geminiModel.generateContentStream(prompt);

        // Convert Gemini's stream to a ReadableStream compatible with Vercel AI SDK
        const readableStream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of result.stream) {
                        const chunkText = chunk.text();
                        if (chunkText) {
                            controller.enqueue(chunkText);
                        }
                    }
                    controller.close();
                } catch (error) {
                    console.error("Error during Gemini stream processing:", error);
                    controller.error(error); // Propagate the error to the consumer
                }
            },
        });
        return readableStream;
    } else {
        const openRouter = createOpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: process.env.OPENROUTER_API_KEY,
            defaultHeaders: {
                "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
                "X-Title": process.env.SITE_TITLE || "AI Tool Pouch",
            },
        });

        const result = await streamText({
            model: openRouter(effectiveModel),
            prompt: prompt,
        });
        return result.toAIStream();
    }
}
