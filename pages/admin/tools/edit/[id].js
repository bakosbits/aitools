import { useState } from "react";
import Link from "next/link";
import { getToolById, updateTool } from "@/lib/airtable/tools";
import { getAllCategories } from "@/lib/airtable/categories";
import { getAllArticles } from "@/lib/airtable/articles";
import { PRICING_OPTIONS } from "@/lib/constants";
import { parseFormBody } from "@/lib/form-helpers";
import ToolForm from "@/components/ToolForm";
import AiResearchAssistant from "@/components/AiResearchAssistant";

export async function getServerSideProps({ req, res, params }) {
  const { id } = params;
  const pricingOptions = PRICING_OPTIONS;

  if (req.method === "POST") {
    try {
      const data = await parseFormBody(req);
      await updateTool(id, data);
      res.writeHead(302, { Location: "/admin/tools" });
      res.end();
      return { props: {} };
    } catch (error) {
      console.error("Failed to update tool:", error);
      const tool = await getToolById(id);
      const categories = await getAllCategories();
      const articles = await getAllArticles();
      return {
        props: {
          tool,
          categories,
          articles,
          pricingOptions,
          error: "Failed to update tool.",
        },
      };
    }
  }

  const tool = await getToolById(id);
  const categories = await getAllCategories();
  const articles = await getAllArticles();

  const categoryIds = tool.Categories?.map(name => {
    const category = categories.find(cat => cat.Name === name);
    return category ? category.id : null;
  }).filter(id => id !== null);

  const toolWithCategoryIds = {
    ...tool,
    Categories: categoryIds,
  };

  return {
    props: {
      tool: toolWithCategoryIds,
      categories,
      articles,
      pricingOptions,
    },
  };
}

export default function EditToolPage({
  tool,
  categories,
  articles,
  pricingOptions,
  error,
}) {
  const [formData, setFormData] = useState(tool);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      if (name === "Categories" || name === "Articles" || name === "Pricing") {
        const currentValues = formData[name] || [];
        if (checked) {
          setFormData((prev) => ({ ...prev, [name]: [...currentValues, value] }));
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

  return (
    <div className="w-full md:w-[75%] mx-auto">
      <div>
        <Link
          href="/admin/tools"
          className="text-slate-300 hover:text-slate-100 mb-6 inline-block"
        >
          &larr; Back to Tools
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-slate-300 mb-6">
        Edit: {tool.Name}
      </h1>
      <AiResearchAssistant
        onResearchComplete={setFormData}
        initialResearchTerm={tool.Name}
      />
      <ToolForm
        tool={formData}
        categories={categories}
        articles={articles}
        pricingOptions={pricingOptions}
        handleChange={handleChange}
        error={error}
      />
    </div>
  );
}