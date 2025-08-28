import OpenAI from "openai";
import {
    mapTagPrompt,
    mapCategoriesPrompt,
    createToolResearchPrompt,
    createUseCasesPrompt,
    createCautionsPrompt,
    createFeaturesPrompt,
    createComparisonAnalysisPrompt,
} from "@/lib/models/prompts";
import {
    getBaseSchema,
    getToolCategoriesSchema,
    getGenericTagsSchema,
    getUseCasesSchema,
    getCautionsSchema,
    getFeaturesSchema,
    getComparisonAnalysisSchema,
} from "@/lib/models/schemas";

/**
 * Creates a generic tool definition for OpenAI/OpenRouter function calling.
 * @param {object} schema The input schema definition.
 * @param {string} functionName The name for the tool function.
 * @param {string} functionDescription The description for the tool function.
 * @returns {object} The formatted tool object.
 */
export const createOpenAITool = (schema, functionName, functionDescription) => {
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
export const _generateWithOpenRouter = async (prompt, tool, modelName) => {
    const openRouter = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
        defaultHeaders: {
            "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
            "X-Title": process.env.SITE_TITLE || "AI Tool Pouch",
        },
    });

    console.log("[_generateWithOpenRouter] Sending request with model:", modelName);
    console.log("[_generateWithOpenRouter] Prompt:", prompt);
    console.log("[_generateWithOpenRouter] Tool:", JSON.stringify(tool, null, 2));

    const response = await openRouter.chat.completions.create({
        model: modelName,
        messages: [{ role: "user", content: prompt }],
        tools: [tool],
        tool_choice: { type: "function", function: { name: tool.function.name } },
    });

    console.log("[_generateWithOpenRouter] Raw response:", JSON.stringify(response, null, 2));

    const toolCall = response.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== tool.function.name) {
        throw new Error(
            `OpenRouter did not return the expected tool call for '${tool.function.name}'.`,
        );
    }
    return JSON.parse(toolCall.function.arguments);
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

        // Add debug logging
        console.log("[generateDataForEntity] Raw result:", JSON.stringify(result, null, 2));

        // Ensure we have a valid result object
        if (!result || typeof result !== 'object') {
            console.error("[generateDataForEntity] Invalid result:", result);
            return null;
        }

        return result;
    } catch (error) {
        const errorMessage =
            error.error?.message ||
            error.message ||
            "An unknown error occurred";
        console.error(
            `[generateDataForEntity] Failed to generate data. Error: ${errorMessage}`,
        );
        return null; // Return null instead of throwing to allow graceful fallback
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

    // Debug logging for incoming data
    console.log(`[validateDataForEntity] Validating ${propertyType} for ${entityType}`);
    console.log('Available names:', availableNames);
    console.log('Raw data:', rawData[propertyType]);

    // Normalize available names for comparison
    const normalizedNameMap = availableNames.reduce((acc, name) => {
        // Handle both string and object inputs
        const nameStr = typeof name === 'string' ? name : name.Name;
        // Normalize by trimming whitespace, converting to lowercase, and removing any special characters
        const normalized = nameStr.toLowerCase()
            .trim()
            .replace(/[\r\n]+/g, '') // Remove any line endings
            .replace(/[^\w\s()-]/g, '') // Remove special chars except ()- and spaces
            .replace(/\s+/g, ' '); // Normalize spaces
        acc[normalized] = nameStr;
        return acc;
    }, {});

    // Debug logging for name mapping
    console.log('Normalized name map:', normalizedNameMap);

    // Filter and map back to original casing with detailed logging
    const validatedData = rawData[propertyType]
        .map(name => {
            const normalized = name.toLowerCase()
                .trim()
                .replace(/[\r\n]+/g, '') // Remove any line endings
                .replace(/[^\w\s()-]/g, '') // Remove special chars except ()- and spaces
                .replace(/\s+/g, ' '); // Normalize spaces
            const match = normalizedNameMap[normalized];

            if (!match) {
                console.log(`No match found for "${name}" (normalized: "${normalized}")`);
                console.log('Available normalized names:', Object.keys(normalizedNameMap));
            }

            return match;
        })
        .filter(Boolean); // Remove any undefined values

    // Log validation results
    if (validatedData.length !== rawData[propertyType].length) {
        console.warn(
            `Some invalid ${propertyType}s were filtered out for ${entityType}:`,
            '\nOriginal:', rawData[propertyType],
            '\nValid:', validatedData,
            '\nInvalid:', rawData[propertyType].filter(name =>
                !validatedData.includes(normalizedNameMap[name.toLowerCase()
                    .trim()
                    .replace(/[\r\n]+/g, '')
                    .replace(/[^\w\s()-]/g, '')
                    .replace(/\s+/g, ' ')])
            )
        );
    }

    if (validatedData.length === 0) {
        console.error(
            `No valid ${propertyType}s generated for ${entityType}. AI returned:`,
            rawData[propertyType],
        );
    } else {
        console.log(`Successfully validated ${validatedData.length} ${propertyType}s:`, validatedData);
    }

    return validatedData;
};

