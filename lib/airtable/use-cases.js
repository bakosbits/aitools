import { useCasesTable, useCasePillarsTable, useCaseTagsTable, toolsTable } from "@/lib/airtable/base";

const mapUseCaseRecord = (record) => ({
    id: record.id,
    Tool: record.get("Tool") || "",
    UseCase: record.get("UseCase") || "",
});



export async function getUseCasesByTool(slug) {
    try {
        const records = await useCasesTable
            .select({
                filterByFormula: `{Tool} = "${slug}"`,
                fields: ["Tool", "UseCase"],
            })
            .all();
        return records.map(mapUseCaseRecord);
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


export async function getUseCaseById(recordId) {
    try {
        const record = await useCasesTable.find(recordId);
        return mapUseCaseRecord(record);
    } catch (error) {
        if (error.statusCode === 404) {
            console.warn(
                `[getUseCaseById] Use case with ID "${recordId}" not found.`,
            );
            return null;
        }
        console.error(
            `[getUseCaseById] ERROR fetching use case by ID "${recordId}":`,
            error.message,
            error.stack,
        );
        throw error;
    }
}


export async function createUseCase(useCaseData) {
    try {
        const newRecord = await useCasesTable.create([
            {
                fields: useCaseData,
            },
        ]);
        return {
            id: newRecord[0].id,
            ...newRecord[0].fields,
        };
    } catch (error) {
        console.error("[createUseCase] ERROR creating use case:", error);
        throw error;
    }
}

// Batch create use cases
export async function createMany(useCases) {
    if (!Array.isArray(useCases) || useCases.length === 0) return [];
    const recordsToCreate = useCases.map((u) => ({ fields: u }));
    const created = await useCasesTable.create(recordsToCreate);
    return created.map((r) => ({ id: r.id, ...r.fields }));
}

export async function getAllUseCases() {
    try {
        const useCaseRecords = await useCasesTable
            .select({
                fields: ["Tool", "Use Case"],
            })
            .all();

        const mappedUseCases = useCaseRecords.map((record) => ({
            id: record.id,
            Tool: record.fields["Tool"],
            UseCase: record.fields["Use Case"],
        }));

        return mappedUseCases;
    } catch (error) {
        console.error(
            "[getAllUseCases] ERROR fetching use cases:",
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function getWizardData() {
    const [pillars, tags, tools] = await Promise.all([
        useCasePillarsTable.select({
            fields: ["Name", "UseCaseTags"],
            sort: [{ field: "Name", direction: "asc" }],
        }).all(),
        useCaseTagsTable.select({
            fields: ["Name", "Tools"],
            sort: [{ field: "Name", "direction": "asc" }],
        }).all(),
        toolsTable.select({
            fields: ["Name", "Description", "UseCaseTags", "Logo", "Why", "Slug"],
            filterByFormula: "{Active} = TRUE()",
        }).all(),
    ]);

    const tagIdToNameMap = tags.reduce((acc, tag) => {
        acc[tag.id] = tag.fields.Name;
        return acc;
    }, {});

    const useCaseCategories = pillars.map(pillar => ({
        category: pillar.fields.Name,
        tags: (pillar.fields.UseCaseTags || []).map(tagId => tagIdToNameMap[tagId]).filter(Boolean),
    }));

    const allTools = tools.map(tool => ({
        id: tool.id,
        Name: tool.fields.Name,
        Description: tool.fields.Description || "",
        tags: (tool.fields.UseCaseTags || []).map(tagId => tagIdToNameMap[tagId]).filter(Boolean),
        Logo: tool.fields.Logo || null,
        Why: tool.fields.Why || "",
        Slug: tool.fields.Slug || "",
    }));

    return { useCaseCategories, allTools };
}