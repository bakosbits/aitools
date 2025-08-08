import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { createArticle } from "@/lib/airtable/articles";
import { parseFormBody } from "@/lib/form-helpers";
import { AI_MODELS } from "@/lib/constants";

export async function getServerSideProps({ req, res }) {
  if (req.method === "POST") {
    try {
      const { Title, Summary, Content, Slug, Published } = await parseFormBody(req);
      await createArticle({ Title, Summary, Content, Slug, Published: !!Published });
      res.writeHead(302, { Location: "/admin/articles" });
      res.end();
      return { props: {} };
    } catch (error) {
      console.error("Failed to create article:", error);
      return { props: { error: "Failed to create article." } };
    }
  }
  return { props: {} };
}

export default function NewArticlePage({ error }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedArticleType, setSelectedArticleType] = useState("Blog Post");
  const [selectedModel, setSelectedModel] = useState("google/gemini-2.5-flash");
  const [aiTopic, setAiTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [clientError, setClientError] = useState(null);

  const articleTypes = ["Blog Post", "News Article", "Tutorial"]; // Example types
  const generationModels = AI_MODELS; // Assuming AI_MODELS is an array of objects with id and name

  const generateContentWithAI = async () => {
    if (!aiTopic) {
      setClientError("Please enter a topic to generate content.");
      return;
    }
    setIsGenerating(true);
    setClientError(null);

    try {
      const response = await fetch("/api/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleType: selectedArticleType,
          topic: aiTopic,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to generate content.");
      }

      const data = await response.json();
      // Assuming the API returns Title, Summary, and Content
      document.getElementById("Title").value = data.Title || "";
      document.getElementById("Summary").value = data.Summary || "";
      document.getElementById("Content").value = data.Content || "";
      document.getElementById("Slug").value = data.Slug || "";

    } catch (err) {
      setClientError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    event.target.submit();
  };

  return (
    <div className="w-full md:w-[75%] mx-auto">
      <div>
        <Link
          href="/admin/articles"
          className="text-slate-300 hover:text-slate-100 mb-6 inline-block"
        >
          &larr; Back to Manage Articles
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-slate-300 mb-6">Create New Article</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="bg-cardDark p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold text-slate-300 mb-4">AI Content Generation</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label
              htmlFor="article-type-select"
              className="block text-sm font-medium text-slate-300 mb-1"
            >
              Step 1: Select Article Type
            </label>
            <select
              id="article-type-select"
              value={selectedArticleType}
              onChange={(e) => setSelectedArticleType(e.target.value)}
              className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-slate-100 placeholder-text-slate-100 border border-gray-600"
            >
              {articleTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="model-select"
              className="block text-sm font-medium text-slate-300 mb-1"
            >
              Step 2: Select Generation Model
            </label>
            <select
              id="model-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-slate-100 placeholder-text-slate-100 border border-gray-600"
            >
              {[...generationModels]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="ai-topic-input"
              className="block text-sm font-medium text-slate-300 mb-1"
            >
              Step 3: Enter a Topic or Title
            </label>
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

      <form method="POST" onSubmit={handleSubmit} className="bg-cardDark p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="Title" className="block text-slate-300 text-sm font-bold mb-2">
            Title:
          </label>
          <input
            type="text"
            id="Title"
            name="Title"
            required
            className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 bg-gray-800 text-slate-300 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="Summary" className="block text-slate-300 text-sm font-bold mb-2">
            Summary:
          </label>
          <textarea
            id="Summary"
            name="Summary"
            rows="3"
            className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 bg-gray-800 text-slate-300 leading-tight focus:outline-none focus:shadow-outline"
          ></textarea>
        </div>
        <div className="mb-4">
          <label htmlFor="Content" className="block text-slate-300 text-sm font-bold mb-2">
            Content:
          </label>
          <textarea
            id="Content"
            name="Content"
            rows="10"
            className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 bg-gray-800 text-slate-300 leading-tight focus:outline-none focus:shadow-outline"
          ></textarea>
        </div>
        
        <div className="mb-6">
          <label htmlFor="Published" className="block text-slate-300 text-sm font-bold mb-2">
            Published:
          </label>
          <input
            type="checkbox"
            id="Published"
            name="Published"
            className="mr-2 leading-tight"
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-teal-600 text-slate-100 font-bold py-2 px-4 rounded hover:bg-teal-700 transition-colors focus:outline-none focus:shadow-outline"
          >
            {isSubmitting ? "Creating..." : "Create Article"}
          </button>
          <Link
            href="/admin/articles"
            className="bg-gray-700 text-slate-100 font-bold py-2 px-4 rounded hover:bg-gray-500 transition-colors focus:outline-none focus:shadow-outline"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
