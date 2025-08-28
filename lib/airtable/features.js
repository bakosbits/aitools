import { toolFeaturesTable } from "./config";
import { mapRecord } from "./recordMappings";

// Features
export async function getAllFeatures() {
    try {
        const records = await toolFeaturesTable
            .select({
                fields: ["Tool", "Feature"],
            })
            .all();
        return records.map((record) => mapRecord(record, "feature"));
    } catch (error) {
        console.error(
            `[getAllFeatures] ERROR fetching all features:`,
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function getFeaturesByTool(slug) {
    try {
        const records = await toolFeaturesTable
            .select({
                filterByFormula: `{Tool} = '${slug}'`,
            })
            .all();
        return records.map((record) => mapRecord(record, "feature"));
    } catch (error) {
        if (error.statusCode === 404) {
            console.warn(
                `[getFeaturesByTool] Features for tool "${slug}" not found.`,
            );
            return [];
        }
        console.error(
            `[getFeaturesByTool] ERROR fetching features for tool "${slug}":`,
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function createManyFeatures(records) {
    try {
        const createdRecords = await toolFeaturesTable.create(
            records.map((r) => ({ fields: r })),
        );
        return createdRecords.map((record) => mapRecord(record, "feature"));
    } catch (error) {
        console.error("[createMany] ERROR creating features:", error);
        throw error;
    }
}

export async function deleteManyFeatures(recordIds) {
    try {
        const deletedRecords = await toolFeaturesTable.destroy(recordIds);
        return deletedRecords.map((r) => r.id);
    } catch (error) {
        console.error("[deleteMany] ERROR deleting features:", error);
        throw error;
    }
}

export async function deleteAllFeatures() {
    try {
        const allRecords = await toolFeaturesTable.select({ fields: ["id"] }).all();
        const allIds = allRecords.map((r) => r.id);
        if (allIds.length > 0) {
            await toolFeaturesTable.destroy(allIds);
            return true;
        }
        return false;
    } catch (error) {
        throw error;
    }
}