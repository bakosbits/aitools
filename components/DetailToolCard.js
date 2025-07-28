import BlogLinkCard from "./BlogLinkCard";

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
 * @param {string} props.tool.articleSlug - The slug for a related blog article.
 * @param {string} props.tool.Slug - The URL slug for the tool's affiliate link.
 */

export default function DetailToolCard({ tool }) {

    const featuresText = tool.Features;
    const featuresList = featuresText
        ? featuresText.split("\n").filter((line) => line.trim() !== "")
        : [];

    const cautionsText = tool.Cautions;
    const cautionsList = cautionsText
        ? cautionsText.split("\n").filter((line) => line.trim() !== "")
        : [];

    const pricingList = Array.isArray(tool.Pricing) ? tool.Pricing : [];
    const formattedPricing =
        pricingList.length > 1
            ? pricingList.slice(0, -1).join(", ") +
              " and " +
              pricingList[pricingList.length - 1]
            : pricingList[0];

    return (
        <div className="h-full flex flex-col border border-gray-600 p-6 rounded-lg bg-cardDark">
            <div className="flex items-center space-x-4 mb-4">
                <img
                    src={tool.Logo}
                    alt={`${tool.Name} logo`}
                    title={tool.Name}   
                    className="object-contain h-16 w-16"
                />
                <h1 className="text-2xl font-bold">
                    {tool.Name}
                </h1>
            </div>
            {tool["Base_Model"] && (
                <p className="text-gray-100 mt-2 mb-4">
                    Powered by {tool["Base_Model"]}
                </p>
            )}
            <p className="mb-4">{tool.Description}</p>
            <h1 className="text-xl font-bold mb-1">
                Why it matters:
            </h1>
            <p className="mb-4">{tool.Why}</p>
            <h1 className="text-xl font-bold mb-1">
                Details:
            </h1>
            <p className="mb-4">{tool.Details}</p>
            <h1 className="text-xl font-bold mb-1">
                Top Features:
            </h1>
            <ul className="list-disc ml-6 space-y-2 mb-4">
                {featuresList.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
            <h1 className="text-xl font-bold mb-1">
                Top Cautions:
            </h1>
            <ul className="list-disc ml-6 space-y-2 mb-4">
                {cautionsList.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
            <h1 className="text-xl font-bold mb-1">
                Who's It For?
            </h1>
            <p className="mb-4">{tool.Buyer}</p>
            {pricingList.length > 0 && (
                <div>
                    <h1 className="text-xl font-bold mb-1">
                        Pricing Options:
                    </h1>
                    <p className="mb-4">{formattedPricing}</p>
                </div>
            )}
            <BlogLinkCard articleSlug={tool.articleSlug} toolName={tool.Name} />
            <div className="mt-auto text-sm ">
                <a
                    href={`/go/${tool.Slug}`}
                    className="flex items-center text-sm text-emerald-300 hover:text-emerald-400 transition mt-6 mb-2"
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
        </div>
    );
}
