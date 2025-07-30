import Airtable from "airtable";

// Centralized check for all required Airtable environment variables.
const {
    AIRTABLE_API_KEY,
    AIRTABLE_TOOLS_BASE_ID,
    AIRTABLE_TOOLS_TABLE,
    AIRTABLE_CATEGORIES_TABLE,
    AIRTABLE_ARTICLES_TABLE,
    AIRTABLE_ALIASES_TABLE,
} = process.env;

if (
    !AIRTABLE_API_KEY ||
    !AIRTABLE_TOOLS_BASE_ID ||
    !AIRTABLE_TOOLS_TABLE ||
    !AIRTABLE_CATEGORIES_TABLE ||
    !AIRTABLE_ARTICLES_TABLE ||
    !AIRTABLE_ALIASES_TABLE
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
    if (!AIRTABLE_ALIASES_TABLE)
        console.error("   - AIRTABLE_ALIASES_TABLE is missing.");

    throw new Error(
        "Missing Airtable environment variables. Please check your .env.local file for ALL required variables.",
    );
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(
    AIRTABLE_TOOLS_BASE_ID,
);

// Export pre-configured table connections
export const toolsTable = base(process.env.AIRTABLE_TOOLS_TABLE);
export const categoriesTable = base(process.env.AIRTABLE_CATEGORIES_TABLE);
export const articlesTable = base(process.env.AIRTABLE_ARTICLES_TABLE);
export const aliasesTable = base(process.env.AIRTABLE_ALIASES_TABLE);

// Export the base itself if needed for other operations
export default base;