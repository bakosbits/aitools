import { useCasePillarsTable } from "@/lib/airtable/base";

const mapUseCasePillarsRecord = (record) => ({
    id: record.id,
    UseCase: record.get("UseCase") || "",
});

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