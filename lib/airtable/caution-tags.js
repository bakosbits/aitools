import { cautionTagsTable } from "@/lib/airtable/base";
4
const mapCautionRecord = (record) => ({
    id: record.id,
    Tools: record.get("Tools") || "",
    Caution: record.get("Caution") || "",
});

export async function getAllCautionTags() {
    try {
        const records = await cautionTagsTable
            .select({
                fields: ["Name"],
            })
            .all();

        return records.map((record) => ({
            id: record.id,
            Name: record.get("Name"),
        }));
    } catch (error) {
        console.error(
            "[getAllCautionTags] ERROR fetching all caution tags:",
            error.message,
            error.stack
        );
        throw error;
    }
}