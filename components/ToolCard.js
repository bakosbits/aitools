import Link from "next/link";
import BlogLinkCard from "@/components/BlogLinkCard";

export default function ToolCard({ tool, compareList = [], toggleCompare }) {
    const isChecked = compareList.some((t) => t.id === tool.id);

    return (
        <Link
            href={`/tool/${tool.Slug}`}
            className="block h-full group"
            title={tool.Name}
            passHref
        >
              <div className="h-full bg-cardDark p-6 rounded-lg shadow-lg flex flex-col items-start group-hover:bg-gray-800 transition-colors">
                <div className="w-full flex items-center space-x-4">
                    <img
                        src={tool.Logo}
                        alt={`${tool.Name} logo`}
                        title={tool.Name}
                        className="object-contain bg-headingWhite h-14 w-14"
                    />
                    <h1 className="text-2xl font-bold text-headingWhite">
                        {tool.Name}
                    </h1>
                </div>
                {tool["Base_Model"] && (
                    <p className="text-headingWhite mb-4 mt-6">
                        Powered by {tool["Base_Model"]}
                    </p>
                )}
                <p className=" text-grayText mb-4">
                    {tool.Description?.length > 100
                        ? tool.Description.slice(0, 100) + "..."
                        : tool.Description}
                </p>
                <h1 className="text-xl text-headingWhite font-bold">
                    Why it matters:
                </h1>
                <p className="text-grayText mb-4">
                    {tool.Why?.length > 100
                        ? tool.Why.slice(0, 100) + "..."
                        : tool.Why}
                </p>
                <BlogLinkCard articleSlug={tool.articleSlug} toolName={tool.Name} />                
                <div className="mt-auto text-sm">
                    <a
                        href={`/go/${tool.Slug}`}
                        className="flex items-center text-accentGreen hover:text-headingWhite font-medium mb-2"
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
                    <label
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <input
                            type="checkbox"
                            checked={isChecked} // Use the derived `isChecked` state
                            onChange={() => toggleCompare(tool)} // `onChange` is for input elements
                        />
                        <span className="text-accentGreen font-medium">
                            Compare
                        </span>
                    </label>
                </div>
            </div>
        </Link>
    );
}
