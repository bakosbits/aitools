import { getUseCasesByTool } from "@/lib/airtable";

export default async function handler(req, res) {
    if (req.method === "GET") {
        const { slug } = req.query;

        if (!slug) {
            return res.status(400).json({ message: "Slug is required" });
        }

        try {
            const useCases = await getUseCasesByTool(slug);
            return res.status(200).json(useCases);
        } catch (error) {
            console.error("Error fetching use cases for tool:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    } else {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
