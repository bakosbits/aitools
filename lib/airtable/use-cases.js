import {
    useCaseTagsTable,
    useCasePillarsTable,
    useCasesTable,
    toolsTable,
} from "@/lib/airtable/base";

const mapUseCaseRecord = (record) => ({
    id: record.id,
    Tool: record.get("Tool") || "",
    UseCase: record.get("UseCase") || "",
});

const mapUseCasePillarsRecord = (record) => ({
    id: record.id,
    UseCase: record.get("UseCase") || "",
});

const mapUseCaseTagsRecord = (record) => ({
    id: record.id,
    Name: record.get("Name") || "",
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

export async function getAllUseCasePillars() {
    try {
        const records = await useCasePillarsTable
            .select({
                fields: ["Name"],
                sort: [{ field: "Name", direction: "asc" }],
            })
            .all();

        return records.map(mapUseCasePillarsRecord);
    } catch (error) {
        console.error(
            "[getAllUseCases] ERROR fetching all use cases:",
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function getAllUseCaseTags() {
    try {
        const records = await useCaseTagsTable
            .select({
                fields: ["Name"],
            })
            .all();

        return records.map(mapUseCaseTagsRecord);
    } catch (error) {
        console.error(
            "[getAllUseCaseTags] ERROR fetching all use cases:",
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function createUseCasePillar(useCaseTagsPillarData) {
    try {
        const createdRecords = await useCasePillarsTable.create([
            { fields: useCaseTagsPillarData },
        ]);
        return mapUseCasePillarsRecord(createdRecords[0]);
    } catch (error) {
        console.error(
            "[createUseCase] ERROR creating use case:",
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function updateUseCasePillar(recordId, pillarName) {
    try {
        const updatedRecord = await useCasePillarsTable.update([
            {
                id: recordId,
                fields: {
                    Name: pillarName,
                },
            },
        ]);
        return updatedRecord[0];
    } catch (error) {
        console.error(
            `Error updating use case ${recordId} with pillar ${pillarName}:`,
            error,
        );
        throw error;
    }
}

export async function deleteUseCasePillar(recordId) {
    try {
        const deletedRecords = await useCasePillarsTable.destroy([recordId]);
        return deletedRecords[0];
    } catch (error) {
        console.error(
            `[deleteUseCasePillar] ERROR deleting use case ID "${recordId}":`,
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function createUseCaseTags(useCaseTags) {
    try {
        const recordsToCreate = useCaseTags.map((name) => ({
            fields: {
                Name: name,
            },
        }));

        const createdRecords = await useCaseTagsTable.create(recordsToCreate);
        return createdRecords.map(mapUseCaseTagsRecord);
    } catch (error) {
        console.error(
            "[createUseCaseTags] ERROR creating use cases:",
            error.message,
            error.stack,
        );
        throw error;
    }
}

export const updateUseCaseTags = async (id, tagName) => {
    try {
        const updatedRecord = await useCaseTagsTable.update([
            {
                id: id,
                fields: {
                    Name: tagName,
                },
            },
        ]);
        return updatedRecord[0];
    } catch (error) {
        console.error(
            `Error updating use case ${id} with tags ${tagName}:`,
            error,
        );
        throw error;
    }
};

export async function deleteUseCaseTags(recordId) {
    try {
        const deletedRecords = await useCaseTagsTable.destroy([recordId]);
        return deletedRecords[0];
    } catch (error) {
        console.error(
            `[deleteUseCaseTags] ERROR deleting sub pillar ID "${recordId}":`,
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
    const newRecord = await useCasesTable.create([
        {
            fields: useCaseData,
        },
    ]);

    return {
        id: newRecord[0].id,
        ...newRecord[0].fields,
    };
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
            sort: [{ field: "Name", direction: "asc" }],
        }).all(),
        toolsTable.select({
            fields: ["Name", "Description", "UseCaseTags", "Logo", "Why", "Slug"],
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
