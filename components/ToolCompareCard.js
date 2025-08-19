import Link from "next/link";
import { useState } from "react";
import UseCasesModal from "./UseCasesModal";
import FeaturesModal from "./FeaturesModal";
import CautionsModal from "./CautionsModal";

export default function ToolCard({ tool, handleCompare, compareList = [] }) {
    const isChecked = compareList.some((t) => t.id === tool.id);

    const [showUseCasesModal, setShowUseCasesModal] = useState(false);
    const [showFeaturesModal, setShowFeaturesModal] = useState(false);
    const [showCautionsModal, setShowCautionsModal] = useState(false);

    return (
        <>
            <Link
                href={`/tool/${tool.Slug}`}
                className="block h-full group"
                title={tool.Name}
                passHref
            >
                <div className="h-full bg-cardDark p-6 border border-gray-600 rounded-lg shadow-lg flex flex-col items-start group-hover:bg-gray-800 transition-colors">
                    <div className="w-full flex items-center space-x-4 mb-8">
                        <img
                            src={tool.Logo}
                            alt={`${tool.Name} logo`}
                            title={tool.Name}
                            className="object-contain h-14 w-14 border rounded-lg border-cardDark"
                        />
                        <h2 className="text-2xl font-bold">{tool.Name}</h2>
                    </div>

                                         <div className="flex justify-around w-full mb-2">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowFeaturesModal(true);
                                }}
                                className="px-3 py-1 text-sm font-medium text-gray-100 bg-teal-600 rounded-md hover:bg-teal-700"
                            >
                                Features
                            </button>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowCautionsModal(true);
                                }}
                                className="px-3 py-1 text-sm font-medium text-gray-100 bg-teal-600 rounded-md hover:bg-teal-700"
                            >
                                Cautions
                            </button>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowUseCasesModal(true);
                                }}
                                className="px-3 py-1 text-sm font-medium text-gray-100 bg-teal-600 rounded-md hover:bg-teal-700"
                            >
                                Use Cases
                            </button>
                        </div>

                    <p className="mx-2 mb-4 mt-4">
                        {tool.Description?.length > 100
                            ? tool.Description.slice(0, 100) + "..."
                            : tool.Description}
                    </p>
                    <h2 className="text-xl font-bold mb-1">Why it matters:</h2>
                    <p className="mx-2 mb-6">
                        {tool.Why?.length > 100 ? tool.Why.slice(0, 100) + "..." : tool.Why}
                    </p>

                    <div className="mt-auto w-full">

                        <div className="flex justify-between items-center w-full">
                            <div className="flex flex-col">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        window.open(
                                            `/go/${tool.Slug}`,
                                            "_blank",
                                            "noopener,noreferrer",
                                        );
                                    }}
                                    className="flex items-center text-gray-100 hover:underline transition font-medium mb-2 text-left"
                                >
                                    <svg
                                        className="w-4 h-4 mr-2 fill-current"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M10 0 L8.6 1.4 15.2 8H0v2h15.2l-6.6 6.6L10 20l10-10z" />
                                    </svg>
                                    Visit {tool.Name}
                                </button>
                                <label
                                    className="flex items-center gap-2 cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => handleCompare(tool)}
                                    />
                                    <span className="text-gray-100 hover:underline transition font-medium">
                                        Compare
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>

            {showFeaturesModal && (
                <FeaturesModal tool={tool} onClose={() => setShowFeaturesModal(false)} />
            )}
            {showCautionsModal && (
                <CautionsModal tool={tool} onClose={() => setShowCautionsModal(false)} />
            )}
            {showUseCasesModal && (
                <UseCasesModal tool={tool} onClose={() => setShowUseCasesModal(false)} />
            )}
        </>
    );
}