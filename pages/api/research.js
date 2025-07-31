import { categoriesTable } from "@/lib/airtable/base";
import { generateToolResearch } from "@/lib/providers";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { toolName, model: requestedModel } = req.body;

  if (!toolName) {
    return res.status(400).json({ message: "toolName is required" });
  }

  let categoryNames;
  try {
    const categoryRecords = await categoriesTable
      .select({ fields: ["Name"] })
      .all();
    categoryNames = categoryRecords.map((record) => record.get("Name"));
    if (!categoryNames || categoryNames.length === 0) {
      console.error("No categories found in Airtable.");
      return res.status(500).json({
        message:
          "Could not find any tool categories in the database. Please add categories before researching.",
      });
    }
  } catch (error) {
    console.error("Error fetching categories from Airtable:", error);
    return res.status(500).json({
      message:
        "Failed to fetch tool categories from the database. Please check the Airtable connection.",
    });
  }

  try {
    const toolData = await generateToolResearch(
      toolName,
      requestedModel,
      categoryNames,
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
