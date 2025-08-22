import { categoriesTable, toolsTable } from "@/lib/airtable/base";

function mapCategoryRecord(record) {
    if (!record) return null;

    return {
        id: record.id,
        Name: record.fields["Name"],
        Slug: record.fields["Slug"] ?? null,
        Description: record.fields["Description"] ?? null,
        Count: record.fields["Count"] ?? 0,
        Tools: record.fields["Tools"] ?? [],
        ToolLookup: record.fields["Tool Lookup"] ?? [],
    };
}

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

    return records.map(mapCategoryRecord);
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
    if (!process.env.AIRTABLE_CATEGORIES_TABLE) {
        console.error(
            "CRITICAL ERROR: Missing AIRTABLE_CATEGORIES_TABLE environment variable in getAllCategoriesAdmin.",
        );
        throw new Error(
            "Missing AIRTABLE_CATEGORIES_TABLE environment variable",
        );
    }

    try {
        const categoryRecords = await categoriesTable
            .select({
                filterByFormula: "{Active} = TRUE()",
                fields: ["Name", "Slug", "Description", "Count", "Tools", "Tool Lookup"],
            })
            .all();

        const mappedCategories = categoryRecords.map((record) => ({
            id: record.id,
            Name: record.fields["Name"],
            Slug: record.fields["Slug"] ?? null,
            Description: record.fields["Description"] ?? null,
            Count: record.fields["Count"] ?? 0,
            Tools: record.fields["Tools"] ?? [],
            ToolLookup: record.fields["Tool Lookup"] ?? [],
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


