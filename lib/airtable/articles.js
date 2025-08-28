import { articlesTable } from "./config";
import { mapRecord } from "./recordMappings";

// Articles
export async function getAllArticles() {
    try {
        const records = await articlesTable
            .select({
                sort: [{ field: "Date", direction: "desc" }],
            })
            .all();

        return records.map((record) => mapRecord(record, "article"));
    } catch (error) {
        console.error(
            "[getAllArticles] ERROR fetching all articles:",
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function getArticleBySlug(Slug) {
    try {
        const records = await articlesTable
            .select({
                filterByFormula: `LOWER({Slug}) = '${Slug.toLowerCase()}'`,
                maxRecords: 1,
            })
            .firstPage();

        if (!records || records.length === 0) {
            console.warn(
                `[getArticleBySlug] Article with Slug "${Slug}" not found. Returning null.`,
            );
            return null;
        }

        const record = records[0];

        return mapRecord(record, "article");
    } catch (error) {
        console.error(
            `[getArticleBySlug] ERROR fetching article by Slug "${Slug}":`,
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function getArticleById(recordId) {
    try {
        const record = await articlesTable.find(recordId);
        return mapRecord(record, "article");
    } catch (error) {
        if (error.statusCode === 404) {
            console.warn(
                `[getArticleById] Article with ID "${recordId}" not found.`,
            );
            return null;
        }
        console.error(
            `[getArticleById] ERROR fetching article by ID "${recordId}":`,
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function createArticle(articleData) {
    try {
        const createdRecords = await articlesTable.create([
            { fields: articleData },
        ]);
        return mapRecord(createdRecords[0], "article");
    } catch (error) {
        console.error(
            "[createArticle] ERROR creating article:",
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function updateArticle(recordId, articleData) {
    try {
        const updatedRecords = await articlesTable.update([
            { id: recordId, fields: articleData },
        ]);
        return mapRecord(updatedRecords[0], "article");
    } catch (error) {
        console.error(
            `[updateArticle] ERROR updating article ID "${recordId}":`,
            error.message,
            error.stack,
        );
        throw error;
    }
}

export async function deleteArticle(recordId) {
    try {
        const deletedRecords = await articlesTable.destroy([recordId]);
        return deletedRecords[0];
    } catch (error) {
        console.error(
            `[deleteArticle] ERROR deleting article ID "${recordId}":`,
            error.message,
            error.stack,
        );
        throw error;
    }
}
