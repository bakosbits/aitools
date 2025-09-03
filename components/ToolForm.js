import Link from "next/link";
import { useState } from "react";
import EditUseCasesModal from '@/components/EditUseCasesModal';

export default function ToolForm({
    tool,
    categories = [],
    pricingOptions = [],
    handleChange,
    handleSubmit,
    error,
    isSubmitting = false,
}) {
    // Map tool.Categories (IDs) to a Set for fast lookup
    const categoryIdSet = new Set(
        Array.isArray(tool.Categories) ? tool.Categories.map(String) : [],
    );
    const isNew = !tool?.id;
    const [submitError, setSubmitError] = useState(null);
    const [isUseCasesModalOpen, setUseCasesModalOpen] = useState(false);

    const handleSaveUseCases = (updatedUseCases) => {
        handleChange({ target: { name: 'UseCases', value: updatedUseCases } });
    };

    const handleArrayChange = (e) => {
        const { name, value } = e.target;
        const newArray = value
            .split("\n")
            .map((item) => item.trim())
            .filter((item) => item !== "");
        handleChange({ target: { name, value: newArray } });
    };

    return (
        <>
        <form
            method="POST"
            onSubmit={handleSubmit}
            className="space-y-6 bg-cardDark p-8 rounded-lg shadow-lg border border-gray-600"
        >
            {(error || submitError) && (
                <div className="bg-red-800 text-gray-100 p-3 rounded mb-4">
                    Error: {error || submitError}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label
                        htmlFor="Name"
                        className="block text-sm font-medium text-gray-300"
                    >
                        Name
                    </label>
                    <input
                        type="text"
                        name="Name"
                        id="Name"
                        required
                        className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-gray-400 placeholder-text-gray-400 border border-gray-600"
                        value={tool.Name || ""}
                        onChange={handleChange}
                        autoFocus={isNew}
                    />
                </div>
                <div>
                    <label
                        htmlFor="Domain"
                        className="block text-sm font-medium text-gray-300"
                    >
                        Domain
                    </label>
                    <input
                        type="text"
                        name="Domain"
                        id="Domain"
                        required
                        className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-gray-400 placeholder-text-gray-400 border border-gray-600"
                        value={tool.Domain || ""}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div>
                <label
                    htmlFor="Website"
                    className="block text-sm font-medium text-gray-300"
                >
                    Website
                </label>
                <input
                    type="text"
                    name="Website"
                    id="Website"
                    required
                    className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-gray-400 placeholder-text-gray-400 border border-gray-600"
                    value={tool.Website || ""}
                    onChange={handleChange}
                />
            </div>

            <div>
                <label
                    htmlFor="Why"
                    className="block text-sm font-medium text-gray-300"
                >
                    Why
                </label>
                <textarea
                    name="Why"
                    id="Why"
                    rows="3"
                    className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-gray-400 placeholder-text-gray-400 border border-gray-600"
                    value={tool.Why || ""}
                    onChange={handleChange}
                ></textarea>
            </div>

            <div>
                <label
                    htmlFor="Description"
                    className="block text-sm font-medium text-gray-300"
                >
                    Description
                </label>
                <textarea
                    name="Description"
                    id="Description"
                    rows="3"
                    className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-gray-400 placeholder-text-gray-400 border border-gray-600"
                    value={tool.Description || ""}
                    onChange={handleChange}
                ></textarea>
            </div>
            <div>
                <label
                    htmlFor="Details"
                    className="block text-sm font-medium text-gray-300"
                >
                    Details
                </label>
                <textarea
                    name="Details"
                    id="Details"
                    rows="5"
                    className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-gray-400 placeholder-text-gray-400 border border-gray-600"
                    value={tool.Details || ""}
                    onChange={handleChange}
                ></textarea>
            </div>

            <div>
                <label
                    htmlFor="Features"
                    className="block text-sm font-medium text-gray-300"
                >
                    Features (one per line)
                </label>
                <textarea
                    name="Features"
                    id="Features"
                    rows="5"
                    className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-gray-400 placeholder-text-gray-400 border border-gray-600"
                    value={
                        Array.isArray(tool.Features)
                            ? tool.Features.join("\n")
                            : ""
                    }
                    onChange={handleArrayChange}
                ></textarea>
            </div>

            <div>
                <label
                    htmlFor="Cautions"
                    className="block text-sm font-medium text-gray-300"
                >
                    Cautions (one per line)
                </label>
                <textarea
                    name="Cautions"
                    id="Cautions"
                    rows="3"
                    className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-gray-400 placeholder-text-gray-400 border border-gray-600"
                    value={
                        Array.isArray(tool.Cautions)
                            ? tool.Cautions.join("\n")
                            : ""
                    }
                    onChange={handleArrayChange}
                ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label
                        htmlFor="Buyer"
                        className="block text-sm font-medium text-gray-300"
                    >
                        Buyer
                    </label>
                    <input
                        type="text"
                        name="Buyer"
                        id="Buyer"
                        className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-gray-400 placeholder-text-gray-400 border border-gray-600"
                        value={tool.Buyer || ""}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">
                        Pricing
                    </label>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 bg-gray-800 border border-gray-600 p-4 rounded-md">
                        {pricingOptions.map((option) => (
                            <div key={option} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`pricing-${option}`}
                                    name="Pricing"
                                    value={option}
                                    checked={
                                        tool.Pricing?.includes(option) || false
                                    }
                                    onChange={handleChange}
                                    className="h-4 w-4 text-green-300 bg-gray-800 border-gray-600 rounded"
                                />
                                <label
                                    htmlFor={`pricing-${option}`}
                                    className="ml-2 text-sm text-gray-300"
                                >
                                    {option}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <label
                        htmlFor="Base_Model"
                        className="block text-sm font-medium text-gray-300"
                    >
                        Base Model
                    </label>
                    <input
                        type="text"
                        name="Base_Model"
                        id="Base_Model"
                        className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-gray-400 placeholder-text-gray-400 border border-gray-600"
                        value={tool.Base_Model || ""}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Categories
                </label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-60 overflow-y-auto bg-gray-800 border border-gray-600 p-4 rounded-md">
                    {categories.map((cat) => {
                        const isChecked = categoryIdSet.has(String(cat.id));
                        return (
                            <div key={cat.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`category-${cat.id}`}
                                    name="Categories"
                                    value={cat.id}
                                    checked={isChecked}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-gray-300 border-gray-600 rounded"
                                />
                                <label
                                    htmlFor={`category-${cat.id}`}
                                    className={`ml-2 text-sm text-gray-300${isChecked ? "" : ""}`}
                                >
                                    {cat.Name}
                                </label>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex space-x-4 mt-6">
                <button type="button" onClick={() => setUseCasesModalOpen(true)} className="px-4 py-2 rounded text-gray-100 bg-teal-600 hover:bg-blue-500">Edit Use Cases</button>
            </div>

            <div className="flex space-x-6  bg-gray-800 border border-gray-600 p-4 rounded-md">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        name="Active"
                        id="Active"
                        className="h-4 w-4 text-gray-300 border-gray-600 rounded"
                        checked={tool.Active || false}
                        onChange={handleChange}
                    />
                    <label
                        htmlFor="Active"
                        className="ml-2 block text-sm text-gray-300"
                    >
                        Active
                    </label>
                </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
                <Link
                    href="/admin/tools"
                    className="bg-gray-600 text-gray-100 font-bold py-2 px-4 rounded hover:bg-gray-500 transition-colors"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    className="bg-teal-600 text-gray-100 font-bold py-2 px-4 rounded hover:bg-blue-500 transition-colors"
                    disabled={isSubmitting}
                >
                    {isSubmitting
                        ? "Saving..."
                        : isNew
                          ? "Create Tool"
                          : "Update Tool"}
                </button>
            </div>
        </form>
        <EditUseCasesModal
            isOpen={isUseCasesModalOpen}
            onClose={() => setUseCasesModalOpen(false)}
            useCases={tool.UseCases}
            onSave={handleSaveUseCases}
        />
        </>
    );
}
