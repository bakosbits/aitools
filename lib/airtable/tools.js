import { toolsTable, categoriesTable } from "@/lib/airtable/base";
import { getFeaturesByTool } from "@/lib/airtable/features";
import { getCautionsByTool } from "@/lib/airtable/cautions";

export async function getToolSummaries() {
    try {
        const allToolsRecords = await toolsTable
            .select({
                fields: ["Slug", "Name", "Why", "Description", "Details"],
                sort: [{ field: "Slug", direction: "asc" }],
                filterByFormula: "{Active} = TRUE()",
            })
            .all();

        if (allToolsRecords.length === 0) {
            return [];
        }

        const mappedTools = allToolsRecords.map((record) => ({
            id: record.id,
            Slug: record.fields["Slug"],
            Name: record.fields["Name"],
            Why: record.fields["Why"] || "",
            Description: record.fields["Description"] || "",
            Details: record.fields["Details"] || "",
        }));

        return mappedTools;
    } catch (error) {
        console.error(
            "[getAllToolsForTagUpdates] ERROR fetching all tools:",
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function getAllTools() {
    try {
        const categoryRecords = await categoriesTable
            .select({ fields: ["Name", "Slug"],
                    filterByFormula: "{Active} = TRUE()",
             })
            .all();

        const categoryMap = {};
        categoryRecords.forEach((cat) => {
            categoryMap[cat.id] = {
                id: cat.id,
                Name: cat.fields["Name"],
                Slug: cat.fields["Slug"],
            };
        });

        const toolRecords = await toolsTable
            .select({
                fields: [
                    "Name",
                    "Slug",
                    "Logo",
                    "Domain",
                    "Website",
                    "Description",
                    "Why",
                    "Details",
                    "Buyer",
                    "Pricing",
                    "Base_Model",
                    "Categories",
                    "Active",
                ],
            })
            .all();

        const mappedTools = toolRecords.map((record) => {
            const categoryIds = record.fields["Categories"] || [];
            const expandedCategories = categoryIds
                .map((id) => categoryMap[id])
                .filter(Boolean);

            return {
                id: record.id,
                ...record.fields,
                Categories: expandedCategories,
                Active: Boolean(record.fields["Active"]),
            };
        });

        return mappedTools;
    } catch (error) {
        console.error(
            "[getAllTools] ERROR fetching all tools, categories:",
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
                fields: ["Slug"],
            })
            .all();

        return records.map((record) => record.fields);
    } catch (error) {
        console.error(
            "[getAllToolSlugs] ERROR fetching all tool slugs:",
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
        const toolRecords = await toolsTable
            .select({
                filterByFormula: `AND(
          {Active} = TRUE(),
          OR(${toolSlugs.map((slug) => `{Slug} = '${slug}'`).join(",")})
        )`,
                fields: [
                    "Name",
                    "Slug",
                    "Logo",
                    "Description",
                    "Why",
                    "Base_Model",
                ],
            })
            .all();

        return toolRecords.map((record) => ({
            id: record.id,
            Name: record.fields["Name"],
            Slug: record.fields["Slug"] || null,
            Logo: record.fields["Logo"] || null,
            Description: record.fields["Description"] || null,
            Why: record.fields["Why"] || null,
            Base_Model: record.fields["Base_Model"] || null,
        }));
    } catch (error) {
        console.error(
            `[getToolsByCategory] ERROR fetching tools for category slug "${categorySlug}"`,
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function getNewestTools(count = 8) {
    try {
        const newestToolsRecords = await toolsTable
            .select({
                filterByFormula: "{Active} = TRUE()",
                sort: [{ field: "Created", direction: "desc" }],
                fields: ["Name", "Slug", "Logo", "Why"],
                maxRecords: count,
            })
            .all();

        if (newestToolsRecords.length === 0) {
            return [];
        }

        const mappedTools = newestToolsRecords.map((record) => ({
            Name: record.fields["Name"],
            Slug: record.fields["Slug"] || null,
            Logo: record.fields["Logo"] || null,
            Why: record.fields["Why"] || null,
        }));

        return mappedTools;
    } catch (error) {
        console.error(
            "[getNewestTools] ERROR fetching newest tools:",
            error.message,
            error.stack,
        );
        throw error;
    }
}

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
            Features = (await getFeaturesByTool(tool.Slug)).map(f => f.Feature);
            Cautions = (await getCautionsByTool(tool.Slug)).map(c => c.Caution);
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

export async function createTool(toolData) {
    try {
        const createdRecords = await toolsTable.create([{ fields: toolData }], {
            typecast: true,
        });
        return mapToolRecord(createdRecords[0]);
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
        return mapToolRecord(updatedRecords[0]);
    } catch (error) {
        console.error(
            `[updateTool] ERROR updating tool ID "${recordId}":`,
            error,
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
            error,
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
        return mapToolRecord(updatedRecord[0]);
    } catch (error) {
        console.error(`Error updating tool ${toolId} with categories:`, error);
        throw error;
    }
}
