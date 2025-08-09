/**
 * Creates a prompt for generating an article based on a topic and article type.
 * @param {string} topic - The topic of the article.
 * @param {string} articleType - The type of article to generate (e.g., "Affiliate", "How-To", "General").
 * @returns {string} The generated prompt for the AI model.
 */
export const createArticlePrompt = (topic, articleType) => {
    let prompt;
    // Base prompt with common instructions for all article types.
    const basePrompt = `You are an expert content writer and SEO specialist. It is critical that all 'Required' fields in the schema are filled accurately and not left empty.When writing the 'Content', you must use standard Markdown for styling:- Use '##' for main section headings (H2).- Use '###' for sub-headings (H3).- Use '**bold text**' for emphasis.- Use '*italic text*' for nuance.- Use bulleted lists with '*' or '-' for key points.- Use numbered lists for sequential steps.- Use > to highlight any compelling statements.After generating the blog content, populate the 'ImageIdeas' field with 3-5 distinct image ideas. Each idea should be a detailed description with a 16:9 format, suitable for Midjourney.Finally, call the 'format_article_content' function with all the results.`;

    // Switch statement to select the prompt based on the article type.
    switch (articleType) {
        case "Affiliate":
            prompt = `You are an expert affiliate marketer and SEO content writer. Your goal is to persuade the reader to click an affiliate link and make a purchase by providing valuable information and building trust.Write a comprehensive and persuasive affiliate blog post about "${topic}". The blog post should be between 2500 and 3000 words.In addition to the title and the summary, the article must follow this structure exactly:1.  **Introduction**: Hook the reader by identifying a common problem. Briefly introduce the product as the solution and state what the reader will learn.2.  **Product Deep Dive**: Explain what the product is. Use bullet points for key features and their direct benefits. Explain how it solves the reader's problem.2.  **Why This Product (Unique Selling Proposition)**: Explain what makes this product better than alternatives. Highlight its unique selling points.4.  **Pros & Cons**: Provide a balanced view to build trust.5.  **Who Is This For?**: Clearly define the ideal user for this product.6.  **Conclusion**: Summarize what makes this tool a compelling choice for the reader and include a clear CTA (call to action).${basePrompt}`;
            break;
        case "How-To":
            prompt = `You are an expert technical writer. Your goal is to provide clear, step-by-step instructions that enable the reader to achieve a specific outcome or solve a problem.Write a detailed how-to guide on the topic of "${topic}".The article must follow this structure exactly:1.  **Clear, Action-Oriented Title**: Tells the reader exactly what they will learn to do.2.  **Introduction**: Hook the reader by stating the problem the "how-to" solves or the benefit of learning this skill. Clearly state what the reader will achieve and briefly mention the difficulty level or time commitment.3.  **Prerequisites/Tools/Materials Needed**: A concise list of everything the reader needs before starting (e.g., software, hardware, accounts, ingredients).4.  **Step-by-Step Instructions**: Numbered steps with clear, concise headings for each step. Use simple, direct language. Focus on one action per step.5.  **Conclusion**: Summarize the outcome, offer encouragement, and optionally provide a "What's Next?" section.6.  **Troubleshooting Tips (Optional)**: List common issues and their solutions.${basePrompt}`;
            break;
        case "General":
        default:
            prompt = `You are an expert content writer. Your goal is to inform, entertain, engage, or share opinions on a topic in a flexible format.Write a comprehensive and engaging general blog post about "${topic}".The article must follow this structure exactly:1.  **Engaging Title**: Hook the reader and reflect the post's tone (e.g., informational, curious, opinionated).2.  **Introduction**: Grab attention with a compelling hook (a question, anecdote, or surprising statistic). Introduce the main topic and set the tone.3.  **Main Points/Arguments/Narrative**: Break down the content into logical sections with clear subheadings.     Each section should develop a key idea, argument, or part of the story, supported by examples or data.4.  **Conclusion**: Summarize the main takeaways or re-emphasize the core message. Offer a final thought or a call to reflection.${basePrompt}`;
            break;
    }
    return prompt;
}


/**
 * Creates a dynamic prompt for AI tagging based on the entity type.
 * @param {string} entityType - The type of entity (e.g., 'modality', 'use case', 'preference').
 * @param {object} entity - The object containing the name of the entity (e.g., { Name: '...'});
 * @param {string[]} availableTagNames - An array of available tag names.
 * @param {string} examples - A formatted string of examples to provide context for the model.
 * @returns {string} The complete, formatted prompt string.
 */
