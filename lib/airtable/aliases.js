import { aliasesTable } from "@/lib/airtable/base";

export async function getAllAliases() {
  try {
    const aliasRecords = await aliasesTable
      .select({
        fields: ["Type", "Name", "Aliases"],
      })
      .all();

    const aliases = {};
    aliasRecords.forEach((record) => {
      const type = record.fields.Type;
      const name = record.fields.Name;
      const aliasList = (record.fields.Aliases || "")
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a !== "");

      if (type && name) {
        if (!aliases[type]) {
          // Group by Type first
          aliases[type] = {};
        }
        aliases[type][name] = aliasList; // Then map Name to its Aliases
      }
    });

    return aliases;
  } catch (error) {
    console.error(
      "[getAllAliases] ERROR fetching aliases:",
      error.message,
      error.stack,
    );
    return {};
  }
}

// --- Admin CRUD functions ---

const mapAdminAliasRecord = (record) => ({
  id: record.id,
  Type: record.get("Type") || "",
  Name: record.get("Name") || "",
  // Aliases are stored as a comma-separated string in Airtable
  Aliases: record.get("Aliases") || "",
});

export async function getAllAliasesForAdmin() {
  try {
    const records = await aliasesTable
      .select({
        sort: [
          { field: "Type", direction: "asc" },
          { field: "Name", direction: "asc" },
        ],
      })
      .all();

    return records.map(mapAdminAliasRecord);
  } catch (error) {
    console.error(
      "[getAllAliasesForAdmin] ERROR fetching all aliases for admin:",
      error.message,
      error.stack,
    );
    throw error;
  }
}

export async function getAliasById(recordId) {
  try {
    const record = await aliasesTable.find(recordId);
    return mapAdminAliasRecord(record);
  } catch (error) {
    if (error.statusCode === 404) {
      console.warn(`[getAliasById] Alias with ID "${recordId}" not found.`);
      return null;
    }
    console.error(
      `[getAliasById] ERROR fetching alias by ID "${recordId}":`,
      error.message,
      error.stack,
    );
    throw error;
  }
}

export async function createAlias(aliasData) {
  try {
    const createdRecords = await aliasesTable.create([{ fields: aliasData }]);
    return mapAdminAliasRecord(createdRecords[0]);
  } catch (error) {
    console.error(
      "[createAlias] ERROR creating alias:",
      error.message,
      error.stack,
    );
    throw error;
  }
}

export async function updateAlias(recordId, aliasData) {
  try {
    const updatedRecords = await aliasesTable.update([
      { id: recordId, fields: aliasData },
    ]);
    return mapAdminAliasRecord(updatedRecords[0]);
  } catch (error) {
    console.error(
      `[updateAlias] ERROR updating alias ID "${recordId}":`,
      error.message,
      error.stack,
    );
    throw error;
  }
}

export async function deleteAlias(recordId) {
  try {
    const deletedRecords = await aliasesTable.destroy([recordId]);
    return deletedRecords[0];
  } catch (error) {
    console.error(
      `[deleteAlias] ERROR deleting alias ID "${recordId}":`,
      error.message,
      error.stack,
    );
    throw error;
  }
}
