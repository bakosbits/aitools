import Link from "next/link";
import BlogLinkCard from "./BlogLinkCard";


/**
 * Renders a compact, clickable card for an AI tool.
 * The entire card acts as a link to the tool's detailed page.
 * It displays the tool's logo, name, and a truncated "Why it matters" description.
 * It also renders a `BlogLinkCard` component below the main card content.
 * @param {object} props - The component props.
 * @param {object} props.tool - The tool object containing summary details.
 * @param {string} props.tool.Slug - The URL slug for the tool's detail page.
 * @param {string} props.tool.Name - The name of the tool.
 * @param {string} props.tool.Logo - The URL for the tool's logo.
 * @param {string} props.tool.Why - A brief explanation of the tool's importance.
 * @param {string} props.tool.articleSlug - The slug for a related blog article, passed to BlogLinkCard (optional).
 */
export default function MiniToolCard({ tool }) {


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
            className="object-contain h-12 w-12 border rounded-lg border-cardDark"
          />
          <h2 className="text-lg font-bold">{tool.Name}</h2>
        </div>
        <p className="text-sm text-gray-400 mt-4 mb-auto">
          {tool.Why?.length > 100 ? tool.Why.slice(0, 100) + "..." : tool.Why}
        </p>
        <div className="w-full">
          <BlogLinkCard articleSlug={tool.articleSlug} toolName={tool.Name} />
        </div>
      </div>
    </Link>
  );
}
