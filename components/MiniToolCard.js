import Link from "next/link";
import BlogLinkCard from "./BlogLinkCard";

export default function MiniToolCard({ tool }) {

    return (
        <Link
            href={`/tool/${tool.Slug}`}
            className="block h-full group"
            title={tool.Name}
            passHref
        >
            <div className="h-full bg-cardDark p-4 rounded-lg shadow-lg flex flex-col items-start group-hover:bg-gray-800 transition-colors">
                <div className="w-full flex items-center space-x-4">
                    <img
                        src={tool.Logo}
                        alt={`${tool.Name} logo`}
                        title={tool.Name}
                        className="object-contain bg-headingWhite h-10 w-10"
                    />
                    <h1 className="text-lg font-bold text-headingWhite">
                        {tool.Name}
                    </h1>
                </div>
                <p className="text-sm text-whiteText mt-4">
                    {tool.Why?.length > 100
                        ? tool.Why.slice(0, 100) + "..."
                        : tool.Why}
                </p>
            </div>
            <BlogLinkCard articleSlug={tool.articleSlug} toolName={tool.Name} />
        </Link>
    );
}
