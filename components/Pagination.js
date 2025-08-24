/**
 * Generates an array of page numbers and ellipses to be displayed.
 * This logic ensures that the pagination control remains compact by showing
 * a limited set of page numbers around the current page, with ellipses
 * representing the omitted pages.
 * @param {number} current - The current page number.
 * @param {number} total - The total number of pages.
 * @returns {Array<number|string>} An array of page numbers and/or '…' strings.
 */
const getVisiblePages = (current, total) => {
    const range = [];
    const delta = 2;

    // Always show first page
    range.push(1);

    // Add left ellipsis if current - delta > 2
    if (current - delta > 2) {
        range.push("…");
    }

    // Add middle pages
    for (
        let i = Math.max(2, current - delta);
        i <= Math.min(total - 1, current + delta);
        i++
    ) {
        range.push(i);
    }

    // Add right ellipsis if current + delta < total - 1
    if (current + delta < total - 1) {
        range.push("…");
    }

    // Always show last page
    if (total > 1) range.push(total);

    return range;
};

/**
 * Renders a pagination control for navigating between pages.
 * It displays a series of page numbers, including ellipses (...) for long ranges,
 * to allow users to jump to different pages of a list.
 * @param {object} props - The component props.
 * @param {number} props.currentPage - The currently active page number.
 * @param {number} props.totalPages - The total number of pages available.
 * @param {function(number): void} props.onPageChange - Callback function that is invoked when a page button is clicked. It receives the new page number as an argument.
 */
export default function Pagination({ currentPage, totalPages, onPageChange }) {
    const visiblePages = getVisiblePages(currentPage, totalPages);

    return (
        <div className="flex overflow-x-auto space-x-2 sm:flex-wrap justify-center w-full mt-10">
            {visiblePages.map((page, idx) => (
                <button
                    key={page === "…" ? `ellipsis-${idx}` : page}
                    disabled={page === "…"}
                    onClick={() =>
                        typeof page === "number" && onPageChange(page)
                    }
                    aria-current={page === currentPage ? "page" : undefined}
                    className={`py-2 rounded-lg text-sm min-w-[40px] text-center ${
                        page === currentPage
                            ? "bg-teal-600 text-gray-100 font-bold"
                            : page === "…"
                              ? "cursor-default bg-gray-800 text-gray-100"
                              : "bg-gray-700 text-gray-100 hover:bg-gray-600"
                    }`}
                >
                    {page}
                </button>
            ))}
        </div>
    );
}
