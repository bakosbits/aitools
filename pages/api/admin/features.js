import { featuresTable } from "@/lib/airtable/base";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
    const { features } = req.body;
    if (!Array.isArray(features) || features.length === 0) {
        return res.status(400).json({ message: "No features provided." });
    }
    try {
        const recordsToCreate = features.map((f) => ({
            fields: {
                Name: f.Name,
                Tool: f.Tool,
            },
        }));
        const created = await featuresTable.create(recordsToCreate);
        res.status(201).json({ created: created.map((r) => ({ id: r.id, ...r.fields })) });
    } catch (error) {
        console.error("[features API] Error:", error);
        res.status(500).json({ message: "Failed to create features." });
    }
}
