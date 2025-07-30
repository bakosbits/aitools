import { toolsTable, categoriesTable, articlesTable} from "@/lib/airtable/base";

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
                fields: ["Name", "Slug", "Logo","Domain", "Why"],
            })
            .all();

        if (featuredToolsRecords.length === 0) {
            return [];
        }

        const shuffledTools = shuffleArray(featuredToolsRecords);
        const selectedTools = shuffledTools.slice(0, count);

        const mappedTools = selectedTools.map((record) => ({
            Name: record.fields["Name"],
            Slug: record.fields["Slug"] || null,
            Logo: record.fields["Logo"] || null,
            Domain: record.fields["Domain"] || null,
            Why: record.fields["Why"] || null,
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

export async function getToolsByCategory(Slug) {

    try {
        const categoryResult = await categoriesTable
            .select({
                filterByFormula: `{Slug} = "${Slug}"`,
                fields: ["Name", "Tools"], // Fetches "Tools" (linked record IDs from Tools table)
                maxRecords: 1,
            })
            .all();

        const category = categoryResult[0];
        if (!category) {
            console.warn(`[getToolsByCategory] Category with Slug "${Slug}" not found. Returning empty array.`);
            return [];
        }

        const linkedToolIds = category.fields["Tools"] || [];

        if (linkedToolIds.length === 0) {
            return [];
        }

        const articleRecords = await articlesTable
            .select({ fields: ["Title", "Slug", "Related Tool"] }) // Fetch Title, Slug, and the 'Related Tool' field
            .all();

        const articleMap = {};
        articleRecords.forEach(article => {
            const linkedToolIdsInArticle = article.fields['Related Tool']; // This is the field in Articles table linking to Tools
            if (linkedToolIdsInArticle && linkedToolIdsInArticle.length > 0) {
                const toolId = linkedToolIdsInArticle[0]; // Assuming one article links to one tool
                articleMap[toolId] = {
                    title: article.fields.Title,
                    slug: article.fields.Slug,
                };
            }
        });

        // 2. Build a combined filter for Airtable (unchanged)
        const idFilterParts = linkedToolIds.map(id => `RECORD_ID() = '${id}'`);
        const idFilterString = idFilterParts.join(', ');
        const combinedFilterFormula = `AND({Active} = TRUE(), OR(${idFilterString}))`;

        // 3. Fetch tools using the combined filter
        const toolsRecords = await toolsTable
            .select({
                filterByFormula: combinedFilterFormula,
            })
            .all()

        // 4. Map and return tools, adding article info
        const mappedTools = toolsRecords.map((record) => {
            const linkedArticle = articleMap[record.id]; // Look up article by tool's record ID
            return {
                id: record.id,
                ...record.fields,
                articleSlug: linkedArticle ? linkedArticle.slug : null,
                articleTitle: linkedArticle ? linkedArticle.title : null,
            };
        });
        return mappedTools;

    } catch (error) {
        console.error(`[getToolsByCategory] ERROR fetching tools for category "${Slug}":`, error.message, error.stack);
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

// --- Admin CRUD functions ---

const mapAdminToolRecord = (record) => ({
    id: record.id,
    Name: record.get("Name") || "",
    Domain: record.get("Domain") || "",
    Website: record.get("Website") || "",    
    Description: record.get("Description") || "",
    Why: record.get("Why") || "",
    Details: record.get("Details") || "",
    Features: record.get("Features") || "",
    Cautions: record.get("Cautions") || "",
    Tags: record.get("Tags") || "",
    Buyer: record.get("Buyer") || "",
    Pricing: record.get("Pricing") || "",
    Base_Model: record.get("Base_Model") || "",
    Categories: record.get("Categories") || [], // Array of Category record IDs
    Active: record.get("Active") || false,
    Featured: record.get("Featured") || false,
    Articles: record.get("Articles") || [], // Array of Article record IDs
});

export async function getAllToolsForAdmin() {
    try {
        const records = await toolsTable
            .select({
                sort: [{ field: "Name", direction: "asc" }],
            })
            .all();
        return records.map(mapAdminToolRecord);
    } catch (error) {
        console.error("[getAllToolsForAdmin] ERROR fetching all tools for admin:", error);
        throw error;
    }
}

export async function getToolById(recordId) {
    try {
        const record = await toolsTable.find(recordId);
        return mapAdminToolRecord(record);
    } catch (error) {
        if (error.statusCode === 404) {
            console.warn(`[getToolById] Tool with ID "${recordId}" not found.`);
            return null;
        }
        console.error(`[getToolById] ERROR fetching tool by ID "${recordId}":`, error);
        throw error;
    }
}

export async function createTool(toolData) {
    try {
        const createdRecords = await toolsTable.create([
            { fields: toolData },
        ], { typecast: true });
        return mapAdminToolRecord(createdRecords[0]);
    } catch (error) {
        console.error("[createTool] ERROR creating tool:", error);
        throw error;
    }
}

export async function updateTool(recordId, toolData) {
    try {
        const updatedRecords = await toolsTable.update([
            { id: recordId, fields: toolData },
        ], { typecast: true });
        return mapAdminToolRecord(updatedRecords[0]);
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
