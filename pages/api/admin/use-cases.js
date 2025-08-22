import { createMany } from "@/lib/airtable/use-cases";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
    const { useCases } = req.body;
    if (!Array.isArray(useCases) || useCases.length === 0) {
        return res.status(400).json({ message: "No use cases provided." });
    }
    try {
        const created = await createMany(useCases);
        res.status(201).json({ created });
    } catch (error) {
        console.error("[use-cases API] Error:", error);
        res.status(500).json({ message: "Failed to create use cases." });
    }
}