export async function generateToolResearch(tool, model, availableCategories, availableUseCaseTags, availableCautionTags) {

    const effectiveModel = model || "google/gemini-2.5-flash";

    // Extract only the names from the available categories and tags
    const categoryNames = availableCategories.map(cat => cat.Name);
    const useCaseTags = availableUseCaseTags.map(tag => tag.Name);
    const cautionTags = availableCautionTags.map(tag => tag.Name);

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

    const prompt = createToolResearchPrompt(tool, categoryNames, useCaseTags, cautionTags);

    console.log("[generateToolResearch] Starting research for tool:", tool);
    console.log("[generateToolResearch] Available categories:", categoryNames);
    console.log("[generateToolResearch] Available use case tags:", useCaseTags);
    console.log("[generateToolResearch] Available caution tags:", cautionTags);

    const rawResult = await generateDataForEntity(prompt, researchTool, effectiveModel);
    if (!rawResult) {
        console.log("[generateToolResearch] No result returned from generateDataForEntity");
        return {
            Categories: [],
            UseCaseTags: [],
            CautionTags: []
        };
    }

    console.log("[generateToolResearch] Raw result from generateDataForEntity:", JSON.stringify(rawResult, null, 2));

    const validatedCategories = validateDataForEntity('tool', 'Categories', rawResult, categoryNames);
    // Update the rawResult with the validated categories
    rawResult.Categories = validatedCategories;

    // Validate that UseCaseTags only contains use case tags, not caution tags
    if (rawResult.UseCaseTags?.some(tag => cautionTags.includes(tag))) {
        console.error('UseCaseTags contains caution tags instead of use case tags:', rawResult.UseCaseTags);
        rawResult.UseCaseTags = [];
    }
    const validatedUseCaseTags = validateDataForEntity('tool', 'UseCaseTags', rawResult, useCaseTags);
    // Update the rawResult with the validated use case tags
    rawResult.UseCaseTags = validatedUseCaseTags;

    // Validate that CautionTags only contains caution tags, not use case tags
    if (rawResult.CautionTags?.some(tag => useCaseTags.includes(tag))) {
        console.error('CautionTags contains use case tags instead of caution tags:', rawResult.CautionTags);
        rawResult.CautionTags = [];
    }
    const validatedCautionTags = validateDataForEntity('tool', 'CautionTags', rawResult, cautionTags);
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

export async function generateComparisonAnalysis(toolA, toolB, useCasesA, useCasesB, category, model) {
    const effectiveModel = model || "google/gemini-2.5-flash";

    const schema = getComparisonAnalysisSchema();
    const comparisonTool = await createOpenAITool(
        schema,
        "format_comparison_analysis",
        "Formats the comparative analysis of two AI tools.",
    );

    const prompt = createComparisonAnalysisPrompt(toolA, toolB, useCasesA, useCasesB, category);
    const result = await _generateWithOpenRouter(
        prompt,
        comparisonTool,
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
