import { cautionTable } from "@/lib/airtable/base";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
    const { cautions } = req.body;
    if (!Array.isArray(cautions) || cautions.length === 0) {
        return res.status(400).json({ message: "No cautions provided." });
    }
    try {
        const recordsToCreate = cautions.map((c) => ({
            fields: {
                Caution: c.Caution,
                Tool: c.Tool,
            },
        }));
        const created = await cautionTable.create(recordsToCreate);
        res.status(201).json({ created: created.map((r) => ({ id: r.id, ...r.fields })) });
    } catch (error) {
        console.error("[cautions API] Error:", error);
        res.status(500).json({ message: "Failed to create cautions." });
    }
}
