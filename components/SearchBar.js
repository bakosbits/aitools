import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Search } from "lucide-react";

/**
 * Renders a search input field and a submit button.
 * When the form is submitted, it navigates the user to the `/tools` page,
 * appending the search query as a URL parameter (e.g., `/tools?q=search-term`).
 * @param {object} props
 * @param {string} [props.initialQuery=""] - The initial value for the search input.
 */
export default function SearchBar({ initialQuery = "", path = "/tools" }) {
    const [query, setQuery] = useState(initialQuery);
    const router = useRouter();

    useEffect(() => {
        // Sync the input field if the query in the URL changes (e.g., browser back/forward)
        setQuery(initialQuery);
    }, [initialQuery]);

    const handleSearch = (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        if (query.trim()) {
            const encodedQuery = encodeURIComponent(query.trim());
            router.push(`${path}?q=${encodedQuery}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="gap-4">
            <div className="w-full flex justify-start gap-4">
                <div className="flex-grow">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                        }}
                        aria-label="Search for tools"
                        placeholder="Search tools..."
                        className="w-full px-4 py-2 rounded-md shadow-md bg-gray-800 border border-gray-600"
                    />
                </div>
                <button
                    type="submit"
                    className="flex items-center gap-2 px-3 py-1 rounded-md font-semibold bg-teal-600 text-gray-100 hover:bg-blue-600 transition"
                    aria-label="Search"
                >
                    <Search className="hidden md:inline-block w-5 h-5 text-gray-100" />
                    Search
                </button>
            </div>
        </form>
    );
}
