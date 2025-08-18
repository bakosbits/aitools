import Link from "next/link";

/**
 * Renders a card for an AI tool on the "Use Cases" page.
 * The card displays the tool's logo, name, and a truncated "Why it matters" description.
 * The entire card links to the tool's detail page. It also includes a checkbox
 * to add or remove the tool from a comparison list.
 * @param {object} props - The component props.
 * @param {object} props.tool - The tool object containing its details.
 * @param {string} props.tool.id - A unique identifier for the tool.
 * @param {string} props.tool.Slug - The URL slug for the tool's detail page.
 * @param {string} props.tool.Name - The name of the tool.
 * @param {string} props.tool.Logo - The URL for the tool's logo.
 * @param {string} [props.tool.Why] - A brief explanation of the tool's importance.
 * @param {Array<object>} [props.compareList=[]] - An array of tool objects currently selected for comparison.
 * @param {function(object): void} props.toggleCompare - Function to add or remove a tool from the compare list.
 */
export default function UseCaseCard({ tool, compareList = [], toggleCompare }) {
    const isChecked = compareList.some((t) => t.id === tool.id);

    return (
        <Link
            href={`/tool/${tool.Slug}`}
            className="block h-full group"
            title={tool.Name}
            passHref
        >
            <div className="h-full bg-cardDark p-4 border border-gray-600 rounded-lg shadow-lg flex flex-col items-start group-hover:bg-gray-800 transition-colors">
                <div className="w-full flex items-center space-x-4">
                    <img
                        src={tool.Logo}
                        alt={`${tool.Name} logo`}
                        title={tool.Name}
                        className="object-contain h-12 w-12 border rounded-xl border-cardDark"
                    />
                    <h2 className="text-lg font-bold">{tool.Name}</h2>
                </div>
                <p className="text-sm mx-2 mb-4 mt-4">
                    {tool.Why?.length > 100
                        ? tool.Why.slice(0, 100) + "..."
                        : tool.Why}
                </p>
                <label
                    className="flex items-center gap-2 cursor-pointer mt-auto"
                    // Important: `e.stopPropagation()` prevents the click from bubbling up to the parent <Link>
                    onClick={(e) => e.stopPropagation()}
                >
                    <input
                        type="checkbox"
                        checked={isChecked} // Use the derived `isChecked` state
                        onChange={() => toggleCompare(tool)} // `onChange` is for input elements
                    />
                    <span className="text-gray-300 hover:text-gray-400 transition font-medium">
                        Compare
                    </span>
                </label>
            </div>
        </Link>
    );
}
