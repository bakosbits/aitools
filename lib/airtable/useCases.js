import { useCaseTagsTable, toolUseCasesTable, useCasePillarsTable, toolsTable } from "./config";
import { mapRecord } from "./recordMappings";

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
        const records = await toolUseCasesTable
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
    const created = await toolUseCasesTable.create(recordsToCreate);
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

export async function deleteManyUseCases(recordIds) {
    try {
        const deletedRecords = await toolUseCasesTable.destroy(recordIds);
        return deletedRecords.map((r) => r.id);
    } catch (error) {
        console.error("[deleteMany] ERROR deleting features:", error);
        throw error;
    }
}


export async function deleteAllUseCases() {
    try {
        const allRecords = await toolUseCasesTable.select({ fields: ["id"] }).all();
        const allIds = allRecords.map((r) => r.id);
        if (allIds.length > 0) {
            await toolUseCasesTable.destroy(allIds);
            return true;
        }
        return false;
    } catch (error) {
        throw error;
    }
}