const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    
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

    const visiblePages = getVisiblePages(currentPage, totalPages);

    return (
        <div className="flex overflow-x-auto space-x-2 sm:flex-wrap justify-center w-full mt-10">
            {visiblePages.map((page, idx) => (
                <button
                    key={idx}
                    disabled={page === "…"}
                    onClick={() => {
                        if (typeof page === "number") {
                            console.log(
                                `Pagination button clicked: Navigating to page ${page}`,
                            );
                            onPageChange(page);
                        } else {
                            console.log(
                                `Ellipsis button clicked (should be disabled): ${page}`,
                            );
                        }
                    }}
                    className={`py-2 rounded text-sm min-w-[40px] text-center ${
                        page === currentPage
                            ? "bg-accentGreen text-black font-bold"
                            : page === "…"
                              ? "cursor-default text-gray-400"
                              : "bg-gray-700 text-white hover:bg-gray-600"
                    }`}
                >
                    {page}
                </button>
            ))}
        </div>
    );
};

export default Pagination;
