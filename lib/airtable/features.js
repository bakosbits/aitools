import { featuresTable } from "@/lib/airtable/base";

const mapFeatureRecord = (record) => ({
    id: record.id,
    Tool: record.get("Tool") || "",
    Feature: record.get("Feature") || "",
});

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
                `[getFeaturesForTool] Features for tool "${slug}" not found.`,
            );
            return [];
        }
        console.error(
            `[getFeaturesForTool] ERROR fetching features for tool "${slug}":`,
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function createFeature(featureData) {
    const newRecord = await featuresTable.create([
        {
            fields: featureData,
        },
    ]);

    return {
        id: newRecord[0].id,
        ...newRecord[0].fields,
    };
}

export async function updateFeature(id, Name) {
    const updatedRecord = await featuresTable.update([
        {
            id,
            fields: { Name },
        },
    ]);

    return {
        id: updatedRecord[0].id,
        ...updatedRecord[0].fields,
    };
}

export async function deleteFeature(id) {
    const deletedRecord = await featuresTable.destroy([id]);

    return {
        id: deletedRecord[0].id,
    };
}
