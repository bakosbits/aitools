import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { getToolsByCategory } from "@/lib/shared/tools";
import { getAllCategories } from "@/lib/shared/categories";

import ToolCard from "@/components/ToolCard";
import MetaProps from "@/components/MetaProps";
import CompareBar from "@/components/CompareBar";
import Pagination from "@/components/Pagination";


export async function getStaticPaths() {
    try {
        const categories = await getAllCategories();
        const paths = categories.map((cat) => ({
            params: { slug: cat.Slug },
        }));

        return { paths, fallback: false };
    } catch (error) {
        console.error("[getStaticPaths - Category] Error fetching categories for paths:", error);
        return { paths: [], fallback: false };
    }
}

export async function getStaticProps({ params }) {
    const slug = params.slug;

    try {
        const categories = await getAllCategories();
        const matchingCategory = categories.find((cat) => cat.Slug === slug);

        if (!matchingCategory) {
            return {
                notFound: true,
            };
        }
        const tools = await getToolsByCategory(slug);
        return {
            props: {
                tools,
                category: matchingCategory.Name,
                slug, // Pass slug for canonical URL
            },
            revalidate: 300,
        };
    } catch (error) {
        console.error(`[getStaticProps - Category: ${slug}] Error:`, error);
        return {
            notFound: true,
        };
    }
}

export default function CategoryPage({ tools, category, slug }) {
    const router = useRouter();

    const validTools = Array.isArray(tools) ? tools : [];
    const validCategory = typeof category === "string" ? category : "Unknown";
    const [compareList, setCompareList] = useState([]);

    // The source of truth for the current page is now the URL query parameter.
    // Default to 1 if the parameter is not present or invalid.
    const currentPage = parseInt(router.query.page, 10) || 1;

    const handlePageChange = (page) => {
        router.push(
            {
                pathname: router.pathname,
                query: { ...router.query, page },
            },
            undefined,
            { shallow: true },
        );
    };

    const toggleCompare = useCallback((tool) => {
        setCompareList((prev) => {
            const exists = prev.find((t) => t.id === tool.id);
            let newState;
            if (exists) {
                newState = prev.filter((t) => t.id !== tool.id);
            } else {
                newState = prev.length < 2 ? [...prev, tool] : prev;
            }
            return newState;
        });
    }, []);

    const ITEMS_PER_PAGE = 12;
    const sortedTools = useMemo(() => {
        const sorted = [...validTools].sort((a, b) =>
            a.Name.localeCompare(b.Name),
        );
        return sorted;
    }, [validTools]);

    const totalPages = Math.ceil(sortedTools.length / ITEMS_PER_PAGE);
    const paginatedTools = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const currentBatch = sortedTools.slice(startIndex, endIndex);

        return currentBatch;
    }, [sortedTools, currentPage]);

    useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" });
        }, [currentPage]);

    return (
        <>
            <MetaProps
                title={`AI Tools in ${validCategory}`}
                description={`AI Tools in ${validCategory}. Research And Compare AI Tools Side By Side. Grouped By Profession.`}
                url={`https://aitoolpouch.com/category/${slug}/`}
            />
            <div className="w-full mb-6">
                <CompareBar
                    compareList={compareList}
                    toggleCompare={toggleCompare}
                />
            </div>
            <div className="max-w-7xl mx-auto">
                <div className="w-full grid grid-cols-1 justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">
                        Compare Tools for {validCategory}
                    </h1>
                </div>
                <div className="w-full">
                    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                        {paginatedTools.map((tool) => (
                            <li key={tool.id}>
                                <ToolCard
                                    tool={tool}
                                    compareList={compareList}
                                    toggleCompare={toggleCompare}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>
        </>
    );
}
