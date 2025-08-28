import { useState } from "react";
import Link from "next/link";
import { getToolById } from "@/lib/airtable/tools";
import { getAllCategories } from "@/lib/airtable/categories";
import { PRICING_OPTIONS } from "@/lib/constants";
import ToolForm from "@/components/ToolForm";
import AiResearchAssistant from "@/components/AiResearchAssistant";

export async function getServerSideProps({ req, res, params }) {
    const { id } = params;
    const pricingOptions = PRICING_OPTIONS;

    const tool = await getToolById(id);
    const categories = await getAllCategories();
    // Normalize Categories to always be an array of IDs
    const toolWithCategoryIds = {
        ...tool,
        Categories: Array.isArray(tool.Categories)
            ? tool.Categories.map((cat) =>
                  typeof cat === "object" && cat !== null ? cat.id : cat,
              )
            : [],
    };

    return {
        props: {
            tool: toolWithCategoryIds,
            categories,
            pricingOptions,
        },
    };
}

export default function EditToolPage({
    tool,
    categories,
    pricingOptions,
    error,
}) {
    const [formData, setFormData] = useState(tool);
    const [submitError, setSubmitError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Expose formData and categories globally for debugging
    if (typeof window !== "undefined") {
        window.formData = formData;
        window.categories = categories;
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === "checkbox") {
            if (name === "Categories" || name === "Pricing") {
                const currentValues = formData[name] || [];
                if (checked) {
                    setFormData((prev) => ({
                        ...prev,
                        [name]: [...currentValues, value],
                    }));
                } else {
                    setFormData((prev) => ({
                        ...prev,
                        [name]: currentValues.filter((item) => item !== value),
                    }));
                }
            } else {
                setFormData((prev) => ({ ...prev, [name]: checked }));
            }
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            // Remove 'id' from toolData before sending
            const { id, ...toolDataWithoutId } = formData;
            const response = await fetch("/api/admin/save-tool", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    toolId: tool.id,
                    toolName: formData.Name,
                    toolData: toolDataWithoutId,
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || "Failed to update tool.");
            }
            // Redirect to admin tools page after successful update
            window.location.href = "/admin/tools";
        } catch (error) {
            setSubmitError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full md:w-[75%] mx-auto">
            <div>
                <Link
                    href="/admin/tools"
                    className="text-gray-300 hover:text-gray-100 mb-6 inline-block"
                >
                    &larr; Back to Tools
                </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-300 mb-6">
                Edit: {tool.Name}
            </h1>
            <AiResearchAssistant
                onResearchComplete={(researchedData) => {
                    let categoryIds = [];
                    if (Array.isArray(researchedData.Categories)) {
                        categoryIds = researchedData.Categories.map((cat) => {
                            if (
                                typeof cat === "object" &&
                                cat !== null &&
                                cat.id
                            )
                                return cat.id;
                            if (typeof cat === "string") return cat;
                            return null;
                        }).filter(Boolean);
                    }
                    setFormData((prevData) => ({
                        ...prevData,
                        ...researchedData,
                        Categories: categoryIds,
                    }));
                }}
                initialResearchTerm={tool.Name}
            />
            <ToolForm
                tool={formData}
                categories={categories}
                pricingOptions={pricingOptions}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                error={submitError || error}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}
