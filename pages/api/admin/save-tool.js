import { createTool } from "@/lib/airtable/tools";
import { createMany as createFeatures } from "@/lib/airtable/features";
import { createMany as createCautions } from "@/lib/airtable/cautions";
import { createMany as createUseCases } from "@/lib/airtable/use-cases";
import { getAllCategories } from "@/lib/airtable/categories";
import { getAllUseCaseTags } from "@/lib/airtable/use-case-tags";
import { getAllCautionTags } from "@/lib/airtable/caution-tags";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { toolData } = req.body;
    if (!toolData || !toolData.Name) {
        return res.status(400).json({ message: "toolData with Name is required" });
    }

    try {
        // Fetch all categories, use case tags, and caution tags for mapping
        const [categories, useCaseTags, cautionTags] = await Promise.all([
            getAllCategories(),
            getAllUseCaseTags(),
            getAllCautionTags(),
        ]);

        // Map Categories to IDs
        const categoryIds = (toolData.Categories || []).map(cat => {
            if (typeof cat === "object" && cat !== null && cat.id) return cat.id;
            if (typeof cat === "string") {
                const found = categories.find(c => c.id === cat || c.Name === cat || c.Slug === cat);
                return found ? found.id : null;
            }
            return null;
        }).filter(Boolean);

        // Map UseCaseTags to IDs
        const useCaseTagIds = (toolData.UseCaseTags || []).map(tag => {
            if (typeof tag === "object" && tag !== null && tag.id) return tag.id;
            if (typeof tag === "string") {
                const found = useCaseTags.find(t => t.id === tag || t.Name === tag);
                return found ? found.id : null;
            }
            return null;
        }).filter(Boolean);

        // Map CautionTags to IDs
        const cautionTagIds = (toolData.CautionTags || []).map(tag => {
            if (typeof tag === "object" && tag !== null && tag.id) return tag.id;
            if (typeof tag === "string") {
                const found = cautionTags.find(t => t.id === tag || t.Name === tag);
                return found ? found.id : null;
            }
            return null;
        }).filter(Boolean);

        // Remove Features, Cautions, and UseCases from toolFields before saving
        const { Features, Cautions, UseCases, ...rest } = toolData;
        const toolFields = {
            ...rest,
            Categories: categoryIds,
            UseCaseTags: useCaseTagIds,
            CautionTags: cautionTagIds,
        };

        // Save the tool
        const createdTool = await createTool(toolFields);

        // Optionally save related data if present
        if (Array.isArray(Features) && Features.length > 0) {
            await createFeatures(Features.map(f => ({ Feature: f, Tool: createdTool.Slug })));
        }
        if (Array.isArray(Cautions) && Cautions.length > 0) {
            await createCautions(Cautions.map(c => ({ Caution: c, Tool: createdTool.Slug })));
        }
        if (Array.isArray(UseCases) && UseCases.length > 0) {
            await createUseCases(UseCases.map(uc => ({ UseCase: uc, Tool: createdTool.Slug })));
        }
        res.status(200).json({ tool: createdTool });
    } catch (error) {
        console.error("Error saving tool:", error);
        res.status(500).json({ message: error.message || "Failed to save tool" });
    }
    }
