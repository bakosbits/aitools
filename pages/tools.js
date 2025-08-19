import { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";
import { getAllTools } from "@/lib/airtable/tools";
import ToolCard from "@/components/ToolCard";
import CompareBar from "@/components/CompareBar";
import SearchBar from "@/components/SearchBar";
import MetaProps from "@/components/MetaProps";
import Pagination from "@/components/Pagination";

const ITEMS_PER_PAGE = 24;

export async function getStaticProps() {
    try {
        const tools = await getAllTools();
        return {
            props: {
                tools,
            },
            revalidate: 1800, // Revalidate every 30 minutes (in seconds)
        };
    } catch (error) {
        console.error(
            "[getStaticProps - Tools Page] Failed to fetch tools:",
            error,
        );
        return {
            props: {
                tools: [],
            },
            revalidate: 60, // Shorter revalidate on error (in seconds, 60s = 1 minute)
        };
    }
}

export default function ToolsPage({ tools }) {
    const router = useRouter();
    const query = router.query.q?.toLowerCase() || "";

    // The source of truth for the current page is now the URL query parameter.
    // Default to 1 if the parameter is not present or invalid.
    const pageParam = router.query.page ?? "1";
    const parsedPage = parseInt(pageParam, 10);
    const currentPage = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const [compareList, setCompareList] = useState([]);

    const handlePageChange = (page) => {
        if (page === currentPage) return; // Prevent unnecessary navigation if page is the same
        router.push(
            {
                pathname: router.pathname,
                query: { ...router.query, page },
            },
            undefined,
            { shallow: true },
        );
    };

    const handleCompare = (tool) => {
        setCompareList((prev) => {
            const exists = prev.find((t) => t.id === tool.id);
            return exists
                ? prev.filter((t) => t.id !== tool.id)
                : prev.length < 2
                  ? [...prev, tool]
                  : prev;
        });
    };

    // Memoize the sorted list of all tools
    const sortedTools = useMemo(
        () => [...tools].sort((a, b) => a.Name.localeCompare(b.Name)),
        [tools],
    );

    // Derive filtered tools from the query and the sorted list
    const filteredTools = useMemo(() => {
        if (!query) {
            return sortedTools;
        }
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const searchRegex = new RegExp(escapedQuery, "i");
        return sortedTools.filter((tool) => {
            const searchableFields = [
                tool.Name,
                tool.Why,
                tool.Description,
                tool.Details,
                Array.isArray(tool.Features)
                    ? tool.Features.join(" ")
                    : (tool.Features ?? ""),
            ];
            return searchableFields.some(
                (field) =>
                    typeof field === "string" && field.match(searchRegex),
            );
        });
    }, [query, sortedTools]);

    const totalPages = Math.ceil(filteredTools.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedTools = filteredTools.slice(startIndex, endIndex);
    const totalTools = filteredTools.length;

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [currentPage]);

    const isSearch = query.trim() !== "";

    return (
        <>
            <MetaProps
                title={
                    isSearch
                        ? `Search Results for "${query}"`
                        : "Browse All Tools"
                }
                description={
                    isSearch
                        ? `${totalTools} Tools Matching "${query}"`
                        : "Explore our full library of AI tools"
                }
                url={
                    typeof window !== "undefined"
                        ? `${window.location.origin}${router.asPath || "/tools/"}`
                        : `https://aitoolpouch.com${router.asPath || "/tools/"}`
                }
            />
            <div className="max-w-7xl mx-auto flex flex-col items-start">
                <div className="w-full">
                    <CompareBar
                        compareList={compareList}
                        handleCompare={handleCompare}
                    />
                </div>
                <div className="w-full justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">
                        {isSearch
                            ? `${totalTools} Tools Found For "${query}"`
                            : "Browsing All Tools"}
                    </h1>
                </div>
                <div className="w-full mx-auto justify-between items-center mb-6 gap-6">
                    <SearchBar initialQuery={query} />
                </div>
                <div className="w-full">
                    <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {paginatedTools.length > 0 ? (
                            paginatedTools.map((tool) => (
                                <li key={tool.id}>
                                    <ToolCard
                                        tool={tool}
                                        compareList={compareList}
                                        handleCompare={handleCompare}
                                    />
                                </li>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10">
                                <p>No tools found matching your search.</p>
                            </div>
                        )}
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
