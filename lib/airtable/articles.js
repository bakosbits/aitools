import { articlesTable } from "@/lib/airtable/base";

// Helper to map Airtable record to a clean Article object for public-facing pages
const mapArticleRecord = (record) => ({
  id: record.id,
  Title: record.get("Title") || "",
  Summary: record.get("Summary") || "",
  Content: record.get("Content") || "",
  Slug: record.get("Slug") || null,
  Published: record.get("Published") || false,

});


export async function getAllArticles() {
  try {
    const records = await articlesTable
      .select({
        
        sort: [{ field: "Date", direction: "desc" }],
      })
      .all();

    return records.map(mapArticleRecord);
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

    return mapArticleRecord(record);
  } catch (error) {
    console.error(
      `[getArticleBySlug] ERROR fetching article by Slug "${Slug}":`,
      error.message,
      error.stack,
    );
    throw error;
  }
}

// --- Admin CRUD functions ---


/**
 * Fetches a single article by its Airtable record ID.
 * @param {string} recordId The Airtable record ID.
 */
export async function getArticleById(recordId) {
  try {
    const record = await articlesTable.find(recordId);
    return mapArticleRecord(record);
  } catch (error) {
    if (error.statusCode === 404) {
      console.warn(`[getArticleById] Article with ID "${recordId}" not found.`);
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

/**
 * Creates a new article in Airtable.
 * @param {object} articleData The data for the new article.
 */
export async function createArticle(articleData) {
  try {
    const createdRecords = await articlesTable.create([
      { fields: articleData },
    ]);
    return mapArticleRecord(createdRecords[0]);
  } catch (error) {
    console.error(
      "[createArticle] ERROR creating article:",
      error.message,
      error.stack,
    );
    throw error;
  }
}

/**
 * Updates an existing article in Airtable.
 * @param {string} recordId The Airtable record ID of the article to update.
 * @param {object} articleData The data to update.
 */
export async function updateArticle(recordId, articleData) {
  try {
    const updatedRecords = await articlesTable.update([
      { id: recordId, fields: articleData },
    ]);
    return mapArticleRecord(updatedRecords[0]);
  } catch (error) {
    console.error(
      `[updateArticle] ERROR updating article ID "${recordId}":`,
      error.message,
      error.stack,
    );
    throw error;
  }
}

/**
 * Deletes an article from Airtable.
 * @param {string} recordId The Airtable record ID of the article to delete.
 */
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
