import Link from "next/link";
import { useState, useEffect } from "react";

export default function ToolForm({
    tool,
    categories,
    articles = [],
    tags = [],
    pricingOptions = [],
    error,
}) {
    const isNew = !tool?.id;
    const [formData, setFormData] = useState(tool || {});
    const [categorySearch, setCategorySearch] = useState("");
    const [articleSearch, setArticleSearch] = useState("");

    useEffect(() => {
        setFormData(tool || {});
    }, [tool]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === "checkbox") {
            setFormData((prevData) => {
                const currentValues = prevData[name] || [];
                if (checked) {
                    return { ...prevData, [name]: [...currentValues, value] };
                } else {
                    return { ...prevData, [name]: currentValues.filter((item) => item !== value) };
                }
            });
        } else if (name === "Features" || name === "Cautions") {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value.split("\n").map(item => item.trim()).filter(item => item !== ""),
            }));
        } else {
            setFormData((prevData) => ({ ...prevData, [name]: value }));
        }
    };

    const filteredCategories = categories.filter((cat) =>
        cat.Name.toLowerCase().includes(categorySearch.toLowerCase()),
    );
    const filteredArticles = articles.filter((article) =>
        article.Title.toLowerCase().includes(articleSearch.toLowerCase()),
    );

    return (
        <form
            method="POST"
            className="space-y-6 bg-cardDark p-8 rounded-lg shadow-lg border border-gray-600"
        >
            {error && (
                <div className="bg-red-800 text-slate-100 p-3 rounded mb-4">
                    Error: {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label
                        htmlFor="Name"
                        className="block text-sm font-medium text-slate-100"
                    >
                        Name
                    </label>
                    <input
                        type="text"
                        name="Name"
                        id="Name"
                        required
                        className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-slate-300 placeholder-text-slate-100 border border-gray-600"
                        value={formData.Name || ""}
                        onChange={handleChange}
                        autoFocus={isNew}
                    />
                </div>
                <div>
                    <label
                        htmlFor="Domain"
                        className="block text-sm font-medium text-slate-100"
                    >
                        Domain
                    </label>
                    <input
                        type="text"
                        name="Domain"
                        id="Domain"
                        required
                        className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-slate-300 placeholder-text-slate-100 border border-gray-600"
                        value={formData.Domain || ""}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div>
                <label
                    htmlFor="Website"
                    className="block text-sm font-medium text-slate-100"
                >
                    Website
                </label>
                <input
                    type="text"
                    name="Website"
                    id="Website"
                    required
                    className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-slate-300 placeholder-text-slate-100 border border-gray-600"
                    value={formData.Website || ""}
                    onChange={handleChange}
                />
            </div>

            <div>
                <label
                    htmlFor="Why"
                    className="block text-sm font-medium text-slate-100"
                >
                    Why
                </label>
                <textarea
                    name="Why"
                    id="Why"
                    rows="3"
                    className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-slate-300 placeholder-text-slate-100 border border-gray-600"
                    value={formData.Why || ""}
                    onChange={handleChange}
                ></textarea>
            </div>

            <div>
                <label
                    htmlFor="Description"
                    className="block text-sm font-medium text-slate-100"
                >
                    Description
                </label>
                <textarea
                    name="Description"
                    id="Description"
                    rows="3"
                    className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-slate-300 placeholder-text-slate-100 border border-gray-600"
                    value={formData.Description || ""}
                    onChange={handleChange}
                ></textarea>
            </div>
            <div>
                <label
                    htmlFor="Details"
                    className="block text-sm font-medium text-slate-100"
                >
                    Details
                </label>
                <textarea
                    name="Details"
                    id="Details"
                    rows="5"
                    className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-slate-300 placeholder-text-slate-100 border border-gray-600"
                    value={formData.Details || ""}
                    onChange={handleChange}
                ></textarea>
            </div>

            <div>
                <label
                    htmlFor="Features"
                    className="block text-sm font-medium text-slate-100"
                >
                    Features
                </label>
                <textarea
                    name="Features"
                    id="Features"
                    rows="5"
                    className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-slate-300 placeholder-text-slate-100 border border-gray-600"
                    value={
                        Array.isArray(formData.Features)
                            ? formData.Features.join("\n")
                            : formData.Features || ""
                    }
                    onChange={handleChange}
                ></textarea>
            </div>

            <div>
                <label
                    htmlFor="Cautions"
                    className="block text-sm font-medium text-slate-100"
                >
                    Cautions
                </label>
                <textarea
                    name="Cautions"
                    id="Cautions"
                    rows="3"
                    className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-slate-300 placeholder-text-slate-100 border border-gray-600"
                    value={
                        Array.isArray(formData.Cautions)
                            ? formData.Cautions.join("\n")
                            : formData.Cautions || ""
                    }
                    onChange={handleChange}
                ></textarea>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-100 mb-2">
                    Tags
                </label>

                <div className="flex flex-wrap gap-2 p-4 rounded-md bg-gray-800 border border-gray-600">
                    {Array.isArray(formData.Tags) && formData.Tags.length > 0 ? (
                        formData.Tags.map((tagName, index) => (
                            <div
                                key={index} // Use index as key since we don't have a unique id
                                className="px-3 py-1 rounded-full bg-gray-700 text-gray-200 text-sm flex items-center"
                            >
                                {tagName}
                                {/* No hidden input here, as this is for display only */}
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-400">No tags assigned</p>
                    )}
                </div>
                <p className="mt-1 text-xs text-gray-400">Tags can be updated using the bulk update tool</p>
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
                        className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-slate-300 placeholder-text-slate-100 border border-gray-600"
                        value={formData.Buyer || ""}
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
                                    checked={formData.Pricing?.includes(option) || false}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-green-300 bg-gray-800 border-gray-600 rounded focus:ring-green-300"
                                />
                                <label
                                    htmlFor={`pricing-${option}`}
                                    className="ml-2 text-sm text-gray-200"
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
                        className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-slate-300 placeholder-text-slate-100 border border-gray-600"
                        value={formData.Base_Model || ""}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Categories
                </label>
                <input
                    type="text"
                    placeholder="Filter categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full mb-2 px-4 py-2 rounded-md bg-gray-900 text-slate-100 placeholder-text-gray-400 border border-gray-600"
                />
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-60 overflow-y-auto bg-gray-800 border border-gray-600 p-4 rounded-md">
                    {filteredCategories.length > 0 ? (
                        filteredCategories.map((cat) => (
                            <div key={cat.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`category-${cat.id}`}
                                    name="Categories"
                                    value={cat.Name}
                                    checked={formData.Categories?.includes(cat.Name) || false}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-gray-300 border-gray-600 rounded focus:ring-green-300"
                                />
                                <label
                                    htmlFor={`category-${cat.id}`}
                                    className="ml-2 text-sm text-gray-200"
                                >
                                    {cat.Name}
                                </label>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-400 col-span-full">
                            No categories match your filter.
                        </p>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Related Articles
                </label>
                <input
                    type="text"
                    placeholder="Filter articles..."
                    value={articleSearch}
                    onChange={(e) => setArticleSearch(e.target.value)}
                    className="w-full mb-2 px-4 py-2 rounded-md bg-gray-900 text-slate-100 placeholder-text-gray-400 border border-gray-600"
                />
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-60 overflow-y-auto  bg-gray-800 border border-gray-600 p-4 rounded-md">
                    {filteredArticles.length > 0 ? (
                        filteredArticles.map((article) => (
                            <div key={article.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`article-${article.id}`}
                                    name="Articles"
                                    value={article.id}
                                    checked={formData.Articles?.includes(article.id) || false}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-gray-300 border-gray-600 rounded focus:ring-green-300"
                                />
                                <label
                                    htmlFor={`article-${article.id}`}
                                    className="ml-2 text-sm text-gray-200"
                                    title={article.Title}
                                >
                                    {article.Title.length > 25
                                        ? `${article.Title.substring(0, 25)}...`
                                        : article.Title}
                                </label>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-400 col-span-full">
                            No articles match your filter.
                        </p>
                    )}
                </div>
            </div>

            <div className="flex space-x-6  bg-gray-800 border border-gray-600 p-4 rounded-md">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        name="Active"
                        id="Active"
                        className="h-4 w-4 text-gray-300 border-gray-600 rounded focus:ring-green-300"
                        checked={formData.Active || false}
                        onChange={handleChange}
                    />
                    <label htmlFor="Active" className="ml-2 block text-sm text-gray-300">
                        Active
                    </label>
                </div>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        name="Featured"
                        id="Featured"
                        className="h-4 w-4 text-green-300 bg-gray-700 border-gray-600 rounded focus:ring-green-300"
                        checked={formData.Featured || false}
                        onChange={handleChange}
                    />
                    <label
                        htmlFor="Featured"
                        className="ml-2 block text-sm text-gray-300"
                    >
                        Featured
                    </label>
                </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
                <Link
                    href="/admin/tools"
                    className="bg-gray-600 text-slate-100 font-bold py-2 px-4 rounded hover:bg-gray-500 transition-colors"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    className="bg-teal-600 text-slate-100 font-bold py-2 px-4 rounded hover:bg-emerald-600 transition-colors"
                >
                    {isNew ? "Create Tool" : "Update Tool"}
                </button>
            </div>
        </form>
    );
}
