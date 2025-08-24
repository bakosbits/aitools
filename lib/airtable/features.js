import { featuresTable } from "@/lib/airtable/base";

const mapFeatureRecord = (record) => ({
    id: record.id,
    Tool: record.get("Tool") || "",
    Feature: record.get("Feature") || "",
});

export async function getAllFeatures() {
    try {
        const records = await featuresTable
            .select({
                fields: ["Tool", "Feature"],
            })
            .all();
        return records.map(mapFeatureRecord);
    } catch (error) {
        if (error.statusCode === 404) {
            console.warn(
                `[getFeaturesForTool] Features for tool "${slug}" not found.`
            );
            return [];
        }
        console.error(
            `[getFeaturesForTool] ERROR fetching features for tool "${slug}":`,
            error.message,
            error.stack
        );
        throw error;
    }
}

export async function getFeaturesByTool(slug) {
    try {
        const records = await featuresTable
            .select({
                filterByFormula: `{Tool} = '${slug}'`,
                fields: ["Tool", "Feature"],
            })
            .all();
        return records.map(mapFeatureRecord);
    } catch (error) {
        if (error.statusCode === 404) {
            console.warn(
                `[getFeaturesForTool] Features for tool "${slug}" not found.`
            );
            return [];
        }
        console.error(
            `[getFeaturesForTool] ERROR fetching features for tool "${slug}":`,
            error.message,
            error.stack
        );
        throw error;
    }
}

export async function createFeature(featureData) {
    try {
        const createdRecords = await featuresTable.create([
            { fields: featureData },
        ]);
        return mapFeatureRecord(createdRecords[0]);
    } catch (error) {
        console.error(
            "[createFeature] ERROR creating feature:",
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function createMany(records) {
    try {
        const createdRecords = await featuresTable.create(
            records.map((r) => ({ fields: r }))
        );
        return createdRecords.map(mapFeatureRecord);
    } catch (error) {
        console.error("[createMany] ERROR creating features:", error);
        throw error;
    }
}

export async function updateMany(records) {
    try {
        const updatedRecords = await featuresTable.update(
            records.map((r) => ({ id: r.id, fields: r }))
        );
        return updatedRecords.map(mapFeatureRecord);
    } catch (error) {
        console.error("[updateMany] ERROR updating features:", error);
        throw error;
    }
}

export async function deleteMany(recordIds) {
    try {
        const deletedRecords = await featuresTable.destroy(recordIds);
        return deletedRecords.map((r) => r.id);
    } catch (error) {
        console.error("[deleteMany] ERROR deleting features:", error);
        throw error;
    }
}