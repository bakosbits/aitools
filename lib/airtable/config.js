import Airtable from "airtable";

// Centralized check for all required Airtable environment variables.
const {
    AIRTABLE_API_KEY,
    AIRTABLE_TOOLS_BASE_ID,
    AIRTABLE_TOOLS_TABLE,
    AIRTABLE_CATEGORIES_TABLE,
    AIRTABLE_ARTICLES_TABLE,
    AIRTABLE_TOOL_FEATURES_TABLE,
    AIRTABLE_TOOL_USE_CASES_TABLE,
    AIRTABLE_TOOL_CAUTIONS_TABLE,
    AIRTABLE_CAUTION_TAGS_TABLE,
    AIRTABLE_USE_CASE_TAGS_TABLE,
    AIRTABLE_USE_CASE_PILLARS_TABLE,
} = process.env;

if (
    !AIRTABLE_API_KEY ||
    !AIRTABLE_TOOLS_BASE_ID ||
    !AIRTABLE_TOOLS_TABLE ||
    !AIRTABLE_CATEGORIES_TABLE ||
    !AIRTABLE_ARTICLES_TABLE ||
    !AIRTABLE_TOOL_FEATURES_TABLE ||
    !AIRTABLE_TOOL_USE_CASES_TABLE ||
    !AIRTABLE_TOOL_CAUTIONS_TABLE ||
    !AIRTABLE_CAUTION_TAGS_TABLE ||
    !AIRTABLE_USE_CASE_PILLARS_TABLE ||
    !AIRTABLE_USE_CASE_TAGS_TABLE
) {
    console.error("CRITICAL ERROR: Missing Airtable Environment Variables!");
    if (!AIRTABLE_API_KEY) console.error("   - AIRTABLE_API_KEY is missing.");
    if (!AIRTABLE_TOOLS_BASE_ID)
        console.error("   - AIRTABLE_TOOLS_BASE_ID is missing.");
    if (!AIRTABLE_TOOLS_TABLE)
        console.error("   - AIRTABLE_TOOLS_TABLE is missing.");
    if (!AIRTABLE_CATEGORIES_TABLE)
        console.error("   - AIRTABLE_CATEGORIES_TABLE is missing.");
    if (!AIRTABLE_ARTICLES_TABLE)
        console.error("   - AIRTABLE_ARTICLES_TABLE is missing.");
    if (!AIRTABLE_TOOL_USE_CASES_TABLE)
        console.error("   - AIRTABLE_TOOL_USE_CASES_TABLE is missing.");
    if (!AIRTABLE_TOOL_FEATURES_TABLE)
        console.error("   - AIRTABLE_FEATURES_TABLE is missing.");
    if (!AIRTABLE_TOOL_CAUTIONS_TABLE)
        console.error("   - AIRTABLE_CAUTIONS_TABLE is missing.");
    if (!AIRTABLE_USE_CASE_TAGS_TABLE)
        console.error("   - AIRTABLE_USE_CASE_TAGS_TABLE is missing.");
    if (!AIRTABLE_CAUTION_TAGS_TABLE)
        console.error("   - AIRTABLE_CAUTION_TAGS_TABLE is missing.");
    if (!AIRTABLE_USE_CASE_PILLARS_TABLE)
        console.error("   - AIRTABLE_USE_CASE_PILLARS_TABLE is missing.");

    throw new Error(
        "Missing Airtable environment variables. Please check your .env.local file for ALL required variables.",
    );
}

export const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(
    AIRTABLE_TOOLS_BASE_ID,
);

// Export pre-configured table connections
export const toolsTable = base(process.env.AIRTABLE_TOOLS_TABLE);
export const categoriesTable = base(process.env.AIRTABLE_CATEGORIES_TABLE);
export const articlesTable = base(process.env.AIRTABLE_ARTICLES_TABLE);
export const toolUseCasesTable = base(process.env.AIRTABLE_TOOL_USE_CASES_TABLE);
export const toolFeaturesTable = base(process.env.AIRTABLE_TOOL_FEATURES_TABLE);
export const toolCautionsTable = base(process.env.AIRTABLE_TOOL_CAUTIONS_TABLE);
export const cautionTagsTable = base(process.env.AIRTABLE_CAUTION_TAGS_TABLE);
export const useCaseTagsTable = base(process.env.AIRTABLE_USE_CASE_TAGS_TABLE);
export const useCasePillarsTable = base(process.env.AIRTABLE_USE_CASE_PILLARS_TABLE);
