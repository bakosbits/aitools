import {
    createTool,
    updateTool,
    getFeaturesByTool,
    deleteManyFeatures,
    getCautionsByTool,
    deleteManyCautions,
    createManyUseCases,
    getAllCategories,
    getAllUseCaseTags,
    getAllCautionTags,
} from "@/lib/airtable";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { toolId, toolData } = req.body;
    if (!toolData || !toolData.Name) {
        return res
            .status(400)
            .json({ message: "toolData with Name is required" });
    }

    try {
        // Fetch all categories, use case tags, and caution tags for mapping
        const [categories, useCaseTags, cautionTags] = await Promise.all([
            getAllCategories(),
            getAllUseCaseTags(),
            getAllCautionTags(),
        ]);

        // Map Categories to IDs
        const categoryIds = (toolData.Categories || [])
            .map((cat) => {
                if (typeof cat === "object" && cat !== null && cat.id)
                    return cat.id;
                if (typeof cat === "string") {
                    const found = categories.find(
                        (c) => c.id === cat || c.Name === cat,
                    );
                    return found ? found.id : null;
                }
                return null;
            })
            .filter(Boolean);

        // Map UseCaseTags to IDs
        const useCaseTagIds = (toolData.UseCaseTags || [])
            .map((tag) => {
                if (typeof tag === "object" && tag !== null && tag.id)
                    return tag.id;
                if (typeof tag === "string") {
                    const found = useCaseTags.find(
                        (t) => t.id === tag || t.Name === tag,
                    );
                    return found ? found.id : null;
                }
                return null;
            })
            .filter(Boolean);

        // Map CautionTags to IDs
        const cautionTagIds = (toolData.CautionTags || [])
            .map((tag) => {
                if (typeof tag === "object" && tag !== null && tag.id)
                    return tag.id;
                if (typeof tag === "string") {
                    const found = cautionTags.find(
                        (t) => t.id === tag || t.Name === tag,
                    );
                    return found ? found.id : null;
                }
                return null;
            })
            .filter(Boolean);

        // Remove Slug, Features, Cautions, and UseCases from toolFields before saving
        const { id, Slug, Features, Cautions, UseCases, ...rest } = toolData;
        const toolFields = {
            ...rest,
            Categories: categoryIds,
            UseCaseTags: useCaseTagIds,
            CautionTags: cautionTagIds,
        };

        // Save or update the tool
        let savedTool;
        if (toolId) {
            savedTool = await updateTool(toolId, toolFields);
        } else {
            savedTool = await createTool(toolFields);
        }

        // Optionally save related data if present
        if (Array.isArray(Features)) {
            // On update, delete all existing features for this tool before adding new
            if (toolId) {
                const existingFeatures = await getFeaturesByTool(
                    savedTool.Slug,
                );
                if (existingFeatures.length > 0) {
                    await deleteManyFeatures(
                        existingFeatures.map((f) => f.id).filter(Boolean),
                    );
                }
            }
            if (Features.length > 0) {
                await createManyFeatures(
                    Features.map((f) => ({ Feature: f, Tool: savedTool.Slug })),
                );
            }
        }
        if (Array.isArray(Cautions)) {
            // On update, delete all existing cautions for this tool before adding new
            if (toolId) {
                const existingCautions = await getCautionsByTool(
                    savedTool.Slug,
                );
                if (existingCautions.length > 0) {
                    await deleteManyCautions(
                        existingCautions.map((c) => c.id).filter(Boolean),
                    );
                }
            }
            if (Cautions.length > 0) {
                await createManyCautions(
                    Cautions.map((c) => ({ Caution: c, Tool: savedTool.Slug })),
                );
            }
        }
        if (Array.isArray(UseCases) && UseCases.length > 0) {
            await createManyUseCases(
                UseCases.map((uc) => ({ UseCase: uc, Tool: savedTool.Slug })),
            );
        }
        res.status(200).json({ tool: savedTool });
    } catch (error) {
        console.error("Error saving tool:", error);
        res.status(500).json({
            message: error.message || "Failed to save tool",
        });
    }
}
