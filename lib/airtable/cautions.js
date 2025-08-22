import { cautionsTable, cautionTagsTable } from "@/lib/airtable/base";

const mapCautionRecord = (record) => ({
    id: record.id,
    Tools: record.get("Tools") || "",
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
                `[getCautionsForTool] Cautions for tool "${slug}" not found.`
            );
            return [];
        }
        console.error(
            `[getCautionsForTool] ERROR fetching cautions for tool "${slug}":`,
            error.message,
            error.stack
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
            error.stack
        );
        throw error;
    }
}


export async function createMany(records) {
    try {
        const createdRecords = await cautionsTable.create(
            records.map((r) => ({ fields: r }))
        );
        return createdRecords.map(mapCautionRecord);
    } catch (error) {
        console.error("[createMany] ERROR creating cautions:", error);
        throw error;
    }
}

export async function updateMany(records) {
    try {
        const updatedRecords = await cautionsTable.update(
            records.map((r) => ({ id: r.id, fields: r }))
        );
        return updatedRecords.map(mapCautionRecord);
    } catch (error) {
        console.error("[updateMany] ERROR updating cautions:", error);
        throw error;
    }
}

export async function deleteMany(recordIds) {
    try {
        const deletedRecords = await cautionsTable.destroy(recordIds);
        return deletedRecords.map((r) => r.id);
    } catch (error) {
        console.error("[deleteMany] ERROR deleting cautions:", error);
        throw error;
    }
}


