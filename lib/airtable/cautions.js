import { toolCautionsTable, cautionTagsTable, toolsTable } from "./config";
import { mapRecord } from "./recordMappings";

// Caution Tags
export async function getAllCautionTags() {
    try {
        const records = await cautionTagsTable
            .select({
                sort: [{ field: "Name", direction: "asc" }],
            })
            .all();

        return records.map((record) => mapRecord(record, "cautionTag"));
    } catch (error) {
        console.error(
            "[getAllCautionTags] ERROR fetching all caution tags:",
            error.message,
            error.stack,
        );
        throw error;
    }
}

export const updateCautionTags = async (toolId, validTags) => {
    try {
        const updatedRecord = await toolsTable.update([
            {
                id: toolId,
                fields: {
                    CautionTags: validTags,
                },
            },
        ]);
        if (!updatedRecord || !updatedRecord[0]) {
            console.error(
                "[updateCautionTags] No record updated for id:",
                toolId,
            );
        }
        return updatedRecord[0];
    } catch (error) {
        console.error("[updateCautionTags] ERROR updating tool", {
            toolId,
            validTags,
            error,
        });
        throw error;
    }
};

// Cautions
export async function getCautionsByTool(slug) {
    try {
        const records = await toolCautionsTable
            .select({
                filterByFormula: `{Tool} = '${slug}'`,
                fields: ["Tool", "Caution"],
            })
            .all();
        return records.map((record) => mapRecord(record, "caution"));
    } catch (error) {
        if (error.statusCode === 404) {
            console.warn(
                `[getCautionsByTool] Cautions for tool "${slug}" not found.`,
            );
            return [];
        }
        console.error(
            `[getCautionsByTool] ERROR fetching cautions for tool "${slug}":`,
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function createManyCautions(records) {
    try {
        const createdRecords = await toolCautionsTable.create(
            records.map((r) => ({ fields: r })),
        );
        return createdRecords.map((record) => mapRecord(record, "caution"));
    } catch (error) {
        console.error("[createMany] ERROR creating cautions:", error);
        throw error;
    }
}

export async function updateManyCautions(records) {
    try {
        const updatedRecords = await toolCautionsTable.update(
            records.map((r) => ({ id: r.id, fields: r })),
        );
        return updatedRecords.map((record) => mapRecord(record, "caution"));
    } catch (error) {
        console.error("[updateMany] ERROR updating cautions:", error);
        throw error;
    }
}

export async function deleteManyCautions(recordIds) {
    try {
        const deletedRecords = await toolCautionsTable.destroy(recordIds);
        return deletedRecords.map((r) => r.id);
    } catch (error) {
        console.error("[deleteMany] ERROR deleting cautions:", error);
        throw error;
    }
}

export async function deleteAllCautions() {
    try {
        const allRecords = await toolCautionsTable.select({ fields: ["id"] }).all();
        const allIds = allRecords.map((r) => r.id);
        if (allIds.length > 0) {
            await toolCautionsTable.destroy(allIds);
            return true;
        }
        return false;
    } catch (error) {
        throw error;
    }
}