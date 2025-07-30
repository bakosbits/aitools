import Link from "next/link";
import ToolForm from "@/components/ToolForm";
import { createTool } from "@/lib/airtable/tools";
import { getAllCategoriesForAdmin } from "@/lib/airtable/categories";
import { getAllArticlesForAdmin } from "@/lib/airtable/articles";
import { parseToolForm } from "@/lib/form-helpers";
import { PRICING_OPTIONS } from "@/lib/constants";
import { useState } from "react";


export async function getServerSideProps({ req, res }) {
    if (req.method === "POST") {
        try {
            const formData = await parseToolForm(req);
            const toolData = {
                ...formData,
                Active: formData.Active === 'on',
                Featured: formData.Featured === 'on',
            };

            // Ensure Pricing is always an array for Airtable's multi-select field
            if (toolData.Pricing) {
                toolData.Pricing = Array.isArray(toolData.Pricing) ? toolData.Pricing : [toolData.Pricing];
            } else {
                toolData.Pricing = [];
            }

            // Ensure Tags is an array of strings
            if (toolData.Tags && typeof toolData.Tags === 'string') {
                toolData.Tags = toolData.Tags.split(',').map(tag => tag.trim()).filter(Boolean);
            } else if (!toolData.Tags) {
                toolData.Tags = [];
            }

            // Ensure Categories is always an array for Airtable's linked record field
            if (toolData.Categories) {
                toolData.Categories = Array.isArray(toolData.Categories) ? toolData.Categories : [toolData.Categories];
            } else {
                toolData.Categories = [];
            }

            // Ensure Articles is always an array for Airtable's linked record field
            if (toolData.Articles) {
                toolData.Articles = Array.isArray(toolData.Articles) ? toolData.Articles : [toolData.Articles];
            } else {
                toolData.Articles = [];
            }


            await createTool(toolData);

            res.writeHead(302, { Location: "/admin/tools" });
            res.end();
            return { props: {} };
        } catch (error) {
            console.error("Failed to create tool:", error);
            const [categories, articles] = await Promise.all([
                getAllCategoriesForAdmin(),
                getAllArticlesForAdmin(),
            ]);
            return {
                props: {
                    pricingOptions: PRICING_OPTIONS,
                    categories,
                    articles,
                    error: error.message || "Something went wrong.",
                },
            };
        }
    }

    const [categories, articles] = await Promise.all([
        getAllCategoriesForAdmin(),
        getAllArticlesForAdmin(),
    ]);
    return {
        props: {
            pricingOptions: PRICING_OPTIONS,
            categories,
            articles,
            error: null,
        },
    };
}

export default function NewToolPage({ categories, articles, pricingOptions, error: serverError }) {
    const [researchTerm, setResearchTerm] = useState("");
    const [isResearching, setIsResearching] = useState(false);
    const [toolData, setToolData] = useState(null);
    const [formKey, setFormKey] = useState(Date.now()); // Used to reset the form
    const [clientError, setClientError] = useState(null);
    const [selectedModel, setSelectedModel] = useState("anthropic/claude-3.5-haiku");

    const researchModels = [
        { id: "anthropic/claude-3.5-haiku", name: "Claude 3.5 Haiku" },
        { id: "anthropic/claude-sonnet-4", name: "Claude 4 Sonnet" },        
        { id: "openai/gpt-4o", name: "OpenAI GPT-4o" },
        { id: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro" },
        { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash" },
    ];

    const handleResearch = async () => {
        if (!researchTerm) return;
        setIsResearching(true);
        setClientError(null);
        try {
            const response = await fetch("/api/research", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    toolName: researchTerm,
                    model: selectedModel,
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || "Research failed.");
            }

            const data = await response.json();
            setToolData(data);
            setFormKey(Date.now()); // Change key to force re-render of the form with new defaults
        } catch (err) {
            setClientError(err.message);
        } finally {
            setIsResearching(false);
        }
    };

    return (
        <div className="w-full w-[80%] mx-auto">
            <Link href="/admin/tools"  className="text-slate-100 hover:text-slate-300 mb-6 inline-block">&larr; Back to Tools</Link>
            <h1 className="text-3xl font-bold mb-6">New Tool</h1>
            <div className="mb-8 p-8 bg-cardDark rounded-lg border border-gray-600">
                <h2 className="text-xl font-semibold mb-4">AI Research Assistant</h2>
                <p className="text-sm mb-1">Enter A Tool Name</p>
                <div className="flex flex-col gap-4 mb-4">
                    <div className="flex gap-4">
                        <input type="text" value={researchTerm} onChange={(e) => setResearchTerm(e.target.value)} placeholder="e.g., Figma" className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-slate-100 placeholder-text-slate-100 border border-gray-600" />
                        <button onClick={handleResearch} disabled={isResearching} className="bg-teal-600 text-slate-100 font-bold mt-1 px-4 rounded hover:bg-teal-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                            {isResearching ? 'Researching...' : 'Research'}
                        </button>
                    </div>
                    <div>
                        <label htmlFor="model-select" className="block text-sm font-medium text-slate-300 mb-1">Select Research Model</label>
                        <select
                            id="model-select"
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-slate-100 placeholder-text-slate-100 border border-gray-600"
                        >
                            {[...researchModels]
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map(model => (
                                    <option key={model.id} value={model.id}>{model.name}</option>
                                ))
                            }
                        </select>
                    </div>
                </div>
                {clientError && <p className="text-red-500 mt-2">{clientError}</p>}
            </div>
            <ToolForm key={formKey} tool={toolData} categories={categories} articles={articles} pricingOptions={pricingOptions} error={serverError} />
        </div>
    );
}