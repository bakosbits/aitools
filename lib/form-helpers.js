/**
 * Parses the form body from a Node.js request.
 * @param {import('http').IncomingMessage} req The request object.
 * @returns {Promise<Record<string, any>>} The parsed form data.
 */
export async function parseFormBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      resolve(Object.fromEntries(new URLSearchParams(body)));
    });
  });
}

/**
 * Prepares article form data for submission to Airtable.
 * @param {Record<string, any>} formData The raw form data.
 * @returns {Record<string, any>} The processed data for Airtable.
 */
export function prepareArticleData(formData) {
  const articleData = {
    ...formData,
    Published: formData.Published === "on", // Correctly check if the checkbox was 'on'
  };
  return articleData;
}

/**
 * Parses the form body for a Tool from a Node.js request, handling multiple 'Categories' values.
 * @param {import('http').IncomingMessage} req The request object.
 * @returns {Promise<Record<string, any>>} The parsed form data.
 */
export async function parseToolForm(req) {
  const body = await new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
  });
  const params = new URLSearchParams(body);
  const toolData = Object.fromEntries(params.entries());
  toolData.Categories = params.getAll("Categories");
  return toolData;
}
