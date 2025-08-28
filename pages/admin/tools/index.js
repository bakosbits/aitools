import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useEffect } from "react";
import { getAllTools, deleteTool } from "@/lib/airtable/tools";
import { parseFormBody } from "@/lib/form-helpers";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";

const ITEMS_PER_PAGE = 25;

export async function getServerSideProps({ req, res }) {
    if (req.method === "POST") {
        const { _action, id } = await parseFormBody(req);

        if (_action === "delete" && id) {
            try {
                await deleteTool(id);
                res.writeHead(302, { Location: "/admin/tools" });
                res.end();
                return { props: {} };
            } catch (error) {
                console.error("Failed to delete tool:", error);
            }
        }
    }

    const tools = await getAllTools();
    return {
        props: {
            tools,
        },
    };
}

export default function ToolsPage({ tools }) {
    const router = useRouter();
    const query = router.query.q?.toLowerCase() || "";

    // The source of truth for the current page is now the URL query parameter.
    // Default to 1 if the parameter is not present or invalid.
    const pageParam = router.query.page ?? "1";
    const parsedPage = parseInt(pageParam, 10);
    const currentPage = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;

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

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [currentPage]);

    return (
        <>
            <div className="w-full md:w-[75%] mx-auto">
                <div>
                    <Link
                        href="/admin"
                        className="text-gray-300 hover:text-gray-100 mb-6 inline-block"
                    >
                        &larr; Back to Main Menu
                    </Link>
                </div>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-300">
                        Manage Tools
                    </h1>
                    <Link
                        href="/admin/tools/new"
                        className="bg-teal-600 text-gray-100 font-bold py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                    >
                        + New Tool
                    </Link>
                </div>
                <div className="w-full mx-auto flex justify-between items-center mb-6 gap-4">
                    <Link
                        href="/admin/tools"
                        className="bg-teal-600 text-gray-100 font-bold py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                    >
                        Reset
                    </Link>
                    <div className="w-full mx-auto justify-between items-center">
                        <SearchBar initialQuery={query} path="/admin/tools" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th className="px-5 text-left  font-semibold text-gray-300 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-5 text-left  font-semibold text-gray-300 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-5 text-left  font-semibold text-gray-300 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-5 text-right  font-semibold text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedTools.length > 0 ? (
                                paginatedTools.map((tool) => (
                                    <tr
                                        key={tool.id}
                                        className="bg-cardDark border border-gray-600 hover:bg-gray-800"
                                    >
                                        <td className="px-5 py-4 text-sm text-gray-300">
                                            {tool.Name}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-300">
                                            {tool.Description
                                                ? `${tool.Description.substring(0, 100)}${tool.Description.length > 100 ? "..." : ""}`
                                                : ""}
                                        </td>
                                        <td className="px-5 py-4 text-sm">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-semibold ${tool.Active ? "bg-green-500 text-gray-100" : "bg-yellow-200 text-yellow-800"}`}
                                            >
                                                {tool.Active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-right">
                                            <Link
                                                href={`/admin/tools/edit/${tool.id}`}
                                                className="text-gray-300 hover:text-gray-100 mr-4"
                                            >
                                                Edit
                                            </Link>
                                            <form
                                                method="POST"
                                                action="/admin/tools"
                                                style={{ display: "inline" }}
                                                onSubmit={(e) => {
                                                    if (
                                                        !window.confirm(
                                                            "Are you sure you want to delete this tool?",
                                                        )
                                                    )
                                                        e.preventDefault();
                                                }}
                                            >
                                                <input
                                                    type="hidden"
                                                    name="_action"
                                                    value="delete"
                                                />
                                                <input
                                                    type="hidden"
                                                    name="id"
                                                    value={tool.id}
                                                />
                                                <button
                                                    type="submit"
                                                    className="text-red-500 hover:text-red-600"
                                                >
                                                    Delete
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-10">
                                    <p>No tools found matching your search.</p>
                                </div>
                            )}
                        </tbody>
                    </table>

                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}
                </div>
            </div>
        </>
    );
}
