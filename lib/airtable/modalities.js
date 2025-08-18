import { modalitiesTable } from "@/lib/airtable/base";

const mapModalityRecord = (record) => {
    return {
        id: record.id,
        Name: record.fields["Name"],
    };
};

export async function getAllModalities() {
    try {
        const modalityRecords = await modalitiesTable
            .select({
                fields: ["Name", "TagNames"],
            })
            .all();

        const mappedModalities = modalityRecords.map((record) => ({
            id: record.id,
            Name: record.fields["Name"],
            TagNames: record.fields["TagNames"],
        }));

        return mappedModalities;
    } catch (error) {
        console.error(
            "[getAllModalities] ERROR fetching modalities:",
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function getModalityById(recordId) {
    try {
        const record = await modalitiesTable.find(recordId);
        return mapModalityRecord(record);
    } catch (error) {
        if (error.statusCode === 404) {
            console.warn(
                `[getModalityById] Modality with ID "${recordId}" not found.`,
            );
            return null;
        }
        console.error(
            `[getModalityById] ERROR fetching modality by ID "${recordId}":`,
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function createModality(modalityData) {
    try {
        const createdRecords = await modalitiesTable.create([
            { fields: modalityData },
        ]);
        return mapModalityRecord(createdRecords[0]);
    } catch (error) {
        console.error(
            "[createModality] ERROR creating modality:",
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function updateModality(recordId, modalityData) {
    try {
        const updatedRecords = await modalitiesTable.update([
            { id: recordId, fields: modalityData },
        ]);
        return mapModalityRecord(updatedRecords[0]);
    } catch (error) {
        console.error(
            `[updateModality] ERROR updating modality ID "${recordId}":`,
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function deleteModality(recordId) {
    try {
        const deletedRecords = await modalitiesTable.destroy([recordId]);
        return deletedRecords[0];
    } catch (error) {
        console.error(
            `[deleteModality] ERROR deleting modality ID "${recordId}":`,
            error.message,
            error.stack,
        );
        throw error;
    }
}

export const updateModalityTags = async (id, tagIds) => {
    try {
        const updatedRecord = await modalitiesTable.update([
            {
                id: id,
                fields: {
                    Tags: tagIds,
                },
            },
        ]);
        return updatedRecord[0];
    } catch (error) {
        console.error(
            `Error updating preference ${id} with tags ${tagIds}:`,
            error,
        );
        throw error;
    }
};
