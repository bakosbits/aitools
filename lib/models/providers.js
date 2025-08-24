import OpenAI from "openai";
import {
    mapTagPrompt,
    mapCategoriesPrompt,
    createToolResearchPrompt,
    createUseCasesPrompt,
    createCautionsPrompt,
    createFeaturesPrompt,
    createUseCaseTagsPrompt,
} from "@/lib/models/prompts";
import {
    getBaseSchema,
    getToolCategoriesSchema,
    getGenericTagsSchema,
    getUseCasesSchema,
    getCautionsSchema,
    getFeaturesSchema,
    getUseCaseTagsSchema,
} from "@/lib/models/schemas";

/**
 * Creates a generic tool definition for OpenAI/OpenRouter function calling.
 * @param {object} schema The input schema definition.
 * @param {string} functionName The name for the tool function.
 * @param {string} functionDescription The description for the tool function.
 * @returns {object} The formatted tool object.
 */
export async function createOpenAITool(
    schema,
    functionName,
    functionDescription,
) {
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
}

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
    console.log(
        "OpenRouter API Request Payload:",
        JSON.stringify(payload, null, 2),
    );

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
 * Generates data for a given entity using the specified model and research tool.
 * @param {string} prompt - The prompt to use for generation.
 * @param {object} researchTool - The research tool to use.
 * @param {string} effectiveModel - The model to use for generation.
 * @returns {Promise<object|null>} - The generated data, or null if an error occurred.
 */
