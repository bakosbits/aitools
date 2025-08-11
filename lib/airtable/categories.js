import { categoriesTable, toolsTable } from "@/lib/airtable/base";

function mapCategoryRecord(record) {
  if (!record) return null;

  return {
    id: record.id,
    Name: record.fields["Name"],
    Slug: record.fields["Slug"] ?? null,
    Description: record.fields["Description"] ?? null,
    Count: record.fields["Count"] ?? 0,
    TagNames: record.fields["TagNames"] ?? [],
    Tags: record.fields["Tags"] ?? [],
  };
}

export async function getAllCategories_old() {
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
        fields: ["Name", "Slug", "Description", "Count", "TagNames"],
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
      TagNames: record.fields["TagNames"] ?? [],
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

export async function getAllCategorySlugs() {
  try {
    const records = await categoriesTable
      .select({
        fields: ["Slug", "Name"],
      })
      .all();

    const mappedCategories = records.map((record) => ({
      id: record.id,
      Name: record.fields["Name"],
      Slug: record.fields["Slug"] ?? null,
    }));

    return mappedCategories;
  } catch (error) {
    console.error(
      "[getAllCategorySlugs] ERROR fetching all category slugs:",
      error.message,
      error.stack,
    );
    throw error;
  }
}

export async function getAllCategories() {
  if (!process.env.AIRTABLE_CATEGORIES_TABLE) {
    console.error(
      "CRITICAL ERROR: Missing AIRTABLE_CATEGORIES_TABLE environment variable in getAllCategoriesAdmin.",
    );
    throw new Error("Missing AIRTABLE_CATEGORIES_TABLE environment variable");
  }

  try {
    const categoryRecords = await categoriesTable
      .select({
        filterByFormula: "{Active} = TRUE()",
        fields: ["Name", "Slug", "Description", "Count", "TagNames", "Tags"],
      })
      .all();

    const mappedCategories = categoryRecords.map((record) => ({
      id: record.id,
      Name: record.fields["Name"],
      Slug: record.fields["Slug"] ?? null,
      Description: record.fields["Description"] ?? null,
      Count: record.fields["Count"] ?? 0, // Assuming 'Tags' is the field name for linked tags
    }));

    return mappedCategories;
  } catch (error) {
    console.error(
      "[getAllCategories] ERROR fetching all categories for admin:",
      error.message,
      error.stack,
    );
    throw error;
  }
}

export async function getCategoryById(recordId) {
  try {
    const record = await categoriesTable.find(recordId);
    return mapCategoryRecord(record);
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
    return mapCategoryRecord(createdRecords[0]);
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
    return mapCategoryRecord(updatedRecords[0]);
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

export async function updateCategoryTags(recordId, tagIds) {
  try {
    const updatedRecords = await categoriesTable.update([
      { id: recordId, fields: { Tags: tagIds } },
    ]);
    return mapCategoryRecord(updatedRecords[0]);
  } catch (error) {
    console.error(
      `[updateCategoryTags] ERROR updating category ID "${recordId}" tags:`,
      error.message,
      error.stack,
    );
    throw error;
  }
}
