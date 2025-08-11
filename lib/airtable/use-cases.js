import { useCasesTable } from "./base";

const mapUseCaseRecord = (record) => ({
  id: record.id,
  Name: record.get("Name") || "",
  TagNames: record.get("Tag Lookup") || "",
});

export async function getAllUseCases() {
  try {
    const records = await useCasesTable
      .select({
        sort: [{ field: "Name", direction: "asc" }],
      })
      .all();

    return records.map(mapUseCaseRecord);
  } catch (error) {
    console.error(
      "[getAllUseCases] ERROR fetching all use cases:",
      error.message,
      error.stack,
    );
    throw error;
  }
}

export async function getUseCaseById(recordId) {
  try {
    const record = await useCasesTable.find(recordId);
    return mapUseCaseRecord(record);
  } catch (error) {
    if (error.statusCode === 404) {
      console.warn(
        `[getUseCaseById] Use case with ID "${recordId}" not found.`,
      );
      return null;
    }
    console.error(
      `[getUseCaseById] ERROR fetching use case by ID "${recordId}":`,
      error.message,
      error.stack,
    );
    throw error;
  }
}

export async function createUseCase(useCaseData) {
  try {
    const createdRecords = await useCasesTable.create([
      { fields: useCaseData },
    ]);
    return mapUseCaseRecord(createdRecords[0]);
  } catch (error) {
    console.error(
      "[createUseCase] ERROR creating use case:",
      error.message,
      error.stack,
    );
    throw error;
  }
}

export async function updateUseCase(recordId, useCaseData) {
  try {
    const updatedRecords = await useCasesTable.update(
      [{ id: recordId, fields: useCaseData }],
      { typecast: true },
    );
    return mapUseCaseRecord(updatedRecords[0]);
  } catch (error) {
    console.error(
      `[updateUseCase] ERROR updating use case ID "${recordId}":`,
      error,
    );
    throw error;
  }
}

export async function deleteUseCase(recordId) {
  try {
    const deletedRecords = await useCasesTable.destroy([recordId]);
    return deletedRecords[0];
  } catch (error) {
    console.error(
      `[deleteUseCase] ERROR deleting use case ID "${recordId}":`,
      error.message,
      error.stack,
    );
    throw error;
  }
}

export const updateUseCaseTags = async (id, tagIds) => {
  try {
    const updatedRecord = await useCasesTable.update([
      {
        id: id,
        fields: {
          Tags: tagIds,
        },
      },
    ]);
    return updatedRecord[0];
  } catch (error) {
    console.error(`Error updating use case ${id} with tags ${tagIds}:`, error);
    throw error;
  }
};
