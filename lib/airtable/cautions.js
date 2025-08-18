import { cautionsTable } from "@/lib/airtable/base";

const mapCautionRecord = (record) => ({
    id: record.id,
    Tool: record.get("Tool") || "",
    Caution: record.get("Caution") || "",
});

export async function getCautionsByTool(slug) {
    try {
        const records = await cautionsTable
            .select({
                filterByFormula: `{Tool} = '${slug}'`,
                fields: ["Tool", "Caution"],
            })
            .all();
        return records.map(mapCautionRecord);
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

export async function createCaution(cautionData) {
    try {
        const createdRecords = await cautionsTable.create([
            { fields: cautionData },
        ]);
        return mapCautionRecord(createdRecords[0]);
    } catch (error) {
        console.error(
            "[createCaution] ERROR creating caution:",
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function updateCaution(recordId, cautionData) {
    try {
        const updatedRecords = await cautionsTable.update(
            [
                {
                    id: recordId,
                    fields: cautionData,
                },
            ],
            { typecast: true },
        );
        return mapCautionRecord(updatedRecords[0]);
    } catch (error) {
        console.error(
            `[updateCaution] ERROR updating caution ID "${recordId}":`,
            error,
        );
        throw error;
    }
}

export async function deleteCaution(recordId) {
    try {
        const deletedRecords = await cautionsTable.destroy([recordId]);
        return deletedRecords[0];
    } catch (error) {
        console.error(
            `[deleteCaution] ERROR deleting caution ID "${recordId}":`,
            error.message,
            error.stack,
        );
        throw error;
    }
}
