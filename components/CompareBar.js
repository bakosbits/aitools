import Link from "next/link";

export default function CompareBar({ compareList = [], toggleCompare }) {

    if (compareList.length === 0) {
        return null;
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-backgroundDark border-b border-accentGreen p-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-4 flex-wrap">
                <span className="text-whiteHeading font-bold">Comparing:</span>
                {compareList.map(
                    (tool) => (
                        <div
                            key={tool.id}
                            className="bg-gray-800 px-3 py-1 rounded-lg flex items-center gap-2"
                        >
                            <span>{tool.Name}</span>
                            <button
                                onClick={() => {
                                    toggleCompare(tool);
                                }}
                                className="text-red-400 hover:text-red-200"
                            >
                                ✖
                            </button>
                        </div>

                    ),
                )}
            </div>
            {compareList.length === 2 &&
                compareList[0].Slug &&
                compareList[1].Slug &&
                (
                    <Link
                        href={`/compare/${compareList[0].Slug}/vs/${compareList[1].Slug}`}
                        className="inline-flex items-left justify-center space-x-2 flex-nowrap
                            bg-accentGreen hover:bg-headingWhite transition-colors
                            text-backgroundDark font-semibold border border-gray-700 p-1 space-x-2 rounded-lg whitespace-nowrap"
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
                )
            }
        </div>
    );
}
