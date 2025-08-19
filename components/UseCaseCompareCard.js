import Link from "next/link";
import BlogLinkCard from "@/components/BlogLinkCard";
import { useState, useEffect } from "react";

/**
 * Renders a card for a single AI tool with interactive elements.
 * The card displays summary information like the tool's name, logo, description, and "Why it matters".
 * The entire card links to the tool's detailed page. It also contains separate interactive
 * elements for visiting the tool's external website and for adding/removing the tool
 * from a comparison list, which stop the main link navigation.
 * @param {object} props - The component props.
 * @param {object} props.tool - The tool object containing its details.
 * @param {string} props.tool.id - A unique identifier for the tool.
 * @param {string} props.tool.Slug - The URL slug for the tool's detail page.
 * @param {string} props.tool.Name - The name of the tool.
 * @param {string} props.tool.Logo - The URL for the tool's logo.
 * @param {string} [props.tool.Base_Model] - The base model the tool is powered by.
 * @param {string} [props.tool.Description] - A short description of the tool.
 * @param {string} [props.tool.Why] - A brief explanation of the tool's importance.
 * @param {Array<object>} [props.compareList=[]] - An array of tool objects currently selected for comparison.
 * @param {function(object): void} props.toggleCompare - Function to add or remove a tool from the compare list.
 */
export default function ToolCard({
    tool,
    useCases,
    compareList = [],
    toggleCompare,
}) {
    const isChecked = compareList.some((t) => t.id === tool.id);

    const [showModal, setShowModal] = useState(false);
    const [useCasesData, setUseCasesData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    return (
        <>
            {" "}
            {/* Use a React Fragment to return multiple top-level elements */}
            <div className="h-full bg-cardDark p-6 border border-gray-600 rounded-lg shadow-lg flex flex-col items-start group-hover:bg-gray-800 transition-colors">
                <div className="w-full flex items-center mb-6 space-x-4">
                    <img
                        src={tool.Logo}
                        alt={`${tool.Name} logo`}
                        title={tool.Name}
                        className="object-contain h-14 w-14 border rounded-lg border-cardDark"
                    />
                    <h2 className="text-2xl font-bold">{tool.Name}</h2>
                </div>
                <h2 className="text-xl font-bold mb-2">Use Cases:</h2>
                <ul className="list-disc ml-6 space-y-2 mb-4">
                    {useCases.map((uc) => (
                        <li key={uc.id}>{uc.UseCase}</li>
                    ))}
                </ul>
                <div className="mt-auto text-sm flex justify-between items-center w-full">
                    <div className="flex flex-col">
                        <a
                            href={`/go/${tool.Slug}`}
                            className="flex items-center text-gray-100 hover:underline transition font-medium mb-2"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <svg
                                className="w-4 h-4 mr-2 fill-current"
                                viewBox="0 0 20 20"
                            >
                                <path d="M10 0 L8.6 1.4 15.2 8H0v2h15.2l-6.6 6.6L10 20l10-10z" />
                            </svg>
                            Visit {tool.Name}
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
