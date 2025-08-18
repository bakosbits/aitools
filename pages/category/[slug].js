import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { getCategorySlugs } from "@/lib/airtable/categories";
import { getToolsByCategory } from "@/lib/airtable/tools";

import ToolCard from "@/components/ToolCard";
import MetaProps from "@/components/MetaProps";
import CompareBar from "@/components/CompareBar";
import Pagination from "@/components/Pagination";

export async function getStaticPaths() {
    return {
        paths: [],
        fallback: "blocking", // or true, depending on your needs
    };
}

export async function getStaticProps({ params }) {
    const slug = params.slug;
    const categories = await getCategorySlugs();
    const matchingCategory = categories.find((cat) => cat.Slug === slug);
    let tools = await getToolsByCategory(slug);

    // Ensure tools is always an array
    if (!Array.isArray(tools)) {
        tools = [];
    }

    // Sort tools by name at build time.
    const sortedTools = [...tools].sort((a, b) => a.Name.localeCompare(b.Name));

    const props = {
        tools: sortedTools,
        category: matchingCategory.Name,
        slug, // Pass slug for canonical URL
    };

    return {
        props,
        revalidate: 300,
    };
}

const ITEMS_PER_PAGE = 12;

export default function CategoryPage({ tools, category, slug }) {
    const router = useRouter();
    const validTools = useMemo(() => {
        return Array.isArray(tools) ? tools : [];
    }, [tools]);
    const validCategory = typeof category === "string" ? category : "Unknown";
    const [compareList, setCompareList] = useState([]);

    // The source of truth for the current page is now the URL query parameter.
    // Default to 1 if the parameter is not present or invalid.
    const pageParam = router.query.page ?? "1";
    const parsedPage = parseInt(pageParam, 10);
    const currentPage = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;

    const handlePageChange = useCallback(
        (page) => {
            router.push(
                {
                    pathname: router.pathname,
                    query: { ...router.query, page },
                },
                undefined,
                { shallow: true },
            );
        },
        [router],
    );

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

    const totalPages = Math.ceil(validTools.length / ITEMS_PER_PAGE);
    const paginatedTools = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const currentBatch = validTools.slice(startIndex, endIndex);

        return currentBatch;
    }, [validTools, currentPage]);

    useEffect(() => {
        // Debounce scroll to top to avoid jank on rapid navigation
        const timer = setTimeout(() => {
            if (window.scrollY > 0) {
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [currentPage]);

    return (
        <>
            <MetaProps
                title={`AI Tools in ${validCategory}`}
                description={`AI Tools in ${validCategory}. Research And Compare AI Tools Side By Side. Grouped By Profession.`}
                url={`${process.env.NEXT_PUBLIC_BASE_URL || "https://aitoolpouch.com"}/category/${slug}/`}
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
                    {paginatedTools.length === 0 && (
                        <p className="text-gray-600 mt-4">
                            No tools found in this category.
                        </p>
                    )}
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
