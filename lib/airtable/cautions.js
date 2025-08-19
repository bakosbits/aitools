import { cautionsTable, cautionTagsTable } from "@/lib/airtable/base";


const mapCautionRecord = (record) => ({
    id: record.id,
    Tools: record.get("Tools") || "",
    Caution: record.get("Caution") || "",
});


const mapCautionTagRecord = (record) => ({
    id: record.id,
    Tools: record.get("Tools") || "",
    Name: record.get("Name") || "",
});

export async function getAllCautionTags() {
    try {
        const records = await cautionTagsTable
            .select({
                fields: ["Name"],
            })
            .all();
        return records.map(mapCautionTagRecord);
    } catch (error) {
        if (error.statusCode === 404) {
            console.warn(
                `[getAllCautionTags] No caution tags found.`,
            );
            return [];
        }
        console.error(
            `[getAllCautionTags] ERROR fetching caution tags:`,
            error.message,
            error.stack,
        );
        throw error;
    }
}

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
