import { preferencesTable } from "./base";

const mapPreferenceRecord = (record) => ({
  id: record.id,
  Name: record.get("Name") || "",
  Tags: record.get("Tags") || [],
  TagNames: record.get("TagNames") || [],
});

export async function getAllPreferences() {
  try {
    const records = await preferencesTable
      .select({
        fields: ["Name", "Tags", "TagNames"],
        sort: [{ field: "Name", direction: "asc" }],
      })
      .all();

    return records.map(mapPreferenceRecord);
  } catch (error) {
    console.error(
      "[getAllPreferences] ERROR fetching all preferences:",
      error.message,
      error.stack,
    );
    throw error;
  }
}

export async function getPreferenceById(recordId) {
  try {
    const record = await preferencesTable.find(recordId);
    return mapPreferenceRecord(record);
  } catch (error) {
    if (error.statusCode === 404) {
      console.warn(
        `[getPreferenceById] Preference with ID "${recordId}" not found.`,
      );
      return null;
    }
    console.error(
      `[getPreferenceById] ERROR fetching preference by ID "${recordId}":`,
      error.message,
      error.stack,
    );
    throw error;
  }
}

export async function createPreference(preferenceData) {
  try {
    const createdRecords = await preferencesTable.create([
      { fields: preferenceData },
    ]);
    return mapPreferenceRecord(createdRecords[0]);
  } catch (error) {
    console.error(
      "[createPreference] ERROR creating preference:",
      error.message,
      error.stack,
    );
    throw error;
  }
}

export async function updatePreference(recordId, preferenceData) {
  try {
    const updatedRecords = await preferencesTable.update([
      { id: recordId, fields: preferenceData },
    ]);
    return mapPreferenceRecord(updatedRecords[0]);
  } catch (error) {
    console.error(
      `[updatePreference] ERROR updating preference ID "${recordId}":`,
      error.message,
      error.stack,
    );
    throw error;
  }
}

export async function deletePreference(recordId) {
  try {
    const deletedRecords = await preferencesTable.destroy([recordId]);
    return deletedRecords[0];
  } catch (error) {
    console.error(
      `[deletePreference] ERROR deleting preference ID "${recordId}":`,
      error.message,
      error.stack,
    );
    throw error;
  }
}

export const updatePreferenceTags = async (id, tagIds) => {
  try {
    const updatedRecord = await preferencesTable.update([
      {
        id: id,
        fields: {
          Tags: tagIds,
        },
      },
    ]);
    return updatedRecord[0];
  } catch (error) {
    console.error(
      `Error updating preference ${id} with tags ${tagIds}:`,
      error,
    );
    throw error;
  }
};
