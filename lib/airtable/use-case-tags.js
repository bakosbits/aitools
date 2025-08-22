import { useCaseTagsTable, toolsTable } from "@/lib/airtable/base";

const mapTagRecord = (record) => ({
    id: record.id,
    Name: record.get("Name") || "",
});

export async function getAllUseCaseTags() {
    try {
        const records = await useCaseTagsTable
            .select({
                sort: [{ field: "Name", direction: "asc" }],
            })
            .all();

        return records.map(mapTagRecord);
    } catch (error) {
        console.error(
            "[getAllTags] ERROR fetching all tags:",
            error.message,
            error.stack,
        );
        throw error;
    }
}


export async function createUseCaseTag(useCaseTags) {
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

export const updateUseCaseTags = async (toolId, validTags) => {
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
            console.error('[updateUseCaseTags] No record updated for id:', toolId);
        }
        return updatedRecord[0];
    } catch (error) {
        console.error('[updateUseCaseTags] ERROR updating tool', { toolId, validTags, error });
        throw error;
    }
};

export async function deleteUseCaseTag(recordId) {
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