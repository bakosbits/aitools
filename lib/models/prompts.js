/**
 * Creates a prompt for generating an article based on a topic and article type.
 * @param {string} topic - The topic of the article.
 * @param {string} articleType - The type of article to generate (e.g., "Affiliate", "How-To", "General").
 * @returns {string} The generated prompt for the AI model.
 */
export const createArticlePrompt = (topic, articleType) => {
    let prompt;
    // Base prompt with common instructions for all article types.
    const basePrompt = `You are an expert content writer and SEO specialist. It is critical that all 'Required' fields in the schema are filled accurately and not left empty.
When writing the 'Content', you must use standard Markdown for styling: 
Use '##' for main section headings (H2). Use '###' for sub-headings (H3). Use '**bold text**' for emphasis. Use '*italic text*' for nuance. Use bulleted lists with '*' or '-' for key points.
Use numbered lists for sequential steps. Use > to highlight any compelling statements.
After generating the blog content, populate the 'ImageIdeas' field with 3-5 distinct image ideas. 
Each idea should be a detailed description with a 16:9 format, suitable for Midjourney.

Finally, call the 'format_article_content' function with all the results.`;

    // Switch statement to select the prompt based on the article type.
    switch (articleType) {
        case "review":
            prompt = `You are an expert affiliate marketer and SEO content writer. 
        Your goal is to persuade the reader to click an affiliate link and make a purchase by providing valuable information and building trust.
        Write a comprehensive and persuasive affiliate blog post about "${topic}". 
        The blog post should be between 2500 and 3000 words.In addition to the title and the summary, the article should follow this structure:
        1.  **Introduction**: Hook the reader by identifying a common problem. Briefly introduce the product as the solution and state what the reader will learn.
        2.  **Product Deep Dive**: Explain what the product is. Use bullet points for key features and their direct benefits. Explain how it solves the reader's problem.
        3.  **Why This Product (Unique Selling Proposition)**: Explain what makes this product better than alternatives. Highlight its unique selling points.
        4.  **Pros & Cons**: Provide a balanced view to build trust.
        5.  **Who Is This For?**: Clearly define the ideal user for this product.
        6.  **Conclusion**: Summarize what makes this tool a compelling choice for the reader and include a clear CTA (call to action).${basePrompt}`;
            break;
        case "tutorial":
            prompt = `You are an expert technical writer. 
        Your goal is to provide clear, step-by-step instructions that enable the reader to achieve a specific outcome or solve a problem.
        Write a detailed how-to guide on the topic of "${topic}".
        The article must follow this structure exactly:
        1.  **Clear, Action-Oriented Title**: Tells the reader exactly what they will learn to do.
        2.  **Introduction**: Hook the reader by stating the problem the "how-to" solves or the benefit of learning this skill. Clearly state what the reader will achieve and briefly mention the difficulty level or time commitment.
        3.  **Prerequisites/Tools/Materials Needed**: A concise list of everything the reader needs before starting (e.g., software, hardware, accounts, ingredients).
        4.  **Step-by-Step Instructions**: Numbered steps with clear, concise headings for each step. Use simple, direct language. Focus on one action per step.
        5.  **Conclusion**: Summarize the outcome, offer encouragement, and optionally provide a "What's Next?" section.
        6.  **Troubleshooting Tips (Optional)**: List common issues and their solutions.${basePrompt}`;
            break;
        case "blog":
        default:
            prompt = `You are an expert content writer. 
        Your goal is to inform, entertain, engage, or share opinions on a topic in a flexible format.
        Write a comprehensive and engaging general blog post about "${topic}".
        The article should follow this structure:
        1.  **Engaging Title**: Hook the reader and reflect the post's tone (e.g., informational, curious, opinionated).
        2.  **Introduction**: Grab attention with a compelling hook (a question, anecdote, or surprising statistic). Introduce the main topic and set the tone.
        3.  **Main Points/Arguments/Narrative**: Break down the content into logical sections with clear subheadings.     Each section should develop a key idea, argument, or part of the story, supported by examples or data.
        4.  **Conclusion**: Summarize the main takeaways or re-emphasize the core message. Offer a final thought or a call to reflection.${basePrompt}`;
            break;
    }
    return prompt;
};

/**
 * Creates a dynamic prompt for AI tagging based on the entity type.
 * @param {string} entityType - The type of entity (e.g., 'use case', 'caution').
 * @param {object} entity - The object containing the name of the entity (e.g., { Name: '...' });
 * @param {string[]} availableTagNames - An array of available tag names.
 * @param {string} context - The associated tool context for the model.
 * @returns {string} The complete, formatted prompt string.
 */
