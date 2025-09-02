import { generateArticleContent } from "@/lib/models/providers";
import { ALLOWED_MODELS, ALLOWED_ARTICLE_TYPES } from "@/lib/constants";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const {
        topic,
        model: requestedModel,
        articleType: requestedArticleType,
    } = req.body;

    if (!topic) {
        return res
            .status(400)
            .json({ message: "A topic is required to generate content." });
    }

    // Validate the requested model against the allowed list.
    if (requestedModel) {
        if (!ALLOWED_MODELS.includes(requestedModel)) {
            return res.status(400).json({
                message: `Invalid model specified. Allowed models are: ${ALLOWED_MODELS.join(
                    ", ",
                )}`,
            });
        }
    }

    if (requestedArticleType) {
        if (!ALLOWED_ARTICLE_TYPES.includes(requestedArticleType)) {
            return res.status(400).json({
                message: `Invalid article type specified. Allowed article types are: ${ALLOWED_ARTICLE_TYPES.join(
                    ", ",
                )}`,
            });
        }
    }

    try {
        const articleData = await generateArticleContent(
            topic,
            requestedModel,
            requestedArticleType,
        );
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
