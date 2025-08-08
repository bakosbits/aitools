import { categoriesTable, tagsTable } from "@/lib/airtable/base";
import { generateToolResearch } from "@/lib/model/providers";
import { ALLOWED_MODELS } from "@/lib/constants";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { toolName, model: requestedModel } = req.body;

  if (!toolName) {
    return res.status(400).json({ message: "toolName is required" });
  }

  // Validate the requested model against the allowed list.
  let model = requestedModel;
  if (model) {
    if (!ALLOWED_MODELS.includes(model)) {
      return res.status(400).json({
        message: `Invalid model specified. Allowed models are: ${ALLOWED_MODELS.join(
          ", ",
        )}`,
      });
    }
  }

  let categories = [];
  let tags = [];

  try {
    // Fetch both categories and tags in parallel
    const [categoryRecords, tagRecords] = await Promise.all([
      categoriesTable.select({ fields: ["Name"] }).all(),
      tagsTable.select({ fields: ["Name"] }).all()
    ]);

    categories = categoryRecords.map((record) => ({ id: record.id, Name: record.get("Name") }));
    tags = tagRecords.map((record) => ({ id: record.id, Name: record.get("Name") }));

    if (!categories || categories.length === 0) {
      console.error("No categories found in Airtable.");
      return res.status(500).json({
        message:
          "Could not find any tool categories in the database. Please add categories before researching.",
      });
    }

    if (!tags || tags.length === 0) {
      console.error("No tags found in Airtable.");
      return res.status(500).json({
        message:
          "Could not find any tool tags in the database. Please add tags before researching.",
      });
    }
  } catch (error) {
    console.error("Error fetching data from Airtable:", error);
    return res.status(500).json({
      message:
        "Failed to fetch required data from the database. Please check the Airtable connection.",
    });
  }

  try {
    const toolData = await generateToolResearch(
      toolName,
      model,
      categories, // Pass full category objects
      tags        // Pass full tag objects
    );
    res.status(200).json(toolData);
  } catch (error) {
    console.error(
      "Full error from AI provider:",
      JSON.stringify(error, null, 2),
    );
    const errorMessage = error.message || "An unknown error occurred";
    if (errorMessage.includes("API key not valid")) {
      return res.status(401).json({
        message:
          "API key is not valid or missing. Please check your environment variables.",
      });
    }
    return res.status(500).json({
      message: `Failed to get data from AI provider: ${errorMessage}`,
    });
  }
}
