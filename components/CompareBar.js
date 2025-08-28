import Link from "next/link";

/**
 * Renders a comparison bar at the top of the page when items are selected for comparison.
 * It displays the list of items being compared, allows removing items from the list,
 * and shows a "Compare Now" button to navigate to the comparison page when exactly two items are selected.
 * @param {object} props - The component props.
 * @param {Array<object>} props.compareList - An array of tool objects currently selected for comparison.
 * @param {function(object): void} props.toggleCompare - Function to add or remove a tool from the compare list.
 */
export default function CompareBar({ compareList = [], handleCompare }) {
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
                                handleCompare(tool);
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
                            bg-teal-600 hover:bg-blue-600 transition-colors text-gray-100 
                            font-semibold border border-gray-600 p-2 space-x-2 rounded-md"
                    >
                        <span>Compare</span>
                    </Link>
                )}
        </div>
    );
}
