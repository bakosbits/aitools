import Link from "next/link";

/**
 * Renders a comparison bar at the top of the page when items are selected for comparison.
 * It displays the list of items being compared, allows removing items from the list,
 * and shows a "Compare Now" button to navigate to the comparison page when exactly two items are selected.
 * @param {object} props - The component props.
 * @param {Array<object>} props.compareList - An array of tool objects currently selected for comparison.
 * @param {function(object): void} props.toggleCompare - Function to add or remove a tool from the compare list.
 */
export default function CompareBar({ compareList = [], toggleCompare }) {
    if (compareList.length === 0) {
        return null;
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-cardDark px-4 p-4 border-b border-gray-600 flex items-center justify-between">
            <div className="flex items-center p-3 flex-wrap">
                <div className="px-2">
                    <span className="text-gray-300 font-bold">Comparing:</span>
                </div>
                {compareList.map((tool) => (
                    <div key={tool.id} className="flex items-center px-1">
                        <span className="text-gray-300">{tool.Name}</span>
                        <button
                            onClick={() => {
                                toggleCompare(tool);
                            }}
                            className="text-red-400 hover:text-red-200 px-1"
                        >
                            ✖
                        </button>
                    </div>
                ))}
            </div>
            {compareList.length === 2 &&
                compareList[0].Slug &&
                compareList[1].Slug && (
                    <Link
                        href={`/compare/${compareList[0].Slug}/vs/${compareList[1].Slug}`}
                        className="inline-flex items-center justify-center flex-nowrap
                            bg-teal-600 hover:bg-teal-700 transition-colors text-gray-100 
                            font-semibold border border-gray-600 p-2 space-x-2 rounded-lg whitespace-nowrap"
                    >
                        <span>Compare Now</span>
                        <svg
                            className="w-6 h-6"
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
                    </Link>
                )}
        </div>
    );
}
