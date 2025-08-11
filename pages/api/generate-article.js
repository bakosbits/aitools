import { generateArticleContent } from "@/lib/model/providers";
import { getToolBySlug } from "@/lib/airtable/tools";
import { ALLOWED_MODELS } from "@/lib/constants";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { topic, model: requestedModel, articleType } = req.body;

  if (!topic) {
    return res
      .status(400)
      .json({ message: "A topic is required to generate content." });
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

  try {
    const articleData = await generateArticleContent(topic, model, articleType);
    res.status(200).json(articleData);
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
