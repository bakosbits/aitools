import { PRICING_OPTIONS } from "@/lib/constants";

// This is the schema for a new tool
export const getBaseSchema = (categoryNames, cautionTags, useCaseTags) => ({
    Name: {
        type: "STRING",
        description: "Required - The official name of the tool.",
    },
    Domain: {
        type: "STRING",
        description:
            "Required - The main domain of the tool's website (e.g., figma.com).",
    },
    Website: {
        type: "STRING",
        description: "Required - The official website of the tool.",
    },
    Why: {
        type: "STRING",
        description:
            "Required - A concise single sentence explaining why someone should care about this tool.",
    },
    Description: {
        type: "STRING",
        description:
            "Required - A very short paragraph, 2 sentences, on why someone would use this tool.",
    },
    Details: {
        type: "STRING",
        description:
            "Required - A more in-depth paragraph about the tool's capabilities.",
    },
    Features: {
        type: "ARRAY",
        items: { type: "STRING" },
        description:
            "Required - An array of 5 separate strings. Each string should be a distinct key feature. You MUST NOT use short sentences",
    },
    UseCases: {
        type: "ARRAY",
        items: { type: "STRING" },
        description:
            "Required - An array of 5 separate strings. Each string should be a distinct use case. You MUST provided detailed use cases.",
    },
    Cautions: {
        type: "ARRAY",
        items: { type: "STRING" },
        description:
            "Required - An array of 3 separate strings. Each string should be a distinct caution. You MUST NOT use short sentences.",
    },
    Buyer: {
        type: "STRING",
        description:
            "Required - A short paragraph about who would best benefit from purchasing this tool.",
    },
    Pricing: {
        type: "ARRAY",
        items: {
            type: "STRING",
            enum: PRICING_OPTIONS,
        },
        description: "Required - One or more of these predefined price models.",
    },
    Base_Model: {
        type: "STRING",
        description:
            "Required - Identify the underlying AI or Machine Learning technology. If it's a known LLM (like GPT-4), name it. If not, describe the type of AI used (e.g., 'Proprietary computer vision model', 'Diffusion model'). This field must not be empty.",
    },
    Categories: {
        type: "ARRAY",
        items: {
            type: "STRING",
            enum: categoryNames,
        },
        description:
            "Required - Select 1-2 professions from the provided list the tool is designed for.",
    },
    UseCaseTags: {
        type: "ARRAY",
        items: {
            type: "STRING",
            enum: useCaseTags,
        },
        description:
            "Required - Select 2-4 use case tags from the provided list that best describe the tools use case capabilities.",
    },
    CautionTags: {
        type: "ARRAY",
        items: {
            type: "STRING",
            enum: cautionTags,
        },
        description:
            "Required - Select 0-2 caution tags from the provided list that best highlight the tools cautions.",
    },
});

export const getToolCategoriesSchema = (availableCategories) => ({
    Categories: {
        type: "ARRAY",
        items: {
            type: "STRING",
            enum: availableCategories,
        },
        description:
            "Required - An array of 1 to 3 relevant categories that this tool is designed for, selected ONLY from the provided list.",
    },
});


export const getGenericTagsSchema = () => ({
    Tags: {
        type: "ARRAY",
        items: {
            type: "STRING",
        },
        description: "Required - Select relevant tags from the provided list.",
    },
});

// This is the schema for a new blog post.
export const getArticleSchema = () => ({
    Title: {
        type: "STRING",
        description:
            "Required - A catchy, SEO-friendly title for the article. It should be different from the input topic if possible, but related.",
    },
    Summary: {
        type: "STRING",
        description:
            "Required - A short (155-160 characters) summary or meta description for search engines.",
    },
    Content: {
        type: "STRING",
        description:
            "Required - The full content of the blog post, written in engaging and informative markdown, following the requested layout (e.g., how-to, affiliate, general).",
    },
    ImageIdeas: {
        type: "ARRAY",
        items: { type: "STRING" },
        description:
            "Required - An array of 3 to 5 distinct image ideas. Each string should be a detailed description suitable for an image generation AI.",
    },
});

export const getUseCasesSchema = () => ({
    UseCases: {
        type: "ARRAY",
        description: "Required - An array of 5 use cases and tags for the tool.",
        items: { type: "STRING" }
    }
});

export const getUseCaseTagsSchema = () => ({
    Tags: {
        type: "ARRAY",
        items: {
            type: "STRING",
        },
        description: "Required - An array of 1 to 3 single sentence use cases.",
    },
});

export const getFeaturesSchema = () => ({
    Tool: {
        type: "STRING",
        description:
            "Required - The name of the tool that the feature belongs to.",
    },
    Feature: {
        type: "ARRAY",
        items: {
            type: "STRING",
        },
        description: "Required - 5 of the top features for the tool.",
    },
});

export const getCautionsSchema = () => ({
    Tool: {
        type: "STRING",
        description:
            "Required - The name of the tool that the caution belongs to.",
    },
    Caution: {
        type: "ARRAY",
        items: {
            type: "STRING",
        },
        description: "Required - 3 of the top cautions for the tool.",
    },
});

