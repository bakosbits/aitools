import { useState } from "react";
import Link from "next/link";
import { getAllCategories } from "@/lib/airtable/categories";
import { PRICING_OPTIONS } from "@/lib/constants";
import ToolForm from "@/components/ToolForm";
import AiResearchAssistant from "@/components/AiResearchAssistant";

export async function getServerSideProps({ req, res }) {
    const pricingOptions = PRICING_OPTIONS;

    const categories = await getAllCategories();

    return {
        props: {
            categories,
            pricingOptions,
        },
    };
}

export default function NewToolPage({ categories, pricingOptions, error }) {
    const [formData, setFormData] = useState({});
    const [submitError, setSubmitError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleResearchComplete = (researchedData) => {
        let categoryIds = [];
        if (Array.isArray(researchedData.Categories)) {
            categoryIds = researchedData.Categories.map((cat) => {
                if (typeof cat === "object" && cat !== null && cat.id)
                    return cat.id;
                if (typeof cat === "string") {
                    // Try to match by ID, Name, or Slug
                    const match = categories.find(
                        (c) => c.id === cat || c.Name === cat || c.Slug === cat,
                    );
                    return match ? match.id : null;
                }
                return null;
            }).filter(Boolean);
        }
        setFormData((prevData) => ({
            ...prevData,
            ...researchedData,
            Categories: categoryIds,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const response = await fetch("/api/admin/save-tool", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    toolName: formData.Name,
                    toolData: formData,
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || "Failed to create tool.");
            }

            // Redirect to admin tools page after successful creation
            window.location.href = "/admin/tools";
        } catch (error) {
            setSubmitError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Normalize Categories to always be an array of IDs
    const normalizedFormData = {
        ...formData,
        Categories: Array.isArray(formData.Categories)
            ? formData.Categories.map((cat) =>
                  typeof cat === "object" && cat !== null ? cat.id : cat,
              )
            : [],
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
                Add New Tool
            </h1>
            <AiResearchAssistant onResearchComplete={handleResearchComplete} />
            <ToolForm
                tool={normalizedFormData}
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
