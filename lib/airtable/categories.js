import { categoriesTable, toolsTable } from "./config";
import { mapRecord } from "./recordMappings";

// Categories
export async function getCategoriesByTool(slug) {
    const tools = await toolsTable
        .select({
            filterByFormula: `{Slug} = "${slug}"`,
            fields: ["Categories"],
        })
        .all();

    if (!tools.length || !tools[0].fields.Categories) {
        return [];
    }

    const tool = tools[0];
    const categoryIds = tool.fields.Categories;

    const records = await categoriesTable
        .select({
            filterByFormula: `OR(${categoryIds
                .map((id) => `RECORD_ID() = '${id}'`)
                .join(",")})`,
        })
        .all();

    return records.map((record) => mapRecord(record, "category"));
}

export async function getCategorySlugs() {
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
            "[getCategorySlugs] ERROR fetching all category slugs:",
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function getAllCategories() {
    try {
        const categoryRecords = await categoriesTable
            .select({
                filterByFormula: "{Active} = TRUE()",
                fields: [
                    "Name",
                    "Slug",
                    "Description",
                    "Count",
                    "Tools",
                    "Tool Lookup",
                ],
            })
            .all();

        const mappedCategories = categoryRecords.map((record) =>
            mapRecord(record, "category"),
        );

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
        return mapRecord(record, "category");
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
        return mapRecord(createdRecords[0], "category");
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
        return mapRecord(updatedRecords[0], "category");
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
