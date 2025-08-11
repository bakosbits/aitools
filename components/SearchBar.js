import { useState, useEffect } from "react";
import { useRouter } from "next/router";

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
            className="w-full px-4 py-2 rounded-lg shadow-lg bg-gray-800 placeholder- border border-gray-600"
          />
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 rounded font-semibold bg-teal-600 text-gray-100 hover:bg-teal-700 transition"
          aria-label="Search"
        >
          <svg
            className="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
          Search
        </button>
      </div>
    </form>
  );
}
