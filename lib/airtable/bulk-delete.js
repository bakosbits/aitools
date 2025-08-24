import { useCasesTable } from "@/lib/airtable/base";
import { featuresTable } from "@/lib/airtable/base";
import { cautionsTable } from "@/lib/airtable/base";

export async function deleteAllUseCases() {
    try {
        const allRecords = await useCasesTable.select({ fields: ["id"] }).all();
        const allIds = allRecords.map(r => r.id);
        if (allIds.length > 0) {
            await useCasesTable.destroy(allIds);
            return true;
        }
        return false;
    } catch (error) {
        throw error;
    }
}

export async function deleteAllFeatures() {
    try {
        const allRecords = await featuresTable.select({ fields: ["id"] }).all();
        const allIds = allRecords.map(r => r.id);
        if (allIds.length > 0) {
            await featuresTable.destroy(allIds);
            return true;
        }
        return false;
    } catch (error) {
        throw error;
    }
}

export async function deleteAllCautions() {
    try {
        const allRecords = await cautionsTable.select({ fields: ["id"] }).all();
        const allIds = allRecords.map(r => r.id);
        if (allIds.length > 0) {
            await cautionsTable.destroy(allIds);
            return true;
        }
        return false;
    } catch (error) {
        throw error;
    }
}
