import { useState } from "react";
import UseCasesModal from "@/components/UseCasesModal";

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

    const [showUseCasesModal, setShowUseCasesModal] = useState(false);

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

    return (
        <div className="h-full flex flex-col border border-gray-600 p-6 rounded-lg shadow-lg bg-cardDark">
            <div className="flex items-center space-x-4 mb-8">
                <img
                    src={tool.Logo}
                    alt={`${tool.Name} logo`}
                    title={tool.Name}
                    className="object-contain h-16 w-16 border rounded-lg border-cardDark"
                />
                <h2 className="text-2xl font-bold">{tool.Name}</h2>
            </div>
            <div className="flex justify-left w-full mb-4">
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
            <h2 className="text-xl font-bold mb-2">Who's It For?</h2>
            <p className="mx-2 mb-4">{tool.Buyer}</p>
            {pricingList.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold mb-2">Pricing Options:</h2>
                    <p className="mx-2 mb-4">{formattedPricing}</p>
                </div>
            )}
            <div className="w-ful mt-auto">
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
            {showUseCasesModal && (
                <UseCasesModal tool={tool} onClose={() => setShowUseCasesModal(false)} />
            )}
        </div>
    );
}