export async function generateDataForEntity(
    prompt,
    researchTool,
    effectiveModel,
) {
    try {
        const result = await _generateWithOpenRouter(
            prompt,
            researchTool,
            effectiveModel,
        );
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
}

/**
 * Validates the data returned by the AI model for a specific entity and property.
 * @param {string} entityType - The type of the entity (e.g., 'tool').
 * @param {string} propertyType - The property to validate (e.g., 'Categories', 'Tags').
 * @param {object} rawData - The raw data object returned by the AI.
 * @param {object[]} availableItems - An array of valid items (objects with Id and Name) to filter against.
 * @returns {object[]} - An array of validated items.
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
        const result = await _generateWithOpenRouter(
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
        const result = await _generateWithOpenRouter(
            prompt,
            researchTool,
            effectiveModel,
        );
        // Prepare a cleaned set of available tag names for efficient lookup
        const isStringArray =
            availableTags.length > 0 && typeof availableTags[0] === "string";
        const cleanedAvailableTags = new Set(
            isStringArray
                ? availableTags.map((t) => t.trim().toLowerCase())
                : availableTags.map((t) => t.Name.trim().toLowerCase()),
        );

        // Validate that all returned tags exist in the available tags list
        const validTagsNames = result.Tags.filter((tag) =>
            cleanedAvailableTags.has(tag.trim().toLowerCase()),
        );

        if (validTagsNames.length === 0) {
            console.error(
                `No valid tags generated for ${entityType}. AI returned:`,
                result.Tags,
            );
            return { Tags: [] };
        }

        // Return names directly, as ID mapping is handled by the caller
        return { Tags: validTagsNames };
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

/**
 * Validates the data returned by the AI model for a specific entity and property.
 * @param {string} entityType - The type of the entity (e.g., 'tool').
 * @param {string} propertyType - The property to validate (e.g., 'Categories', 'Tags').
 * @param {object} rawData - The raw data object returned by the AI.
 * @param {string[]} availableNames - An array of valid names to filter against.
 * @returns {string[]} - An array of validated names.
 */
const validateDataForEntity = (
    entityType,
    propertyType,
    rawData,
    availableNames,
) => {
    if (!rawData || !rawData[propertyType]) {
        console.error(
            `No valid ${propertyType}s generated for ${entityType}. AI returned:`,
            rawData,
        );
        return [];
    }

    const lowerCaseAvailableNames = availableNames.map((name) =>
        name.toLowerCase().trim(),
    );
    const validatedData = rawData[propertyType].filter((name) =>
        lowerCaseAvailableNames.includes(name.toLowerCase().trim()),
    );

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

export async function generateToolResearch(
    tool,
    model,
    availableCategories,
    availableUseCaseTags,
    availableCautionTags,
) {
    const effectiveModel = model || "google/gemini-2.5-flash";

    // Extract only the names from the available categories and tags
    const categoryNames = availableCategories.map((cat) => cat.Name);
    const useCaseTags = availableUseCaseTags.map((tag) => tag.Name);
    const cautionTags = availableCautionTags.map((tag) => tag.Name);

    const schema = getBaseSchema(categoryNames, useCaseTags, cautionTags);

    if (schema.Categories && schema.Categories.items) {
        schema.Categories.items.description = `Required - Select ONLY 1-2 categories from the provided list.`;
    }

    if (schema.UseCaseTags && schema.UseCaseTags.items) {
        schema.UseCaseTags.items.description = `Required - Select ONLY 2-4 use case tags from the provided list that best describe the tools use case capabilities.`;
    }
    if (schema.CautionTags && schema.CautionTags.items) {
        schema.CautionTags.items.description = `Required - Select ONLY 0-2 caution tags from the provided list that best highlight the tools cautions.`;
    }

    const researchTool = createOpenAITool(
        schema,
        "format_tool_research",
        "Formats the research findings for the specified AI tool.",
    );

    const prompt = createToolResearchPrompt(
        tool,
        categoryNames,
        useCaseTags,
        cautionTags,
    );

    const rawResult = await generateDataForEntity(
        prompt,
        researchTool,
        effectiveModel,
    );
    if (!rawResult) {
        return { Categories: [], UseCaseTags: [], CautionTags: [] };
    }

    const validatedCategories = validateDataForEntity(
        "tool",
        "Categories",
        rawResult,
        categoryNames,
    );
    // Update the rawResult with the validated categories
    rawResult.Categories = validatedCategories;

    const validatedUseCaseTags = validateDataForEntity(
        "tool",
        "UseCaseTags",
        rawResult,
        useCaseTags,
    );
    // Update the rawResult with the validated use case tags
    rawResult.UseCaseTags = validatedUseCaseTags;

    const validatedCautionTags = validateDataForEntity(
        "tool",
        "CautionTags",
        rawResult,
        cautionTags,
    );
    // Update the rawResult with the validated caution tags
    rawResult.CautionTags = validatedCautionTags;

    return rawResult;
}

export async function mapToolCategories(
    tool,
    availableCategories,
    toolFeatures,
    model,
) {
    const effectiveModel = model || "google/gemini-2.5-flash";
    const schema = getToolCategoriesSchema(availableCategories);
    const researchTool = createOpenAITool(
        schema,
        "format_tool_categories",
        "Formats the generated categories for the specified AI tool.",
    );

    const prompt = mapCategoriesPrompt(tool, availableCategories, toolFeatures);
    return generateCategoriesForEntity(
        "tool",
        prompt,
        researchTool,
        effectiveModel,
        availableCategories,
    );
}

export async function mapUseCaseTags(tool, availableTags, model, useCases) {
    const effectiveModel = model || "google/gemini-2.2-flash";
    const schema = getGenericTagsSchema();

    const researchTool = createOpenAITool(
        schema,
        "format_tool_research",
        "Formats the research findings for the specified AI tool.",
    );

    const prompt = mapTagPrompt("use cases", tool, availableTags, useCases);

    return validateTagsForEntity(
        "tool",
        prompt,
        researchTool,
        effectiveModel,
        availableTags,
    );
}

export async function mapCautionTags(tool, availableTags, model, cautions) {
    const effectiveModel = model || "google/gemini-2.2-flash";
    const schema = getGenericTagsSchema();

    const researchTool = createOpenAITool(
        schema,
        "format_tool_research",
        "Formats the research findings for the specified AI tool.",
    );

    const prompt = mapTagPrompt("cautions", tool, availableTags, cautions);

    return validateTagsForEntity(
        "cautions",
        prompt,
        researchTool,
        effectiveModel,
        availableTags,
    );
}

export async function generateUseCases(tool, model) {
    const effectiveModel = model || "google/gemini-2.5-flash";

    const schema = getUseCasesSchema();
    const useCasesTool = createOpenAITool(
        schema,
        "format_use_cases",
        "Formats a list of use cases for the specified AI tool.",
    );

    const prompt = createUseCasesPrompt(tool);
    const result = await generateDataForEntity(
        prompt,
        useCasesTool,
        effectiveModel,
    );

    return result;
}

export async function generateCautions(tool, model) {
    const effectiveModel = model || "google/gemini-2.5-flash";
    const schema = getCautionsSchema();

    const researchTool = createOpenAITool(
        schema,
        "format_tool_research",
        "Formats the research findings for the specified AI tool.",
    );

    const prompt = createCautionsPrompt(tool);
    const result = await generateDataForEntity(
        prompt,
        researchTool,
        effectiveModel,
    );

    return result;
}

export async function generateFeatures(tool, model) {
    const effectiveModel = model || "google/gemini-2.5-flash";
    const schema = getFeaturesSchema();

    const researchTool = createOpenAITool(
        schema,
        "format_tool_research",
        "Formats the research findings for the specified AI tool.",
    );

    const prompt = createFeaturesPrompt(tool);
    const result = await generateDataForEntity(
        prompt,
        researchTool,
        effectiveModel,
    );

    return result;
}
