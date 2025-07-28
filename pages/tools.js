import { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";
import { getAllTools } from "@/lib/shared/tools";
import ToolCard from "@/components/ToolCard";
import CompareBar from "@/components/CompareBar";
import SearchBar from "@/components/SearchBar";
import MetaProps from "@/components/MetaProps";
import Pagination from "@/components/Pagination";

const ITEMS_PER_PAGE = 12;

export async function getStaticProps() {
    try {
        const tools = await getAllTools();
        return {
            props: {
                tools,
            },
            revalidate: 1800, // Revalidate every 30 minutes
        };
    } catch (error) {
        console.error("[getStaticProps - Tools Page] Failed to fetch tools:", error);
        return {
            props: {
                tools: [],
            },
            revalidate: 60, // Shorter revalidate on error
        };
    }
}

export default function ToolsPage({ tools }) {
    const router = useRouter();
    const query = router.query.q?.toLowerCase() || "";

    const [currentPage, setCurrentPage] = useState(1);
    const [compareList, setCompareList] = useState([]);

    const toggleCompare = (tool) => {
        setCompareList((prev) => {
            const exists = prev.find((t) => t.id === tool.id);
            if (exists) {
                return prev.filter((t) => t.id !== tool.id);
            } else {
                return prev.length < 2 ? [...prev, tool] : prev;
            }
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
                tool.Detail,
                Array.isArray(tool.Features)
                    ? tool.Features.join(" ")
                    : tool.Features,
            ];
            return searchableFields.some(
                (field) => field && field.match(searchRegex),
            );
        });
    }, [query, sortedTools]);

    // Reset to the first page whenever the search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [query]);

    const totalPages = Math.ceil(filteredTools.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedTools = filteredTools.slice(startIndex, endIndex);

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
                        ? `Tools matching "${query}"`
                        : "Explore our full library of AI tools"
                }
                url={`https://aitoolpouch.com/tools/`}
            />
            <div className="max-w-7xl mx-auto flex flex-col items-start">
                <div className="w-full">
                    <CompareBar
                        compareList={compareList}
                        toggleCompare={toggleCompare}
                    />
                </div>
                <div className="w-full justify-between items-center mb-4">
                    <h1 className="text-2xl text-gray-100 font-bold">
                        {isSearch
                            ? `Search Results for "${query}"`
                            : "Browsing All Tools"}
                    </h1>
                </div>
                <div className="w-full mx-auto justify-between items-center mb-6 gap-6">
                    <SearchBar tools={tools} />
                </div>
                <div className="w-full">
                    <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {paginatedTools.length > 0 ? (
                            paginatedTools.map((tool) => (
                                <li key={tool.id}>
                                    <ToolCard
                                        tool={tool}
                                        compareList={compareList}
                                        toggleCompare={toggleCompare}
                                    />
                                </li>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10">
                                <p className="text-gray-400">No tools found matching your search.</p>
                            </div>
                        )}
                    </ul>
                </div>
                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                )}
            </div>
        </>
    );
}
