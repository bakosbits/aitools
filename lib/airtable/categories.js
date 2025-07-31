import { categoriesTable, toolsTable } from "@/lib/airtable/base";

export async function getAllCategories() {
  if (!process.env.AIRTABLE_CATEGORIES_TABLE) {
    console.error(
      "CRITICAL ERROR: Missing AIRTABLE_CATEGORIES_TABLE environment variable in getAllCategories.",
    );
    throw new Error("Missing AIRTABLE_CATEGORIES_TABLE environment variable");
  }

  try {
    const activeTools = await toolsTable
      .select({
        filterByFormula: "{Active} = TRUE()",
        fields: ["Categories"],
      })
      .all();

    const usedCategoryIds = new Set();
    for (const tool of activeTools) {
      const categories = tool.fields["Categories"] || [];
      categories.forEach((catId) => usedCategoryIds.add(catId));
    }

    const categoryRecords = await categoriesTable
      .select({
        fields: ["Name", "Slug", "Description", "Count"],
      })
      .all();

    const filteredCategories = categoryRecords.filter((record) =>
      usedCategoryIds.has(record.id),
    );

    const mappedCategories = filteredCategories.map((record) => ({
      id: record.id,
      Name: record.fields["Name"],
      Slug: record.fields["Slug"] ?? null,
      Description: record.fields["Description"] ?? null,
      Count: record.fields["Count"] ?? 0,
    }));

    return mappedCategories;
  } catch (error) {
    console.error(
      "[getAllCategories] ERROR fetching categories:",
      error.message,
      error.stack,
    );
    throw error;
  }
}

// --- Admin CRUD functions ---

const mapAdminCategoryRecord = (record) => ({
  id: record.id,
  Name: record.get("Name") || "",
  Description: record.get("Description") || "",
  Count: record.get("Count") || 0,
});

export async function getAllCategoriesForAdmin() {
  try {
    const records = await categoriesTable
      .select({
        sort: [{ field: "Name", direction: "asc" }],
      })
      .all();

    return records.map(mapAdminCategoryRecord);
  } catch (error) {
    console.error(
      "[getAllCategoriesForAdmin] ERROR fetching all categories for admin:",
      error.message,
      error.stack,
    );
    throw error;
  }
}

export async function getCategoryById(recordId) {
  try {
    const record = await categoriesTable.find(recordId);
    return mapAdminCategoryRecord(record);
  } catch (error) {
    if (error.statusCode === 404) {
      console.warn(
        `[getCategoryById] Category with ID "${recordId}" not found.`,
      );
      return null;
    }
    console.error(
      `[getCategoryById] ERROR fetching category by ID "${recordId}":`,
      error.message,
      error.stack,
    );
    throw error;
  }
}

export async function createCategory(categoryData) {
  try {
    const createdRecords = await categoriesTable.create([
      { fields: categoryData },
    ]);
    return mapAdminCategoryRecord(createdRecords[0]);
  } catch (error) {
    console.error(
      "[createCategory] ERROR creating category:",
      error.message,
      error.stack,
    );
    throw error;
  }
}

export async function updateCategory(recordId, categoryData) {
  try {
    const updatedRecords = await categoriesTable.update([
      { id: recordId, fields: categoryData },
    ]);
    return mapAdminCategoryRecord(updatedRecords[0]);
  } catch (error) {
    console.error(
      `[updateCategory] ERROR updating category ID "${recordId}":`,
      error.message,
      error.stack,
    );
    throw error;
  }
}

export async function deleteCategory(recordId) {
  try {
    const deletedRecords = await categoriesTable.destroy([recordId]);
    return deletedRecords[0];
  } catch (error) {
    console.error(
      `[deleteCategory] ERROR deleting category ID "${recordId}":`,
      error.message,
      error.stack,
    );
    throw error;
  }
}