export const mapTagPrompt = (entityType, entity, availableTags, context) => {
    let persona;
    let min_tags;
    let max_tags;
    let formatFunctionName;

    // Switch for entityType
    switch (entityType.toLowerCase()) {
        case "cautions":
            min_tags = 0;
            max_tags = 2;
            persona = "expert at analyzing cautions for AI tools";
            formatFunctionName = "format_use_case_tags";
            break;
        case "use cases":
            min_tags = 2;
            max_tags = 4;
            persona = "expert at analyzing use cases for AI tools";
            formatFunctionName = "format_tool_tags";
            break;
        default:
            throw new Error(`Unsupported entity type: ${entityType}`);
    }

    let formattedContext = "";
    // Only include examples if the entity type requires them and they are provided
    if (context && context.length > 0) {
        formattedContext = context.join("\n");
    }

    const prompt = `You are an ${persona}. Analyze the following Why, Description, Details, and use cases for "${entity.Name}":

Why: ${entity.Why}
Description: ${entity.Description}
Details: ${entity.Details}
${entityType}: ${formattedContext}

Based on your analysis of the companies strengths and weaknesses, select the tags that would best associate with the ${entityType}.
Use the following guidelines and requirements when selecting tags for ${entity.Name}:

When selecting tags you can use a confidence score (e.g. 3 = core, 2 = supported, 1 = edge case) to determine the relevance of each tag.

For the 'Tags' field, you MUST follow these STRICT REQUIREMENTS:
1. You MUST ONLY select between ${min_tags} and ${max_tags} Tags for each tool.
2. You MUST select tags EXACTLY as they appear in the Available Tags list - no modifications or variations.
3. You MUST NOT create your own tags or modify existing ones.
4. You MUST match tags character-for-character, including spaces and punctuation.
5. If a tool could use multiple similar tags (e.g. 'Generate visuals from text prompts' and 'Create landing page content'), choose the most specific and relevant one.

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
export const mapCategoriesPrompt = (
    tool,
    availableCategories,
    toolFeatures,
) => {
    const prompt = `You are an expert analyst for an AI tool directory. 
The categories you have to choose from represent a profession, skill, trade or craft.
Your sole task is to assign ONLY THE MOST relevant categories to a given AI tool.
You MUST ONLY select a maximum of 2 categories for each tool and they MUST be core to the tools capabilities.
After selecting a primary category, you may select a secondary category only if the tool is an excellent fit.
Do not assign a category unless it's a perfect fit for the tools's purpose.
Use the following context when selecting categories for the tool:

Name: ${tool.Name}
Why: ${tool.Why}
Description: ${tool.Description}
Details: ${tool.Details}
Features: ${toolFeatures}.join("\n")    

Available categories (select ONLY from this exact list):
${availableCategories}.join("\n") 

Now, call the 'format_tool_categories' function with the list of selected categories.`;

    return prompt;
};

export const createToolResearchPrompt = (
    tool,
    availableCategories,
    availableUseCaseTags,
    availableCautionTags,
) => {
    // Handle both string and object input for tool
    
    const prompt = `You are an expert AI tool researcher. Your task is to research a tool, create use cases and assign relevant categories and tags from the provided lists. 
 You MUST NOT invent any new or categories.
 
 --- EXAMPLES ---
Example 1: Tool Name: "DALL-E"
Response:
    {
        "Categories": ["Art and Design"],
        "UseCaseTags": ["Generate visuals from text prompts (logos, graphics)", "Create landing page content"],
        "CautionTags": ["Limited Output Quality or Control"]
    }
    
Example 2:
Tool Name: "Zapier AI"
Response:
    {
        "Categories": ["No Code Developers"],
        "UseCaseTags": ["Summarize long email threads and assign follow-ups", "Automate scheduling and calendar tasks"],
        "CautionTags": ["Setup Complexity or Integration Burden"]
    }
--- END EXAMPLES ---

Now, research the tool named "${tool}". Based on your research, identify the most relevant professional categories and appropriate tags for this tool.

STRICT REQUIREMENTS:
1. You MUST select between 1 and 2 categories.
2. You MUST select categories EXACTLY as they appear in the Available Categories list.
3. You MUST match categories character-for-character, including spaces and punctuation.
4. You MUST NOT create new categories or modify existing ones in any way.
5. If you cannot find an exact match in the list, do not make up alternatives or variations.
5. You MUST provide a list of 5 features. You MUST NOT use short sentences.
6. You MUST provide a list of 3 cautions. You MUST NOT use short sentences.
7. You MUST generate 5 unique and detailed usecases. You MUST generate detailed use cases. Example: Streamlining daily task management: This tool helps individuals prioritize and manage their daily tasks by integrating with various tools and allowing for focused work blocks, ensuring important tasks are completed efficiently.
8. You must select between 2 and 4 use case tags.
9. You must select between 0 and 2 caution tags.
--- END STRICT REQUIREMENTS ---

Available Categories (select EXACTLY as shown, do not modify):
${availableCategories.join("\n")}

Available Use Case Tags (select EXACTLY as shown, do not modify):
${availableUseCaseTags.join("\n")}

Available Caution Tags (select EXACTLY as shown, do not modify):
${availableCautionTags.join("\n")}

It is critical that all 'Required' fields in the schema are filled accurately and not left empty. 

Then, call the 'format_tool_research' function with the results.`;

    return prompt;
};

export const createUseCasesPrompt = (tool) => {
    const prompt = `You are an expert AI tool analyst. Your task is to identify the top 5 use cases for the tool named "${tool.Name}".
Based on your analysis, list of 5 of the top use cases for this tool.

For the 'UseCases' field, you MUST follow these STRICT REQUIREMENTS:
1. You MUST provide a list of 5 use cases.
2. Do Not number the use cases.
3. Each use case should be a short sentence. 
4. Include a brief explanation of how the tool addresses the use case.
5. Do not mention the tool by name.
6. Each use case should be unique.
--- END STRICT REQUIREMENTS ---

--- Use Case Examples ---

Generating High-Converting Ad Copy: Create diverse ad copy variations for platforms like Google, Meta (Facebook/Instagram), and LinkedIn. Its Predictive Performance Score helps marketers identify the most effective headlines and descriptions, minimizing wasted ad spend and boosting conversion rates even before launching campaigns. This also helps overcome writer's block when trying to come up with fresh ad angles.
Rapid Prototyping and MVP Development of AI-powered Apps: Create a platform that is ideal for quickly building and launching Minimum Viable Products (MVPs) for AI-driven ideas. This includes applications that integrate with large language models (LLMs) for natural language processing, image generation APIs, or recommendation engines. Entrepreneurs can test their AI concepts with real users without the need for extensive coding, saving time and resources.
Automated Lead Qualification and Generation: Create a solution that excels at engaging website visitors and social media users to qualify leads efficiently. Bots can ask a series of questions, collect contact information, and determine the user's needs and intent, then seamlessly hand off qualified leads to sales teams.
Rapid Website Creation from Text Prompts (AI-Powered): Create a platform that allows users to generate initial website designs, layouts, and even content directly from text descriptions. This significantly accelerates the ideation and initial build phase, enabling designers and non-designers to quickly bring their website concepts to life.
Personalizing and Optimizing Email Marketing Campaigns: Create a solution that helps marketers create effective email campaigns. It can generate variations designed to improve open rates and click-through rates, and ensure brand consistency across all email communications. This allows for more engaging and conversion-focused email marketing efforts without the need for extensive manual optimization.

--- End Examples ---

Then, call the format_use_cases function with the list of use cases.`;

    return prompt;
};

export const createFeaturesPrompt = (tool) => {
    const prompt = `You are an expert AI tool analyst. Your task is to identify the top 5 features for the tool named "${tool.Name}".
Based on your analysis, list the top 5 features for this tool.

Do not confuse features with use cases. For example:

For the 'Features' field, you MUST follow these STRICT REQUIREMENTS:
1. You MUST provide a list of 5 features.
2. You Must Not number the features.
3. Each feature should be a short sentence.
4. Each feature should be unique.
--- END STRICT REQUIREMENTS ---

--- Feature Examples ---

1. Self-healing test scripts
2. Customizable styles, templates, and type effects.
3. Supports image editing, vector generation, and smart fills.
4. Integrated into Photoshop, Illustrator, and Adobe Express.
5. Offers various content templates."

Then, call the format_tool_features function with the list of features.`;

    return prompt;
};

export const createCautionsPrompt = (tool) => {
    const prompt = `You are an expert AI tool analyst. Your task is to identify the top 3 cautions for the tool named "${tool.Name}".
Based on your analysis, list the top 3 cautions for this tool.

For the 'Cautions' field, you MUST follow these STRICT REQUIREMENTS:
1. You MUST provide a list of 3 cautions.
2. You Must Not number the cautions.
3. Each caution should be a short sentence.
4. Each caution should be unique.
--- END STRICT REQUIREMENTS ---

--- Caution Examples ---

1. Complex designs might require a powerful computer to run smoothly.
2. Ongoing maintenance needed to keep the knowledge base updated and accurate.
3. Steep learning curve for new users.
4. Setup can be technical for non-developers.
5. Limited flexibility in demo customization.


Then, call the format_tool_cautions function with the list of cautions.`;

    return prompt;
};

export const createComparisonAnalysisPrompt = (toolA, toolB, useCasesA, useCasesB, category) => {
    // Join arrays with commas if they are arrays, otherwise use as-is
    const formatFeatures = (features) => Array.isArray(features) ? features.join(", ") : features;
    const formatCautions = (cautions) => Array.isArray(cautions) ? cautions.join(", ") : cautions;
    const formatUseCases = (useCases) => Array.isArray(useCases) ? useCases.join(", ") : useCases;

    return `You are an expert AI tool analyst. The user is comparing two tools within the '${category}' category. Based on the data provided for Tool A and Tool B, perform a comparative analysis relevant to this category. Identify 3-5 key strengths for each tool. Conclude with a summary explaining which tool is better suited for different types of users or tasks within the '${category}' context. Focus on their features, potential drawbacks (cautions), and primary use cases.

Tool A:
Name: ${toolA.Name}
Description: ${toolA.Description}
Features: ${formatFeatures(toolA.Features)}
Cautions: ${formatCautions(toolA.Cautions)}
Use Cases: ${formatUseCases(useCasesA)}

Tool B:
Name: ${toolB.Name}
Description: ${toolB.Description}
Features: ${formatFeatures(toolB.Features)}
Cautions: ${formatCautions(toolB.Cautions)}
Use Cases: ${formatUseCases(useCasesB)}

Now, call the 'format_comparison_analysis' function with the generated analysis.`;
};
