import { getToolById, updateTool } from "@/lib/airtable/tools";
import { getAllCategoriesForAdmin } from "@/lib/airtable/categories";
import { getAllArticlesForAdmin } from "@/lib/airtable/articles";
import ToolForm from "@/components/ToolForm";
import Link from "next/link";
import { PRICING_OPTIONS } from "@/lib/constants";
import { parseToolForm } from "@/lib/form-helpers";

export async function getServerSideProps({ req, res, params }) {
    const { id } = params;

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

            await updateTool(id, toolData);

            res.writeHead(302, { Location: "/admin/tools" });
            res.end();
            return { props: {} };
        } catch (error) {
            console.error(`Failed to update tool ${id}:`, error);
            const [tool, categories, articles] = await Promise.all([
                getToolById(id),
                getAllCategoriesForAdmin(),
                getAllArticlesForAdmin(),
            ]);
            return {
                props: {
                    tool,
                    pricingOptions: PRICING_OPTIONS,
                    categories,
                    articles,
                    error: error.message || "Something went wrong.",
                },
            };
        }
    }

    const [tool, categories, articles] = await Promise.all([
        getToolById(id),
        getAllCategoriesForAdmin(),
        getAllArticlesForAdmin(),
    ]);

    if (!tool) {
        return { notFound: true };
    }

    return {
        props: {
            tool,
            pricingOptions: PRICING_OPTIONS,
            categories,
            articles,
            error: null,
        },
    };
}

export default function EditToolPage({ tool, categories, articles, pricingOptions, error }) {
    return (
        <div className="w-full w-[80%] mx-auto">
            <Link href="/admin/tools"  className="text-slate-100 hover:text-slate-300 mb-6 inline-block">&larr; Back to Tools</Link>
            <h1 className="text-3xl font-bold mb-6">Edit Tool</h1>
            <ToolForm tool={tool} categories={categories} articles={articles} pricingOptions={pricingOptions} error={error} />
        </div>
    );
}