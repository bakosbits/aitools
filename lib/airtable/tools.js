import { toolsTable, categoriesTable } from "./config";
import { mapRecord } from "./recordMappings";
import { getFeaturesByTool } from "./features";
import { getCautionsByTool } from "./cautions";

export async function getNewestTools(count = 8) {
    try {
        const records = await toolsTable
            .select({
                fields: ["Name", "Slug", "Logo", "Why"],
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

export async function getToolById(recordId) {
    try {
        const record = await toolsTable.find(recordId);
        const tool = mapRecord(record, "tool");
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
                fields:["Name", "Slug", "Website", "Logo", "Description", "Why"],
                filterByFormula: "{Active} = TRUE()",
            })
            .all();
        return records.map((record) => mapRecord(record, "toolSummary"));
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
