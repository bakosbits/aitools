import { useState } from "react";
import Link from "next/link";
import ArticleForm from "@/components/ArticleForm";
import { createArticle } from "@/lib/airtable/articles";
import { parseFormBody, prepareArticleData } from "@/lib/form-helpers";

export async function getServerSideProps({ req, res }) {
    if (req.method === "POST") {
        try {
            const formData = await parseFormBody(req);
            const articleData = prepareArticleData(formData);

            await createArticle(articleData);

            res.writeHead(302, { Location: "/admin/articles" });
            res.end();
            return { props: {} };
        } catch (error) {
            console.error("Failed to create article:", error);
            return {
                props: {
                    error: error.message || "Failed to create article.",
                },
            };
        }
    }

    return { props: { error: null } };
}

export default function NewArticlePage({ error: serverError }) {
    const [aiTopic, setAiTopic] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [articleData, setArticleData] = useState(null);
    const [formKey, setFormKey] = useState(Date.now());
    const [clientError, setClientError] = useState(null);
    const [selectedModel, setSelectedModel] = useState("anthropic/claude-3.5-haiku");
    const [selectedArticleType, setSelectedArticleType] = useState("General");
    const articleTypes = ["General", "How-To", "Affiliate"];

    const generationModels = [
        { id: "anthropic/claude-3.5-haiku", name: "Claude 3.5 Haiku" },
        { id: "anthropic/claude-sonnet-4", name: "Claude 4 Sonnet" },        
        { id: "openai/gpt-4o", name: "OpenAI GPT-4o" },
        { id: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro" },
        { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash" },
    ];

    const generateContentWithAI = async () => {
        if (!aiTopic) return;
        setIsGenerating(true);
        setClientError(null);
        try {
            const response = await fetch("/api/generate-article", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    topic: aiTopic,
                    model: selectedModel,
                    articleType: selectedArticleType,
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || "Content generation failed.");
            }

            const data = await response.json();
            setArticleData({ Title: aiTopic, ...data });
            setFormKey(Date.now()); // Force re-render of the form
        } catch (err) {
            setClientError(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="w-full w-[80%] mx-auto">
            <Link href="/admin/articles" className="text-slate-100 hover:text-slate-300 mb-6 inline-block">&larr; Back to Articles</Link>
            <h1 className="text-3xl font-bold mb-6">New Article</h1>

            <div className="mb-8 p-8 bg-cardDark rounded-lg border border-gray-600">
                <h2 className="text-xl font-semibold mb-4">AI Content Generator</h2>
                <div className="flex flex-col gap-6 mb-4">
                    <div>
                        <label htmlFor="article-type-select" className="block text-sm font-medium text-slate-300 mb-1">Step 1: Select Article Type</label>
                        <select
                            id="article-type-select"
                            value={selectedArticleType}
                            onChange={(e) => setSelectedArticleType(e.target.value)}
                            className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-slate-100 placeholder-text-slate-100 border border-gray-600"
                        >
                            {articleTypes.map((type) => (
                                <option key={type} value={type}>{type} Blog Post</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="model-select" className="block text-sm font-medium text-slate-300 mb-1">Step 2: Select Generation Model</label>
                        <select
                            id="model-select"
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-slate-100 placeholder-text-slate-100 border border-gray-600"
                        >
                            {[...generationModels]
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map((model) => (
                                    <option key={model.id} value={model.id}>{model.name}</option>
                                ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="ai-topic-input" className="block text-sm font-medium text-slate-300 mb-1">Step 3: Enter a Topic or Title</label>
                        <div className="flex gap-4">
                            <input
                                id="ai-topic-input"
                                type="text"
                                value={aiTopic}
                                onChange={(e) => setAiTopic(e.target.value)}
                                placeholder="e.g., The Impact of AI on Modern Web Design"
                                className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-slate-100 placeholder-text-slate-100 border border-gray-600"
                            />
                            <button
                                onClick={generateContentWithAI}
                                disabled={isGenerating || !aiTopic}
                                className="bg-teal-600 text-slate-100 font-bold mt-1 px-4 rounded hover:bg-teal-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? "Generating..." : "Generate"}
                            </button>
                        </div>
                    </div>
                </div>
                {clientError && <p className="text-red-500 mt-2">{clientError}</p>}
            </div>

            <ArticleForm key={formKey} article={articleData} error={serverError} />
        </div>
    );
}