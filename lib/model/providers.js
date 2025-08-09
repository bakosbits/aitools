import OpenAI from "openai";
import { sendImageIdeasEmail } from "@/lib/email";
import { createTagPrompt, createCategoryPrompt, createToolResearchPrompt, createArticlePrompt } from "@/lib/model/prompts";
import { getBaseSchema, getArticleSchema, getToolCategoriesSchema, getToolTagsSchema, getGenericTagsSchema } from "@/lib/model/schemas";

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
        tool_choice: { type: "function", function: { name: tool.function.name } },
    };
    console.log('Final API Payload:', JSON.stringify(payload, null, 2));

    const response = await openRouter.chat.completions.create({
        model: modelName,
        messages: [{ role: "user", content: prompt }],
        tools: [tool],
        // If you want to force the tool, add tool_choice like this:
        tool_choice: { type: "function", function: { name: tool.function.name } },
    });

    const toolCall = response.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== tool.function.name) {
        console.error('OpenRouter did not return the expected tool call.', JSON.stringify(response, null, 2));
        throw new Error(`OpenRouter did not return the expected tool call for '${tool.function.name}'.`);
    }

    const args = toolCall.function.arguments;
    try {
        // More robust check for malformed JSON
        if (typeof args !== 'string' || !args.trim().startsWith('{') || args.trim().startsWith('<!DOCTYPE')) {
            throw new Error('Received malformed JSON or HTML instead of a valid JSON response.');
        }

        return JSON.parse(args);
    } catch (error) {
        console.error('Error processing OpenRouter response:', error);
        console.error('Response content:', JSON.stringify(response, null, 2));
        throw new Error(`Failed to process OpenRouter response: ${error.message}`);
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
        const result = await _generateWithOpenRouter(prompt, researchTool, effectiveModel);
        console.log('Raw model output:', result);
        return result;
    } catch (error) {
        const errorMessage = error.error?.message || error.message || "An unknown error occurred";
        console.error(`[generateRawDataForEntity] Failed to generate data. Error: ${errorMessage}`);
        return null;
    }
};


/**
 * Validates the data returned by the AI model for a specific entity and property.
 * @param {string} entityType - The type of the entity (e.g., 'tool').
 * @param {string} propertyType - The property to validate (e.g., 'Categories', 'Tags').
 * @param {object} rawData - The raw data object returned by the AI.
 * @param {string[]} availableNames - An array of valid names to filter against.
 * @returns {string[]} - An array of validated names.
 */
