import Airtable from "airtable";

// Centralized check for all required Airtable environment variables.
const {
    AIRTABLE_API_KEY,
    AIRTABLE_TOOLS_BASE_ID,
    AIRTABLE_TOOLS_TABLE,
    AIRTABLE_CATEGORIES_TABLE,
    AIRTABLE_ARTICLES_TABLE,
    AIRTABLE_FEATURES_TABLE,
    AIRTABLE_USE_CASES_TABLE,
    AIRTABLE_CAUTIONS_TABLE,
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
    !AIRTABLE_FEATURES_TABLE ||
    !AIRTABLE_USE_CASES_TABLE ||
    !AIRTABLE_CAUTIONS_TABLE ||
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
    if (!AIRTABLE_USE_CASES_TABLE)
        console.error("   - AIRTABLE_TOOL_USE_CASES_TABLE is missing.");
    if (!AIRTABLE_FEATURES_TABLE)
        console.error("   - AIRTABLE_FEATURES_TABLE is missing.");
    if (!AIRTABLE_CAUTIONS_TABLE)
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

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(
    AIRTABLE_TOOLS_BASE_ID,
);

// Export pre-configured table connections
export const toolsTable = base(process.env.AIRTABLE_TOOLS_TABLE);
export const categoriesTable = base(process.env.AIRTABLE_CATEGORIES_TABLE);
export const articlesTable = base(process.env.AIRTABLE_ARTICLES_TABLE);
export const useCasesTable = base(process.env.AIRTABLE_USE_CASES_TABLE);
export const featuresTable = base(process.env.AIRTABLE_FEATURES_TABLE);
export const cautionsTable = base(process.env.AIRTABLE_CAUTIONS_TABLE);
export const cautionTagsTable = base(process.env.AIRTABLE_CAUTION_TAGS_TABLE);
export const useCaseTagsTable = base(process.env.AIRTABLE_USE_CASE_TAGS_TABLE);
export const useCasePillarsTable = base(
    process.env.AIRTABLE_USE_CASE_PILLARS_TABLE,
);

const recordMappings = {
    article: (record) => ({
        id: record.id,
        Title: record.get("Title") || "",
        Summary: record.get("Summary") || "",
        Content: record.get("Content") || "",
        Slug: record.get("Slug") || null,
        Date: record.get("Date") || null,
        Author: record.get("Author") || null,
        Published: record.get("Published") || false,
    }),
    category: (record) => {
        if (!record) return null;
        return {
            id: record.id,
            Name: record.fields["Name"],
            Slug: record.fields["Slug"] ?? null,
            Description: record.fields["Description"] ?? null,
            Count: record.fields["Count"] ?? 0,
            Tools: record.fields["Tools"] ?? [],
            ToolLookup: record.fields["Tool Lookup"] ?? [],
        };
    },
    caution: (record) => ({
        id: record.id,
        Tool: record.get("Tools") || "",
        Caution: record.get("Caution") || "",
    }),
    cautionTag: (record) => ({
        id: record.id,
        Name: record.get("Name"),
    }),
    feature: (record) => ({
        id: record.id,
        Tool: record.get("Tool") || "",
        Feature: record.get("Feature") || "",
    }),
    toolSummaries: (record) => {
        return {
            id: record.id,
            Slug: record.get("Slug") || "",
            Name: record.get("Name") || "",
            Logo: record.get("Logo") || "",
            Description: record.get("Description") || "",
            Why: record.get("Why") || "",
            Details: record.get("Details") || "",
            Active: record.get("Active") || false, // Array of Article record IDs
        };
    },
    newestTool: (record) => {
        return {
            id: record.id,
            Slug: record.get("Slug") || "",
            Logo: record.get("Logo") || "",
            Name: record.get("Name") || "",
            Why: record.get("Why") || "",
        };
    },
    tool: (record) => {
        return {
            id: record.id,
            Slug: record.get("Slug") || "",
            Logo: record.get("Logo") || "",
            Name: record.get("Name") || "",
            Domain: record.get("Domain") || "",
            Website: record.get("Website") || "",
            Description: record.get("Description") || "",
            Why: record.get("Why") || "",
            Details: record.get("Details") || "",
            UseCaseTags: record.get("UseCaseTags") || [], // Array of Tag record IDs
            CautionTags: record.get("CautionTags") || [], // Array of Caution record IDs
            Buyer: record.get("Buyer") || "",
            Pricing: Array.isArray(record.get("Pricing"))
                ? record.get("Pricing")
                : record.get("Pricing")
                  ? [record.get("Pricing")]
                  : [],
            Base_Model: record.get("Base_Model") || "",
            Categories: record.get("Categories") || [],
            Active: record.get("Active") || false, // Array of Article record IDs
        };
    },
    useCase: (record) => ({
        id: record.id,
        Tool: record.get("Tool") || "",
        UseCase: record.get("UseCase") || "",
    }),
    useCaseTag: (record) => ({
        id: record.id,
        Name: record.get("Name") || "",
    }),
    useCasePillar: (record) => ({
        id: record.id,
        Name: record.get("Name"),
    }),
};

export function mapRecord(record, type) {
    const mapping = recordMappings[type];
    if (!mapping) {
        throw new Error(`Invalid record type: ${type}`);
    }
    return mapping(record);
}

// Articles
export async function getAllArticles() {
    try {
        const records = await articlesTable
            .select({
                sort: [{ field: "Date", direction: "desc" }],
            })
            .all();

        return records.map((record) => mapRecord(record, "article"));
    } catch (error) {
        console.error(
            "[getAllArticles] ERROR fetching all articles:",
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function getArticleBySlug(Slug) {
    try {
        const records = await articlesTable
            .select({
                filterByFormula: `LOWER({Slug}) = '${Slug.toLowerCase()}'`,
                maxRecords: 1,
            })
            .firstPage();

        if (!records || records.length === 0) {
            console.warn(
                `[getArticleBySlug] Article with Slug "${Slug}" not found. Returning null.`,
            );
            return null;
        }

        const record = records[0];

        return mapRecord(record, "article");
    } catch (error) {
        console.error(
            `[getArticleBySlug] ERROR fetching article by Slug "${Slug}":`,
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function getArticleById(recordId) {
    try {
        const record = await articlesTable.find(recordId);
        return mapRecord(record, "article");
    } catch (error) {
        if (error.statusCode === 404) {
            console.warn(
                `[getArticleById] Article with ID "${recordId}" not found.`,
            );
            return null;
        }
        console.error(
            `[getArticleById] ERROR fetching article by ID "${recordId}":`,
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function createArticle(articleData) {
    try {
        const createdRecords = await articlesTable.create([
            { fields: articleData },
        ]);
        return mapRecord(createdRecords[0], "article");
    } catch (error) {
        console.error(
            "[createArticle] ERROR creating article:",
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function updateArticle(recordId, articleData) {
    try {
        const updatedRecords = await articlesTable.update([
            { id: recordId, fields: articleData },
        ]);
        return mapRecord(updatedRecords[0], "article");
    } catch (error) {
        console.error(
            `[updateArticle] ERROR updating article ID "${recordId}":`,
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function deleteArticle(recordId) {
    try {
        const deletedRecords = await articlesTable.destroy([recordId]);
        return deletedRecords[0];
    } catch (error) {
        console.error(
            `[deleteArticle] ERROR deleting article ID "${recordId}":`,
            error.message,
            error.stack,
        );
        throw error;
    }
}

// Categories
export async function getCategoriesByTool(slug) {
    const tools = await toolsTable
        .select({
            filterByFormula: `{Slug} = "${slug}"`,
            fields: ["Categories"],
        })
        .all();

    if (!tools.length || !tools[0].fields.Categories) {
        return [];
    }

    const tool = tools[0];
    const categoryIds = tool.fields.Categories;

    const records = await categoriesTable
        .select({
            filterByFormula: `OR(${categoryIds
                .map((id) => `RECORD_ID() = '${id}'`)
                .join(",")})`,
        })
        .all();

    return records.map((record) => mapRecord(record, "category"));
}

export async function getCategorySlugs() {
    try {
        const records = await categoriesTable
            .select({
                fields: ["Slug", "Name"],
            })
            .all();

        const mappedCategories = records.map((record) => ({
            id: record.id,
            Name: record.fields["Name"],
            Slug: record.fields["Slug"] ?? null,
        }));

        return mappedCategories;
    } catch (error) {
        console.error(
            "[getCategorySlugs] ERROR fetching all category slugs:",
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function getAllCategories() {
    if (!process.env.AIRTABLE_CATEGORIES_TABLE) {
        console.error(
            "CRITICAL ERROR: Missing AIRTABLE_CATEGORIES_TABLE environment variable in getAllCategoriesAdmin.",
        );
        throw new Error(
            "Missing AIRTABLE_CATEGORIES_TABLE environment variable",
        );
    }

    try {
        const categoryRecords = await categoriesTable
            .select({
                filterByFormula: "{Active} = TRUE()",
                fields: [
                    "Name",
                    "Slug",
                    "Description",
                    "Count",
                    "Tools",
                    "Tool Lookup",
                ],
            })
            .all();

        const mappedCategories = categoryRecords.map((record) =>
            mapRecord(record, "category"),
        );

        return mappedCategories;
    } catch (error) {
        console.error(
            "[getAllCategories] ERROR fetching all categories for admin:",
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function getCategoryById(recordId) {
    try {
        const record = await categoriesTable.find(recordId);
        return mapRecord(record, "category");
    } catch (error) {
        if (error.statusCode === 404) {
            console.warn(
                `[getCategoryById] Category with ID "${recordId}" not found.`,
            );
            return null;
        }
        console.error(
            `[getCategoryById] ERROR fetching category by ID "${recordId}":`,
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function createCategory(categoryData) {
    try {
        const createdRecords = await categoriesTable.create([
            { fields: categoryData },
        ]);
        return mapRecord(createdRecords[0], "category");
    } catch (error) {
        console.error(
            "[createCategory] ERROR creating category:",
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function updateCategory(recordId, categoryData) {
    try {
        const updatedRecords = await categoriesTable.update([
            { id: recordId, fields: categoryData },
        ]);
        return mapRecord(updatedRecords[0], "category");
    } catch (error) {
        console.error(
            `[updateCategory] ERROR updating category ID "${recordId}":`,
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function deleteCategory(recordId) {
    try {
        const deletedRecords = await categoriesTable.destroy([recordId]);
        return deletedRecords[0];
    } catch (error) {
        console.error(
            `[deleteCategory] ERROR deleting category ID "${recordId}":`,
            error.message,
            error.stack,
        );
        throw error;
    }
}

// Bulk Delete
export async function deleteAllUseCases() {
    try {
        const allRecords = await useCasesTable.select({ fields: ["id"] }).all();
        const allIds = allRecords.map((r) => r.id);
        if (allIds.length > 0) {
            await useCasesTable.destroy(allIds);
            return true;
        }
        return false;
    } catch (error) {
        throw error;
    }
}

export async function deleteAllFeatures() {
    try {
        const allRecords = await featuresTable.select({ fields: ["id"] }).all();
        const allIds = allRecords.map((r) => r.id);
        if (allIds.length > 0) {
            await featuresTable.destroy(allIds);
            return true;
        }
        return false;
    } catch (error) {
        throw error;
    }
}

export async function deleteAllCautions() {
    try {
        const allRecords = await cautionsTable.select({ fields: ["id"] }).all();
        const allIds = allRecords.map((r) => r.id);
        if (allIds.length > 0) {
            await cautionsTable.destroy(allIds);
            return true;
        }
        return false;
    } catch (error) {
        throw error;
    }
}

// Caution Tags
export async function getAllCautionTags() {
    try {
        const records = await cautionTagsTable
            .select({
                sort: [{ field: "Name", direction: "asc" }],
            })
            .all();

        return records.map((record) => mapRecord(record, "cautionTag"));
    } catch (error) {
        console.error(
            "[getAllCautionTags] ERROR fetching all caution tags:",
            error.message,
            error.stack,
        );
        throw error;
    }
}

export const updateCautionTags = async (toolId, validTags) => {
    try {
        const updatedRecord = await toolsTable.update([
            {
                id: toolId,
                fields: {
                    CautionTags: validTags,
                },
            },
        ]);
        if (!updatedRecord || !updatedRecord[0]) {
            console.error(
                "[updateCautionTags] No record updated for id:",
                toolId,
            );
        }
        return updatedRecord[0];
    } catch (error) {
        console.error("[updateCautionTags] ERROR updating tool", {
            toolId,
            validTags,
            error,
        });
        throw error;
    }
};

// Cautions
export async function getCautionsByTool(slug) {
    try {
        const records = await cautionsTable
            .select({
                filterByFormula: `{Tool} = '${slug}'`,
                fields: ["Tool", "Caution"],
            })
            .all();
        return records.map((record) => mapRecord(record, "caution"));
    } catch (error) {
        if (error.statusCode === 404) {
            console.warn(
                `[getCautionsForTool] Cautions for tool "${slug}" not found.`,
            );
            return [];
        }
        console.error(
            `[getCautionsForTool] ERROR fetching cautions for tool "${slug}":`,
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function createManyCautions(records) {
    try {
        const createdRecords = await cautionsTable.create(
            records.map((r) => ({ fields: r })),
        );
        return createdRecords.map((record) => mapRecord(record, "caution"));
    } catch (error) {
        console.error("[createMany] ERROR creating cautions:", error);
        throw error;
    }
}

export async function updateManyCautions(records) {
    try {
        const updatedRecords = await cautionsTable.update(
            records.map((r) => ({ id: r.id, fields: r })),
        );
        return updatedRecords.map((record) => mapRecord(record, "caution"));
    } catch (error) {
        console.error("[updateMany] ERROR updating cautions:", error);
        throw error;
    }
}

export async function deleteManyCautions(recordIds) {
    try {
        const deletedRecords = await cautionsTable.destroy(recordIds);
        return deletedRecords.map((r) => r.id);
    } catch (error) {
        console.error("[deleteMany] ERROR deleting cautions:", error);
        throw error;
    }
}

export async function getAllFeatures() {
    try {
        const records = await featuresTable
            .select({
                fields: ["Tool", "Feature"],
            })
            .all();
        return records.map((record) => mapRecord(record, "feature"));
    } catch (error) {
        console.error(
            `[getAllFeatures] ERROR fetching all features:`,
            error.message,
            error.stack,
        );
        throw error;
    }
}
// Features
export async function getFeaturesByTool(slug) {
    try {
        const records = await featuresTable
            .select({
                filterByFormula: `{Tool} = '${slug}'`,
            })
            .all();
        return records.map((record) => mapRecord(record, "feature"));
    } catch (error) {
        if (error.statusCode === 404) {
            console.warn(
                `[getFeaturesForTool] Features for tool "${slug}" not found.`,
            );
            return [];
        }
        console.error(
            `[getFeaturesForTool] ERROR fetching features for tool "${slug}":`,
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function createManyFeatures(records) {
    try {
        const createdRecords = await featuresTable.create(
            records.map((r) => ({ fields: r })),
        );
        return createdRecords.map((record) => mapRecord(record, "feature"));
    } catch (error) {
        console.error("[createMany] ERROR creating features:", error);
        throw error;
    }
}

export async function deleteManyFeatures(recordIds) {
    try {
        const deletedRecords = await featuresTable.destroy(recordIds);
        return deletedRecords.map((r) => r.id);
    } catch (error) {
        console.error("[deleteMany] ERROR deleting features:", error);
        throw error;
    }
}

export async function getNewestTools(count = 8) {
    try {
        const records = await toolsTable
            .select({
                filterByFormula: "{Active} = TRUE()",
                sort: [{ field: "Created", direction: "desc" }],
                maxRecords: count,
            })
            .all();

        return records.map((record) => mapRecord(record, "newestTool"));
    } catch (error) {
        console.error(
            "[getNewestTools] ERROR fetching newest tools:",
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function getToolsByCategory(categorySlug) {
    try {
        // Get the category record to access the Tool Lookup column
        const categoryRecords = await categoriesTable
            .select({
                filterByFormula: `{Slug} = "${categorySlug}"`,
                fields: ["Tool Lookup", "Name"], // Include Tool Lookup column
            })
            .firstPage();

        if (categoryRecords.length === 0) {
            console.warn(
                `[getToolsByCategory] No category found with slug "${categorySlug}"`,
            );
            return [];
        }

        const category = categoryRecords[0];
        const toolSlugs = category.fields["Tool Lookup"] || [];

        if (toolSlugs.length === 0) {
            return [];
        }

        // Get all active tools that match the slugs in Tool Lookup
        const records = await toolsTable
            .select({
                filterByFormula: `AND( {Active} = TRUE(), OR(${toolSlugs.map((slug) => `{Slug} = '${slug}'`).join(",")}))`,
            })
            .all();

        return records.map((record) => mapRecord(record, "tool"));
    } catch (error) {
        console.error(
            `[getToolsByCategory] ERROR fetching tools for category slug "${categorySlug}"`,
            error.message,
            error.stack,
        );
        throw error;
    }
}

// Tools
export async function getToolBySlug(Slug) {
    try {
        const result = await toolsTable
            .select({
                filterByFormula: `{Slug} = "${Slug}"`,
                sort: [{ field: "Name", direction: "asc" }],
                fields: [
                    "Name",
                    "Slug",
                    "Logo",
                    "Website",
                    "Description",
                    "Why",
                    "Details",
                    "Buyer",
                    "Pricing",
                    "Base_Model",
                ],
                maxRecords: 1,
            })
            .firstPage();

        if (!result || result.length === 0) {
            console.warn(
                `[getToolBySlug] Tool with Slug "${Slug}" not found. Returning null.`,
            );
            return null;
        }

        const toolRecord = result[0];
        const toolFields = toolRecord.fields;

        const Features = await getFeaturesByTool(Slug);
        const Cautions = await getCautionsByTool(Slug);

        return {
            id: toolRecord.id,
            ...toolFields,
            Features,
            Cautions,
        };
    } catch (error) {
        console.error(
            `[getToolBySlug] ERROR fetching tool by Slug "${Slug}"`,
            error.message,
            error.stack,
        );
        throw error;
    }
}

const mapToolRecord = (record) => {
    return {
        id: record.id,
        Slug: record.get("Slug") || "",
        Name: record.get("Name") || "",
        Domain: record.get("Domain") || "",
        Website: record.get("Website") || "",
        Description: record.get("Description") || "",
        Why: record.get("Why") || "",
        Details: record.get("Details") || "",
        UseCaseTags: record.get("UseCaseTags") || [], // Array of Tag record IDs
        CautionTags: record.get("CautionTags") || [], // Array of Caution record IDs
        Buyer: record.get("Buyer") || "",
        Pricing: Array.isArray(record.get("Pricing"))
            ? record.get("Pricing")
            : record.get("Pricing")
              ? [record.get("Pricing")]
              : [],
        Base_Model: record.get("Base_Model") || "",
        Categories: record.get("Categories") || [],
        Active: record.get("Active") || false, // Array of Article record IDs
    };
};

export async function getToolById(recordId) {
    try {
        const record = await toolsTable.find(recordId);
        const tool = mapToolRecord(record);
        // Fetch Features and Cautions by Slug (if available)
        let Features = [];
        let Cautions = [];
        if (tool.Slug) {
            Features = (await getFeaturesByTool(tool.Slug)).map(
                (f) => f.Feature,
            );
            Cautions = (await getCautionsByTool(tool.Slug)).map(
                (c) => c.Caution,
            );
        }
        return {
            ...tool,
            Features,
            Cautions,
        };
    } catch (error) {
        if (error.statusCode === 404) {
            console.warn(`[getToolById] Tool with ID "${recordId}" not found.`);
            return null;
        }
        console.error(
            `[getToolById] ERROR fetching tool by ID "${recordId}"`,
            error,
        );
        throw error;
    }
}

export async function getToolSummaries() {
    try {
        const records = await toolsTable
            .select({
                filterByFormula: "{Active} = TRUE()",
            })
            .all();
        return records.map((record) => mapRecord(record, "tool"));
    } catch (error) {
        console.error(
            `[getToolSummaries] ERROR fetching tool summaries:`,
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function getAllTools() {
    try {
        const records = await toolsTable
            .select({
                filterByFormula: "{Active} = TRUE()",
            })
            .all();
        return records.map((record) => mapRecord(record, "tool"));
    } catch (error) {
        console.error(
            "[getAllTools] ERROR fetching all tools:",
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function getAllToolSlugs() {
    try {
        const records = await toolsTable
            .select({
                filterByFormula: "{Active} = TRUE()",
            })
            .all();

        return records.map((record) => mapRecord(record, "tool"));
    } catch (error) {
        console.error(
            "[getAllToolSlugs] ERROR fetching all tool slugs:",
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function createTool(toolData) {
    try {
        const createdRecords = await toolsTable.create([{ fields: toolData }]);
        return mapRecord(createdRecords[0], "tool");
    } catch (error) {
        console.error("[createTool] ERROR creating tool:", error);
        throw error;
    }
}

export async function updateTool(recordId, toolData) {
    try {
        const updatedRecords = await toolsTable.update([
            { id: recordId, fields: toolData },
        ]);
        return mapRecord(updatedRecords[0], "tool");
    } catch (error) {
        console.error(
            `[updateTool] ERROR updating tool ID "${recordId}":`,
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function deleteTool(recordId) {
    try {
        const deletedRecords = await toolsTable.destroy([recordId]);
        return deletedRecords[0];
    } catch (error) {
        console.error(
            `[deleteTool] ERROR deleting tool ID "${recordId}":`,
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function updateToolCategories(toolId, categoryIds) {
    try {
        const updatedRecord = await toolsTable.update([
            {
                id: toolId,
                fields: {
                    Categories: categoryIds,
                },
            },
        ]);
        if (!updatedRecord || !updatedRecord[0]) {
            console.error(
                "[updateToolCategories] No record updated for id:",
                toolId,
            );
        }
        return updatedRecord[0];
    } catch (error) {
        console.error(`Error updating tool ${toolId} with categories:`, error);
        throw error;
    }
}

// Use Case Tags
export async function getAllUseCaseTags() {
    try {
        const records = await useCaseTagsTable
            .select({
                sort: [{ field: "Name", direction: "asc" }],
            })
            .all();
        return records.map((record) => mapRecord(record, "useCaseTag"));
    } catch (error) {
        console.error(
            "[getAllUseCaseTags] ERROR fetching all tags:",
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function updateUseCaseTags(toolId, validTags) {
    try {
        const updatedRecord = await toolsTable.update([
            {
                id: toolId,
                fields: {
                    UseCaseTags: validTags,
                },
            },
        ]);
        if (!updatedRecord || !updatedRecord[0]) {
            console.error(
                "[updateUseCaseTags] No record updated for id:",
                toolId,
            );
        }
        return updatedRecord[0];
    } catch (error) {
        console.error("[updateUseCaseTags] ERROR updating tool", {
            toolId,
            validTags,
            error,
        });
        throw error;
    }
}

// Use Cases
export async function getUseCasesByTool(slug) {
    try {
        const records = await useCasesTable
            .select({
                filterByFormula: `{Tool} = "${slug}"`,
                fields: ["Tool", "UseCase"],
            })
            .all();
        return records.map((record) => mapRecord(record, "useCase"));
    } catch (error) {
        if (error.statusCode === 404) {
            console.warn(
                `[getUseCasesByTool] Use cases for tool "${slug}" not found.`,
            );
            return [];
        }
        console.error(
            `[getUseCasesByTool] ERROR fetching use cases for tool "${slug}":`,
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function createManyUseCases(useCases) {
    if (!Array.isArray(useCases) || useCases.length === 0) return [];
    const recordsToCreate = useCases.map((u) => ({
        fields: u,
    }));
    const created = await useCasesTable.create(recordsToCreate);
    return created.map((r) => ({
        id: r.id,
        ...r.fields,
    }));
}

export async function getWizardData() {
    const [pillars, tags, tools] = await Promise.all([
        useCasePillarsTable
            .select({
                fields: ["Name", "UseCaseTags"],
                sort: [{ field: "Name", direction: "asc" }],
            })
            .all(),
        useCaseTagsTable
            .select({
                fields: ["Name", "Tools"],
                sort: [{ field: "Name", direction: "asc" }],
            })
            .all(),
        toolsTable
            .select({
                fields: [
                    "Name",
                    "Description",
                    "UseCaseTags",
                    "Logo",
                    "Why",
                    "Slug",
                ],
                filterByFormula: "{Active} = TRUE()",
            })
            .all(),
    ]);

    const tagIdToNameMap = tags.reduce((acc, tag) => {
        acc[tag.id] = tag.fields.Name;
        return acc;
    }, {});

    const useCaseCategories = pillars.map((pillar) => ({
        category: pillar.fields.Name,
        tags: (pillar.fields.UseCaseTags || [])
            .map((tagId) => tagIdToNameMap[tagId])
            .filter(Boolean),
    }));

    const allTools = tools.map((tool) => ({
        id: tool.id,
        Name: tool.fields.Name,
        Description: tool.fields.Description || "",
        tags: (tool.fields.UseCaseTags || [])
            .map((tagId) => tagIdToNameMap[tagId])
            .filter(Boolean),
        Logo: tool.fields.Logo || null,
        Why: tool.fields.Why || "",
        Slug: tool.fields.Slug || "",
    }));

    return { useCaseCategories, allTools };
}
