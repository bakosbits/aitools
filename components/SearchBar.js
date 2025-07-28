import { useState } from "react";
import { useRouter } from "next/router";

/**
 * Renders a search input field and a submit button.
 * When the form is submitted, it navigates the user to the `/tools` page,
 * appending the search query as a URL parameter (e.g., `/tools?q=search-term`).
 */
export default function SearchBar() {
    const [query, setQuery] = useState("");
    const router = useRouter();


    const handleSearch = (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        if (query.trim()) {
            const encodedQuery = encodeURIComponent(query.trim());
            router.push(`/tools?q=${encodedQuery}`);
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
                        placeholder="Search tools..."
                        className="w-full px-4 py-2 rounded-md bg-gray-800 text-gray-100 placeholder-text-gray-400 border border-gray-600"
                    />
                </div>
                <button
                    type="submit"
                    className="flex items-center gap-1 bg-emerald-500 text-gray-100 px-3 py-1.5 rounded font-semibold hover:bg-emerald-600 transition"
                    aria-label="Search"
                >
                    <svg
                        className="w-6 h-6 text-gray-100"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10.293 15.707a1 1 0 010-1.414L13.586 11H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                        />
                    </svg>
                    Search
                </button>
            </div>
        </form>
    );
}
