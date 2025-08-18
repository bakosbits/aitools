import { getAllToolSlugs, getToolBySlug } from "@/lib/airtable/tools";
import { getCategoriesByTool } from "@/lib/airtable/categories";

import React from "react";
import Link from "next/link";
import DetailToolCard from "@/components/DetailToolCard";
import MetaProps from "@/components/MetaProps";

export async function getStaticPaths() {
    try {
        const tools = await getAllToolSlugs();
        const paths = tools.map((tool) => ({
            params: { slug: tool.Slug },
        }));

        return { paths, fallback: "blocking" };
    } catch (error) {
        console.error(
            "[getStaticPaths - Tool] Error fetching tools for paths:",
            error,
        );
        return { paths: [], fallback: "blocking" };
    }
}

export async function getStaticProps({ params }) {
    try {
        const tool = await getToolBySlug(params.slug);

        if (!tool) {
            return { notFound: true };
        }

        const categories = await getCategoriesByTool(params.slug);

        return {
            props: { tool, categories },
            revalidate: 300,
        };
    } catch (error) {
        console.error(`[getStaticProps - Tool: ${params.slug}] Error:`, error);
        return { notFound: true };
    }
}

export default function ToolPage({ tool, categories}) {
    return (
        <>
            <MetaProps
                title={`${tool.Name}`}
                description={`Detailed Information about ${tool.Name}`}
                url={`${
                    process.env.NEXT_PUBLIC_BASE_URL ||
                    "https://aitoolpouch.com"
                }/tool/${tool.Slug}/`}
            />
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="w-full max-w-6xl">
                    {/* Top Row */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                        <h1 className="text-2xl font-bold">
                            Reviewing {tool.Name}
                        </h1>
                    </div>
                    {/* Left column */}
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-[80%] flex">
                            <DetailToolCard tool={tool} />
                        </div>
                        {/* Right column */}
                        <div className="w-full md:w-[20%] flex flex-col items-start text-left">
                            <img
                                src={tool.Logo}
                                alt={`${tool.Name} logo`}
                                title={tool.Name}
                                className="object-contain mb-6 border rounded-xl shadow-lg border-gray-800"
                            />
                            <h1 className="text-xl font-bold mb-2">
                                Found in:
                            </h1>
                            <ul className="flex flex-col list-disc ml-6">
                                {categories.map((cat) => (
                                    <li key={cat.id || cat.Slug}>
                                        <Link
                                            href={`/category/${cat.Slug}`}
                                            className="text-gray-100 hover:text-gray-300 transition"
                                        >
                                            {cat.Name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