const validateDataForEntity = (entityType, propertyType, rawData, availableNames) => {
    if (!rawData || !rawData[propertyType]) {
        console.error(`No valid ${propertyType}s generated for ${entityType}. AI returned:`, rawData);
        return [];
    }

    const lowerCaseAvailableNames = availableNames.map(name => name.toLowerCase().trim());
    const validatedData = rawData[propertyType].filter(name => lowerCaseAvailableNames.includes(name.toLowerCase().trim()));

    if (validatedData.length !== rawData[propertyType].length) {
        console.warn(`Some invalid ${propertyType}s were filtered out for ${entityType}. Original:`, rawData[propertyType], "Valid:", validatedData);
    }

    if (validatedData.length === 0) {
        console.error(`No valid ${propertyType}s generated for ${entityType}. AI returned:`, rawData[propertyType]);
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
 * @returns {object} An object containing the filtered, valid categories, e.g., { Categories: ['Category 1', 'Category 2'] }.
 */
const generateCategoriesForEntity = async (
    entityType,
    prompt,
    researchTool,
    effectiveModel,
    availableCategories
) => {
    try {
        // Make the model call
        const result = await _generateWithOpenRouter(prompt, researchTool, effectiveModel);
        console.log('Raw model output:', result);
        
        // Validate that all returned categories exist in the available categories list
        const validCategories = result.Categories?.filter(category => availableCategories.includes(category)) || [];

        if (validCategories.length === 0) {
            console.error(`No valid categories generated for ${entityType}. AI returned:`, result.Categories);
            return { Categories: [] };
        }

        if (validCategories.length !== result.Categories?.length) {
            console.warn(`Some invalid categories were filtered out for ${entityType}. Original:`, result.Categories, "Valid:", validCategories);
        }

        // Return an object with a 'Categories' key
        return { Categories: validCategories };

    } catch (error) {
        const errorMessage = error.error?.message || error.message || "An unknown error occurred";
        console.error(`[generateCategoriesForEntity] Failed to generate categories for ${entityType}: ${errorMessage}`);
        
        if (process.env.NODE_ENV === "development" && error.error) {
            console.error(`[generateCategoriesForEntity] Full error object for ${entityType}:`, JSON.stringify(error, null, 2));
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
 * @param {string[]} availableTags - An array of all valid tags for filtering.
 * @returns {object} An object containing the filtered, valid tags, e.g., { Tags: ['Tag 1', 'Tag 2'] }.
 */
const validateTagsForEntity = async (
    entityType,
    prompt,
    researchTool,
    effectiveModel,
    availableTags
) => {
    try {
        // Make the model call
        const result = await _generateWithOpenRouter(prompt, researchTool, effectiveModel);
        console.log('Raw model output:', result);
        
        // Validate that all returned tags exist in the available tags list
        const validTags = result.Tags?.filter(tag => availableTags.includes(tag)) || [];

        if (validTags.length === 0) {
            console.error(`No valid tags generated for ${entityType}. AI returned:`, result.Tags);
            return { Tags: [] };
        }

        if (validTags.length !== result.Tags?.length) {
            console.warn(`Some invalid tags were filtered out for ${entityType}. Original:`, result.Tags, "Valid:", validTags);
        }

        return { Tags: validTags };

    } catch (error) {
        const errorMessage = error.error?.message || error.message || "An unknown error occurred";
        console.error(`[validateTagsForEntity] Failed to generate tags for ${entityType}: ${errorMessage}`);
        
        if (process.env.NODE_ENV === "development" && error.error) {
            console.error(`[validateTagsForEntity] Full error object for ${entityType}:`, JSON.stringify(error, null, 2));
        }
        
        return { Tags: [] };
    }
};


export async function generateToolResearch(tool, model, availableCategories, availableTags) {

    const effectiveModel = model || "google/gemini-2.5-flash";

    // Extract only the names from the available categories and tags
    const categoryNames = availableCategories.map(cat => cat.Name);
    const tagNames = availableTags.map(tag => tag.Name);

    const schema = getBaseSchema(categoryNames, tagNames);
    
    if (schema.Categories && schema.Categories.items) {
        // You only need to provide a description
        schema.Categories.items.description = `Required - Select ONLY 1-3 categories from the provided list.`;
    }
    if (schema.Tags && schema.Tags.items) {
        // You only need to provide a description
        schema.Tags.items.description = `Required - Select ONLY 3-7 tags from the provided list.`;
    }

    const researchTool = createOpenAITool(
        schema,
        "format_tool_research",
        "Formats the research findings for the specified AI tool.",
    );

    const prompt = createToolResearchPrompt(tool, categoryNames, tagNames);
    
    const rawResult = await generateDataForEntity(prompt, researchTool, effectiveModel);
    if (!rawResult) {
        return { Categories: [], Tags: [] };
    }

    const validatedCategories = validateDataForEntity('tool', 'Categories', rawResult, categoryNames);
    const validatedTags = validateDataForEntity('tool', 'Tags', rawResult, tagNames);

    // Update the rawResult with the validated categories and tags
    rawResult.Categories = validatedCategories;
    rawResult.Tags = validatedTags;

    return rawResult;
}

export async function generateArticleContent(topic, model, articleType = "General",) {
    // Default to a fast and capable OpenRouter model if none is provided.
    const effectiveModel = model || "google/gemini-2.5-flash";
    const schema = getArticleSchema();
    const researchTool = createOpenAITool(
        schema,
        "format_article_content",
        "Formats the generated blog post content.",
    );

    const prompt = createArticlePrompt(topic, articleType);

    const result = await _generateWithOpenRouter(prompt, researchTool, effectiveModel);

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

export async function generateToolCategories(tool, availableCategories, model) {

    const effectiveModel = model || "google/gemini-2.5-flash";
    const schema = getToolCategoriesSchema(availableCategories);
    const researchTool = createOpenAITool(
        schema,
        "format_tool_categories",
        "Formats the generated categories for the specified AI tool.",
    );

    const prompt = createCategoryPrompt(tool, availableCategories);
    return generateCategoriesForEntity('tool', prompt, researchTool, effectiveModel, availableCategories);
}


export async function generateToolTags(tool, availableTags, model) {
    const effectiveModel = model || "google/gemini-2.5-flash";
    const schema = getToolTagsSchema();
    const researchTool = createOpenAITool(
        schema,
        "format_tool_tags",
        "Formats the generated tags for the specified AI tool."
    );

    const prompt = createTagPrompt('tool', tool, availableTags);
    return validateTagsForEntity('tool', prompt, researchTool, effectiveModel, availableTags);
}

export async function generateUseCaseTags(useCase, availableTags, exampleTools, model) {
    const effectiveModel = model || "google/gemini-2.5-flash";
    const schema = getGenericTagsSchema();
    const researchTool = createOpenAITool(
        schema,
        "format_use_case_tags",
        "Formats the generated tags for the specified AI use case."
    );
    const prompt = createTagPrompt('use case',useCase, availableTags, exampleTools);
    return validateTagsForEntity('use case', prompt, researchTool, effectiveModel, availableTags);
}

export async function generateModalityTags(modality, availableTags, tagTools, model) {
    const effectiveModel = model || "google/gemini-2.5-flash";
    const schema = getGenericTagsSchema();
    const researchTool = createOpenAITool(
        schema,
        "format_modality_tags",
        "Formats the generated tags for the specified AI modality."
    );
    const prompt = createTagPrompt('modality',modality, availableTags, tagTools);
    return validateTagsForEntity('modality', prompt, researchTool, effectiveModel, availableTags);
}

export async function generatePreferenceTags(preference, availableTags, tagTools, model) {
    const effectiveModel = model || "google/gemini-2.5-flash";
    const schema = getGenericTagsSchema();
    const researchTool = createOpenAITool(
        schema,
        "format_preference_tags",
        "Formats the generated tags for the specified AI preference."
    );
    const prompt = createTagPrompt('preference',preference, availableTags, tagTools);
    return validateTagsForEntity('preference', prompt, researchTool, effectiveModel, availableTags);
}

export async function generateCategoryTags(category, availableTags, tagTools, model) {
    const effectiveModel = model || "google/gemini-2.5-flash";
    const schema = getGenericTagsSchema();
    const researchTool = createOpenAITool(
        schema,
        "format_category_tags",
        "Formats the generated tags for the specified AI category."
    );
    const prompt = createTagPrompt('category',category, availableTags, tagTools);

    return validateTagsForEntity('category', prompt, researchTool, effectiveModel, availableTags);
}

export async function generateCategoryTagsForBulkUpdate(category, availableTags, model) {
    const effectiveModel = model || "google/gemini-2.5-flash";
    const schema = getGenericTagsSchema();
    const researchTool = createOpenAITool(
        schema,
        "format_category_tags",
        "Formats the generated tags for the specified AI category."
    );
    const prompt = createCategoryTagsPrompt(category, availableTags);

    return validateTagsForEntity('category', prompt, researchTool, effectiveModel, availableTags);
}