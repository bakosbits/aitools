import { toolsTable, categoriesTable, articlesTable } from "@/lib/airtable/base";

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export async function getFeaturedTools(count = 4) {
    try {
        const featuredToolsRecords = await toolsTable
            .select({
                filterByFormula: `AND({Active} = TRUE(), {Featured} = TRUE())`,
                fields: ["Slug", "Name", "Logo"],
            })
            .all();

        if (featuredToolsRecords.length === 0) {
            return [];
        }

        const shuffledTools = shuffleArray(featuredToolsRecords);
        const selectedTools = shuffledTools.slice(0, count);

        const mappedTools = selectedTools.map((record) => ({
            Slug: record.fields["Slug"],
            Name: record.fields["Name"],
            Logo: record.fields["Logo"] || null,
        }));

        return mappedTools;
    } catch (error) {
        console.error(
            "[getFeaturedTools] ERROR fetching featured tools:",
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function getAllTools() {
    try {
        const categoryRecords = await categoriesTable
            .select({ fields: ["Name", "Slug"] })
            .all();

        const articleRecords = await articlesTable
            .select({ fields: ["Title", "Slug", "Related Tool"] }) // Fetch Title, Slug, and the new 'Related Tool' field
            .all();

        const articleMap = {};
        articleRecords.forEach((article) => {
            // If an article is linked to a tool, store its slug/title by the tool's record ID
            const linkedToolIds = article.fields["Related Tool"]; // This is the field in Articles table linking to Tools
            if (linkedToolIds && linkedToolIds.length > 0) {
                // Assuming one article links to one tool for simplicity of this map
                const toolId = linkedToolIds[0];
                articleMap[toolId] = {
                    slug: article.fields.Slug,
                };
            }
        });

        const categoryMap = {};
        categoryRecords.forEach((cat) => {
            categoryMap[cat.id] = {
                id: cat.id,
                Name: cat.fields["Name"],
                Slug: cat.fields["Slug"],
            };
        });

        const toolRecords = await toolsTable
            .select({ filterByFormula: "{Active} = TRUE()" })
            .all();

        const mappedTools = toolRecords.map((record) => {
            const categoryIds = record.fields["Categories"] || [];
            const expandedCategories = categoryIds
                .map((id) => categoryMap[id])
                .filter(Boolean);

            const linkedArticle = articleMap[record.id];

            return {
                id: record.id,
                ...record.fields,
                Categories: expandedCategories,
                articleSlug: linkedArticle ? linkedArticle.slug : null,
            };
        });

        return mappedTools;
    } catch (error) {
        console.error(
            "[getAllTools] ERROR fetching all tools, categories:",
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function getAllToolSlugs() {
    try {
        const records = await toolsTable
            .select({
                filterByFormula: "{Active} = TRUE()",
                fields: ["Slug"],
            })
            .all();

        return records.map((record) => record.fields);
    } catch (error) {
        console.error(
            "[getAllToolSlugs] ERROR fetching all tool slugs:",
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function getToolsByCategory(categorySlug) {
    try {
        // Get the category record to access the Tool Lookup column
        const categoryRecords = await categoriesTable
            .select({
                filterByFormula: `{Slug} = "${categorySlug}"`,
                fields: ["Tool Lookup", "Name"] // Include Tool Lookup column
            })
            .firstPage();

        if (categoryRecords.length === 0) {
            console.warn(
                `[getToolsByCategory] No category found with slug "${categorySlug}"`,
            );
            return [];
        }

        const category = categoryRecords[0];
        const toolNames = category.fields["Tool Lookup"] || [];

        if (toolNames.length === 0) {
            console.log(
                `[getToolsByCategory] No tools found for category "${category.fields.Name}"`,
            );
            return [];
        }

        // Get all active tools that match the names in Tool Lookup
        const toolRecords = await toolsTable
            .select({
                filterByFormula: `AND(
          {Active} = TRUE(),
          OR(${toolNames.map(name => `{Name} = '${name.replace(/'/g, "\\'")}'`).join(',')})
        )`,
                fields: [
                    "Name",
                    "Slug",
                    "Logo",
                    "Domain",
                    "Description",
                    "Why",
                    "Details",
                    "Features",
                    "Cautions",
                    "Base_Model",
                ],
            })
            .all();

        return toolRecords.map((record) => ({
            id: record.id,
            Name: record.fields["Name"],
            Slug: record.fields["Slug"] || null,
            Logo: record.fields["Logo"] || null,
            Domain: record.fields["Domain"] || null,
            Description: record.fields["Description"] || null,
            Why: record.fields["Why"] || null,
            Details: record.fields["Details"] || null,
            Features: record.fields["Features"] || null,
            Cautions: record.fields["Cautions"] || null,
            Base_Model: record.fields["Base_Model"] || null,
        }));
    } catch (error) {
        console.error(
            `[getToolsByCategory] ERROR fetching tools for category slug "${categorySlug}":`,
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function getNewestTools(count = 8) {
    try {
        const newestToolsRecords = await toolsTable
            .select({
                filterByFormula: `{Active} = TRUE()`,
                sort: [{ field: "Created", direction: "desc" }],
                fields: ["Name", "Slug", "Logo", "Domain", "Why"],
                maxRecords: count,
            })
            .all();

        if (newestToolsRecords.length === 0) {
            return [];
        }

        const mappedTools = newestToolsRecords.map((record) => ({
            Name: record.fields["Name"],
            Slug: record.fields["Slug"] || null,
            Logo: record.fields["Logo"] || null,
            Domain: record.fields["Domain"] || null,
            Why: record.fields["Why"] || null,
        }));

        return mappedTools;
    } catch (error) {
        console.error(
            "[getNewestTools] ERROR fetching newest tools:",
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function getToolBySlug(Slug) {
    try {
        const categoryRecords = await categoriesTable
            .select({ fields: ["Name", "Slug"] })
            .all();
        const categoryMap = {};
        categoryRecords.forEach((cat) => {
            categoryMap[cat.id] = {
                id: cat.id,
                Name: cat.fields["Name"],
                Slug: cat.fields["Slug"],
            };
        });

        const result = await toolsTable
            .select({
                filterByFormula: `{Slug} = "${Slug}"`,
                fields: [
                    "Name",
                    "Slug",
                    "Logo",
                    "Domain",
                    "Website",
                    "Description",
                    "Why",
                    "Details",
                    "Features",
                    "Cautions",
                    "Buyer",
                    "Pricing",
                    "Base_Model",
                    "Categories",
                ],
                maxRecords: 1,
            })
            .firstPage();

        if (!result || result.length === 0) {
            console.warn(
                `[getToolBySlug] Tool with Slug "${Slug}" not found. Returning null.`,
            );
            return null;
        }

        const toolRecord = result[0];
        const toolFields = toolRecord.fields;

        // Expand category IDs into full objects
        const categoryIds = toolFields["Categories"] || [];
        const expandedCategories = categoryIds
            .map((id) => categoryMap[id])
            .filter(Boolean);

        let articleSlug = null;
        let articleTitle = null;
        const linkedArticleIds = toolFields.Articles;

        if (linkedArticleIds && linkedArticleIds.length > 0) {
            // Assuming one article per tool
            const linkedArticleId = linkedArticleIds[0];

            const articleResult = await articlesTable
                .select({
                    filterByFormula: `RECORD_ID() = '${linkedArticleId}'`,
                    fields: ["Title", "Slug"],
                    maxRecords: 1,
                })
                .firstPage();

            if (articleResult && articleResult.length > 0) {
                articleSlug = articleResult[0].fields.Slug;
                articleTitle = articleResult[0].fields.Title;
            } else {
                console.warn(
                    `[getToolBySlug] Linked article with ID ${linkedArticleId} not found in Articles table.`,
                );
            }
        }
        return {
            id: toolRecord.id,
            ...toolFields,
            Categories: expandedCategories, // Overwrite with expanded categories
            articleSlug, // Add to returned object
        };
    } catch (error) {
        console.error(
            `[getToolBySlug] ERROR fetching tool by Slug "${Slug}":`,
            error.message,
            error.stack,
        );
        throw error;
    }
}

const mapToolRecord = (record) => ({
    id: record.id,
    Name: record.get("Name") || "",
    Domain: record.get("Domain") || "",
    Website: record.get("Website") || "",
    Description: record.get("Description") || "",
    Why: record.get("Why") || "",
    Details: record.get("Details") || "",
    Features: record.get("Features") || "",
    Cautions: record.get("Cautions") || "",
    TagNames: record.get("Tag Lookup") || "",
    Tags: record.get("Tags") || [], // Array of Tag record IDs
    Buyer: record.get("Buyer") || "",
    Pricing: record.get("Pricing") || "",
    Base_Model: record.get("Base_Model") || "",
    Categories: record.get("Categories") || [],
    CategoryNames: record.get("Category Lookup") || [], // Array of Category record IDs
    Active: record.get("Active") || false,
    Featured: record.get("Featured") || false,
    Articles: record.get("Articles") || [], // Array of Article record IDs
});

export async function getToolById(recordId) {
    try {
        const record = await toolsTable.find(recordId);
        return mapToolRecord(record);
    } catch (error) {
        if (error.statusCode === 404) {
            console.warn(`[getToolById] Tool with ID "${recordId}" not found.`);
            return null;
        }
        console.error(
            `[getToolById] ERROR fetching tool by ID "${recordId}":`,
            error,
        );
        throw error;
    }
}


export async function createTool(toolData) {
    try {
        const createdRecords = await toolsTable.create([{ fields: toolData }], {
            typecast: true,
        });
        return mapToolRecord(createdRecords[0]);
    } catch (error) {
        console.error("[createTool] ERROR creating tool:", error);
        throw error;
    }
}


export async function updateTool(recordId, toolData) {
    try {
        const updatedRecords = await toolsTable.update(
            [{ id: recordId, fields: toolData }],
            { typecast: true },
        );
        return mapToolRecord(updatedRecords[0]);
    } catch (error) {
        console.error(`[updateTool] ERROR updating tool ID "${recordId}":`, error);
        throw error;
    }
}

export async function deleteTool(recordId) {
    try {
        const deletedRecords = await toolsTable.destroy([recordId]);
        return deletedRecords[0];
    } catch (error) {
        console.error(`[deleteTool] ERROR deleting tool ID "${recordId}":`, error);
        throw error;
    }
}

export async function updateToolCategories(toolId, categoryIds) {
    try {
        const updatedRecord = await toolsTable.update([
            {
                id: toolId,
                fields: {
                    Categories: categoryIds,
                },
            },
        ]);
        return mapToolRecord(updatedRecord[0]);
    } catch (error) {
        console.error(`Error updating tool ${toolId} with categories:`, error);
        throw error;
    }
}

export async function updateToolTags(toolId, tagIds) {
    try {
        const updatedRecord = await toolsTable.update([
            {
                id: toolId,
                fields: {
                    Tags: tagIds,
                },
            },
        ]);
        return mapToolRecord(updatedRecord[0]);
    } catch (error) {
        console.error(`Error updating tool ${toolId} with categories:`, error);
        throw error;
    }
}

export async function getTagTools(count = 25) {
    try {
        const toolRecords = await toolsTable
            .select({
                filterByFormula: `{Active} = TRUE()`,
                sort: [{ field: "Created", direction: "desc" }],
                fields: ["Name", "Why", "Description", "Details", "CategoryNames"],
                maxRecords: count,
            })
            .all();

        if (toolRecords.length === 0) {
            return [];
        }

        const mappedTools = toolRecords.map((record) => ({
            Name: record.fields["Name"],
            Description: record.fields["Description"] || null,
            Why: record.fields["Why"] || null,
            Details: record.fields["Details"] || null,
            CategoryNames: record.fields["CategoryNames"] || [],
        }));

        return mappedTools;
    } catch (error) {
        console.error(
            "[getNewestTools] ERROR fetching newest tools:",
            error.message,
            error.stack,
        );
        throw error;
    }
}

