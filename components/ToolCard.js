import Link from "next/link";
import { useState } from "react";
import UseCasesModal from "@/components/UseCasesModal";
import FeaturesModal from "@/components/FeaturesModal";
import CautionsModal from "@/components/CautionsModal";

export default function ToolCard({ tool, handleCompare, compareList = [] }) {
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
                            className="object-contain h-14 w-14 border rounded-md border-cardDark"
                        />
                        <h2 className="text-2xl font-bold">{tool.Name}</h2>
                    </div>

                    <div className="flex justify-around w-full mb-2">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowUseCasesModal(true);
                            }}
                            className="px-3 py-1 text-sm font-semibold text-gray-100 bg-teal-600 rounded-md hover:bg-teal-700"
                        >
                            Use Cases
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowFeaturesModal(true);
                            }}
                            className="px-3 py-1 text-sm font-semibold text-gray-100 bg-teal-600 rounded-md hover:bg-teal-700"
                        >
                            Features
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowCautionsModal(true);
                            }}
                            className="px-3 py-1 text-sm font-semibold text-gray-100 bg-teal-600 rounded-md hover:bg-teal-700"
                        >
                            Cautions
                        </button>
                    </div>

                    <p className="mx-2 mb-4 mt-4">
                        {tool.Description?.length > 100
                            ? tool.Description.slice(0, 100) + "..."
                            : tool.Description}
                    </p>
                    <h2 className="text-xl font-bold mb-1">Why it matters:</h2>
                    <p className="mx-2 mb-6">
                        {tool.Why?.length > 100
                            ? tool.Why.slice(0, 100) + "..."
                            : tool.Why}
                    </p>
                    <div className="w-full mt-auto">
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
                            className="px-3 py-1 text-sm font-semibold text-gray-100 bg-teal-600 rounded-md hover:bg-teal-700"
                        >
                            Visit {tool.Name}
                        </button>
                    </div>
                </div>
            </Link>
            {showFeaturesModal && (
                <FeaturesModal
                    tool={tool}
                    onClose={() => setShowFeaturesModal(false)}
                />
            )}
            {showCautionsModal && (
                <CautionsModal
                    tool={tool}
                    onClose={() => setShowCautionsModal(false)}
                />
            )}
            {showUseCasesModal && (
                <UseCasesModal
                    tool={tool}
                    onClose={() => setShowUseCasesModal(false)}
                />
            )}
        </>
    );
}
