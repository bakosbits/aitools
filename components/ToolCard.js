import Link from "next/link";
import BlogLinkCard from "@/components/BlogLinkCard";

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
 * @param {string} [props.tool.articleSlug] - The slug for a related blog article (optional).
 * @param {Array<object>} [props.compareList=[]] - An array of tool objects currently selected for comparison.
 * @param {function(object): void} props.toggleCompare - Function to add or remove a tool from the compare list.
 */
export default function ToolCard({ tool, compareList = [], toggleCompare }) {
  const isChecked = compareList.some((t) => t.id === tool.id);

  return (
    <Link
      href={`/tool/${tool.Slug}`}
      className="block h-full group"
      title={tool.Name}
      passHref
    >
      <div className="h-full bg-cardDark p-6 border border-gray-600 rounded-lg shadow-lg flex flex-col items-start group-hover:bg-gray-800 transition-colors">
        <div className="w-full flex items-center space-x-4">
          <img
            src={tool.Logo}
            alt={`${tool.Name} logo`}
            title={tool.Name}
            className="object-contain h-14 w-14 border rounded-lg border-cardDark"
          />
          <h2 className="text-2xl font-bold">{tool.Name}</h2>
        </div>
        {tool["Base_Model"] && (
          <p className="text-gray-300 mb-2 mt-6">
            Powered by {tool["Base_Model"]}
          </p>
        )}
        <p className="mx-2 mb-4">
          {tool.Description?.length > 100
            ? tool.Description.slice(0, 100) + "..."
            : tool.Description}
        </p>
        <h2 className="text-xl font-bold mb-1">Why it matters:</h2>
        <p className="mx-2 mb-4">
          {tool.Why?.length > 100 ? tool.Why.slice(0, 100) + "..." : tool.Why}
        </p>
        <BlogLinkCard articleSlug={tool.articleSlug} toolName={tool.Name} />
        <div className="mt-auto text-sm">
          <a
            href={`/go/${tool.Slug}`}
            className="flex items-center text-gray-100 hover:text-gray-300 transition font-medium mb-2"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-4 h-4 mr-2 fill-current" viewBox="0 0 20 20">
              <path d="M10 0 L8.6 1.4 15.2 8H0v2h15.2l-6.6 6.6L10 20l10-10z" />
            </svg>
            Visit {tool.Name}
          </a>
          <label
            className="flex items-center gap-2 cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={isChecked} // Use the derived `isChecked` state
              onChange={() => toggleCompare(tool)} // `onChange` is for input elements
            />
            <span className="text-gray-100 hover:text-gray-300 transition font-medium">
              Compare
            </span>
          </label>
        </div>
      </div>
    </Link>
  );
}
