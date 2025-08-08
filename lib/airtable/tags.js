import { tagsTable } from "@/lib/airtable/base";

const mapTagRecord = (record) => ({
  id: record.id,
  Name: record.get("Name") || "",
});

export async function getAllTags() {
  try {
    const records = await tagsTable
      .select({
        sort: [{ field: "Name", direction: "asc" }],
      })
      .all();

    return records.map(mapTagRecord);
  } catch (error) {
    console.error(
      "[getAllTags] ERROR fetching all tags for admin:",
      error.message,
      error.stack
    );
    throw error;
  }
}

export async function getTagById(recordId) {
  try {
    const record = await tagsTable.find(recordId);
    return mapTagRecord(record);
  } catch (error) {
    if (error.statusCode === 404) {
      console.warn(`[getTagById] Tag with ID "${recordId}" not found.`);
      return null;
    }
    console.error(
      `[getTagById] ERROR fetching tag by ID "${recordId}":`,
      error.message,
      error.stack
    );
    throw error;
  }
}

export async function createTag(tagData) {
  try {
    const createdRecords = await tagsTable.create([{ fields: tagData }]);
    return mapTagRecord(createdRecords[0]);
  } catch (error) {
    console.error("[createTag] ERROR creating tag:", error.message, error.stack);
    throw error;
  }
}

export async function updateTag(recordId, tagData) {
  try {
    const updatedRecords = await tagsTable.update([
      { id: recordId, fields: tagData },
    ]);
    return mapTagRecord(updatedRecords[0]);
  } catch (error) {
    console.error(
      `[updateTag] ERROR updating tag ID "${recordId}":`,
      error.message,
      error.stack
    );
    throw error;
  }
}

export async function deleteTag(recordId) {
  try {
    const deletedRecords = await tagsTable.destroy([recordId]);
    return deletedRecords[0];
  } catch (error) {
    console.error(
      `[deleteTag] ERROR deleting tag ID "${recordId}":`,
      error.message,
      error.stack
    );
    throw error;
  }
}