export const createTagPrompt = (entityType, entity, availableTags, tagTools = []) => {
    let persona;
    let formatFunctionName;
    let examplesContext = '';

    // Switch for entityType
    switch (entityType.toLowerCase()) {
        case 'modality':
            persona = 'expert AI modality analyst';
            formatFunctionName = 'format_modality_tags';
            break;
        case 'use case':
            persona = 'expert AI use case analyst';
            formatFunctionName = 'format_use_case_tags';
            break;
        case 'preference':
            persona = 'expert AI preference analyst';
            formatFunctionName = 'format_preference_tags';
            break;
        case 'category':
            persona = 'expert AI category analyst';
            formatFunctionName = 'format_category_tags';
            break;
        case 'tool':
            persona = 'expert AI tool analyst';
            formatFunctionName = 'format_tool_tags';
            break;
        default:
            throw new Error(`Unsupported entity type: ${entityType}`);
    }

    // Only include examples if the entity type requires them and they are provided
    if (tagTools.length > 0 && entityType !== 'tool') {
        const formattedTools = tagTools.map(tool => {
            return `Tool Name: ${tool.Name}
Description: ${tool.Description}
Details: ${tool.Details}
Why: ${tool.Why}
`;
        }).join('\n');

        examplesContext = `Review the Description, Details, and Why fields of the following tools to understand how they relate to the ${entityType}:
        ${formattedTools}\n`;
    }

    const prompt = `You are an ${persona}. Analyze the ${entityType} named "${entity.Name}".
Based on your analysis, select the tags that would associate with the ${entityType}.
Use the following context when selecting tags for ${entityType}. You should assign every tag in the list to at least 1 ${entityType}.


For the 'Tags' field, you MUST follow these STRICT REQUIREMENTS:
1. You can ONLY select tags that appear EXACTLY as shown in the list below
2. You CANNOT create new tags or modify existing ones
3. Names must match EXACTLY, including case and spacing
4. If you cannot find an exact match in the list, do not make up alternatives
--- END STRICT REQUIREMENTS ---

Available Tags:

${availableTags.join("\n")}

Then, call the ${formatFunctionName} function with the selected tags.`;

    return prompt;
};


    /**
     * Creates a dynamic prompt for AI classification (tags or categories)
     * based on the entity type and its properties.
     *
     * @param {object} entity - The object containing the entity's properties, including its Name.
     * @param {string[]} availableCategories - An array of available category or tag names.
     * @returns {string} The complete, formatted prompt string.
     */
    export const createCategoryPrompt = (tool, availableCategories,) => {

        const prompt = `You are an expert analyst for an AI tool directory. 
The categories you have to choose from represent a profession, skill, trade or craft.
Your sole task is to assign ONLY THE MOST relevant categories to a given AI tool.
You MUST ONLY select between 1 and 3 categories for each tool. 
Do not assign a category unless it's a perfect fit for the tools's purpose.
Use the following context when selecting categories for the tool:

Name: ${tool.Name}
Why: ${tool.Why}
Description: ${tool.Description}
Details: ${tool.Details}
Features: ${Array.isArray(tool.Features) ? tool.Features.join(", ") : ""}.trim();

Available categories (select ONLY from this exact list):
${availableCategories.join("\n")}

Now, call the 'format_tool_categories' function with the list of selected categories.`

        return prompt;
    };

    export const createToolResearchPrompt = (tool, availableCategories, availableTags) => {

        const prompt = `You are an expert AI tool researcher. Your task is to research a tool and assign relevant categories and tags from the provided lists. 
 You MUST NOT invent any new tags or categories.
 
 --- EXAMPLES ---
Example 1: Tool Name: "DALL-E"
Response:
    {"Categories": ["Art and Design"],
    "Tags": ["generative-art", "image-generation", "image-recognition", "art-generation"]
}
    
Example 2:
Tool Name: "Zapier AI"
Response:
    {"Categories": ["No Code Developers, Automation Engineers"],
     "Tags": ["productivity", "workflow-automation", "no-code", "app-integration"]
    }
--- END EXAMPLES ---

Now, research the tool named "${tool}". Based on your research, identify the most relevant professional categories and appropriate tags for this tool.

STRICT REQUIREMENTS:
1. You MUST select between 1 and 3 categories.
2. You CANNOT create new categories or modify existing ones.
4. Names must match EXACTLY.
5. If you cannot find an exact match in the list, do not make up alternatives.
6. You MUST select between 3 and 7 tag
7. You CANNOT create new tags or modify existing ones
8. You MUST NOT select fewer than 3 tags.
9. Names must match EXACTLY.
10. If you cannot find an exact match in the list, do not make up alternatives.
--- END STRICT REQUIREMENTS ---

Available Categories:
${availableCategories.join("\n")}

Available Tags:
${availableTags.join("\n")}

It is critical that all 'Required' fields in the schema are filled accurately and not left empty. Then, call the 'format_tool_research' function with the results.`
        return prompt;

    }

    export const createCategoryTagsPrompt = (category, availableTags) => {

        const prompt = `You are an expert AI category analyst. Your task is to analyze the category named "${category.Name}" and assign relevant tags from the provided list.

    Based on your analysis, select the most appropriate tags that would associate with the category.

    For the 'Tags' field, you MUST follow these STRICT REQUIREMENTS:
    1. You can ONLY select tags that appear EXACTLY as shown in the list below
    2. You CANNOT create new tags or modify existing ones
    3. You MUST select between 7 and 21 tags
    4. Names must match EXACTLY, including case and spacing
    5. If you cannot find an exact match in the list, do not make up alternatives
    --- END STRICT REQUIREMENTS ---

    Available Tags:
    ${availableTags.join("\n")}

    Then, call the format_category_tags function with the selected tags.`

        return prompt;

    };