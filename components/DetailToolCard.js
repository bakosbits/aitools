import BlogLinkCard from "./BlogLinkCard";
import Image from "next/image";
import { useState, useEffect } from "react";

/**
 * Renders a detailed card for a single AI tool.
 * This component displays comprehensive information about the tool,
 * including its logo, description, features, cautions, pricing, and relevant links.
 * It also handles the formatting of list-based data like features and cautions from raw text.
 * @param {object} props - The component props.
 * @param {object} props.tool - The tool object containing all its details.
 * @param {string} props.tool.Name - The name of the tool.
 * @param {string} props.tool.Logo - The URL for the tool's logo.
 * @param {string} props.tool.Description - A short description of the tool.
 * @param {string} [props.tool.Base_Model] - The base model the tool is powered by (optional).
 * @param {string} props.tool.Why - The reason why the tool is important.
 * @param {string} props.tool.Details - Further details about the tool.
 * @param {string} props.tool.Features - A newline-separated string of the tool's top features.
 * @param {string} props.tool.Cautions - A newline-separated string of the tool's top cautions.
 * @param {string} props.tool.Buyer - A description of the target audience for the tool.
 * @param {Array<string>} [props.tool.Pricing] - An array of pricing options (optional).
 * @param {string} props.tool.Slug - The URL slug for the tool's affiliate link.
 */

export default function DetailToolCard({ tool }) {
    const [showModal, setShowModal] = useState(false);
    const [useCasesData, setUseCasesData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const featuresText = tool.Features;
    const featuresList = featuresText
        ? featuresText.split("\n").filter((line) => line.trim() !== "")
        : [];

    const cautionsText = tool.Cautions;
    const cautionsList = cautionsText
        ? cautionsText.split("\n").filter((line) => line.trim() !== "")
        : [];

    const pricingList = Array.isArray(tool.Pricing) ? tool.Pricing : [];
    // Use the modern Intl.ListFormat for cleaner, internationally-friendly list formatting.
    const formattedPricing = new Intl.ListFormat("en", {
        style: "long",
        type: "conjunction",
    }).format(pricingList);

    const handleViewUseCases = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/tool/${tool.Slug}/use-cases`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setUseCasesData(data);
            setShowModal(true);
        } catch (e) {
            console.error("Failed to fetch use cases:", e);
            setError("Failed to load use cases. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setUseCasesData(null); // Clear data when closing
        setError(null);
    };

    return (
        <div className="h-full flex flex-col border border-gray-600 p-6 rounded-lg shadow-lg bg-cardDark">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                    <img
                        src={tool.Logo}
                        alt={`${tool.Name} logo`}
                        title={tool.Name}
                        className="object-contain h-16 w-16 border rounded-lg border-cardDark"
                    />
                    <h2 className="text-2xl font-bold">{tool.Name}</h2>
                </div>
                <button
                    onClick={handleViewUseCases}
                    className="px-3 py-1 text-sm font-medium text-gray-100 bg-teal-600 rounded-md hover:bg-teal-700"
                >
                    View Use Cases
                </button>
            </div>
            {tool["Base_Model"] && (
                <p className="text-gray-300 mt-2 mb-4">
                    Powered by {tool["Base_Model"]}
                </p>
            )}
            <p className="mx-2 mb-4">{tool.Description}</p>
            <h2 className="text-xl font-bold mb-2">Why it matters:</h2>
            <p className="mx-2 mb-4">{tool.Why}</p>
            <h2 className="text-xl font-bold mb-2">Details:</h2>
            <p className="mx-2 mb-4">{tool.Details}</p>
            <h2 className="text-xl font-bold mb-2">Top Features:</h2>
            <ul className="list-disc ml-6 space-y-2 mb-4">
                {featuresList.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
            <h2 className="text-xl font-bold mb-2">Top Cautions:</h2>
            <ul className="list-disc ml-6 space-y-2 mb-4">
                {cautionsList.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
            <h2 className="text-xl font-bold mb-2">Who&apos;s It For?</h2>
            <p className="mx-2 mb-4">{tool.Buyer}</p>
            {pricingList.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold mb-2">Pricing Options:</h2>
                    <p className="mx-2 mb-4">{formattedPricing}</p>
                </div>
            )}
            <div className="mt-auto text-sm ">
                <a
                    href={`/go/${tool.Slug}`}
                    className="flex items-center text-sm text-gray-100 hover:underline transition mt-6 mb-2"
                    target="_blank"
                    rel="noopener noreferrer"
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

            {/* Modal for Use Cases */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-cardDark p-6 rounded-lg shadow-lg max-w-md w-full relative">
                        <button
                            onClick={closeModal}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-200 text-xl"
                        >
                            &times;
                        </button>
                        <h3 className="text-xl font-bold mb-4">
                            Use Cases for {tool.Name}
                        </h3>
                        {isLoading && <p>Loading use cases...</p>}
                        {error && <p className="text-red-400">{error}</p>}
                        {useCasesData && useCasesData.length > 0 ? (
                            <ul className="list-disc ml-6 space-y-2">
                                {useCasesData.map((uc, index) => (
                                    <li key={index}>{uc.UseCase}</li>
                                ))}
                            </ul>
                        ) : (
                            !isLoading &&
                            !error && <p>No use cases found for this tool.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
