import Link from "next/link";
import LogoCard from "@/components/LogoCard";
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
                    <LogoCard
                        name={tool.Name}
                        domain={tool.Domain}
                        title={tool.Name}
                        className="object-contain h-10 w-10 mb-4"
                    />
                    <h1 className="text-lg font-bold text-headingWhite mb-4">
                        {tool.Name}
                    </h1>
                </div>
                <p className="text-sm text-whiteText">
                    {tool.Why?.length > 100
                        ? tool.Why.slice(0, 100) + "..."
                        : tool.Why}
                </p>
            </div>
            <BlogLinkCard articleSlug={tool.articleSlug} toolName={tool.Name} />
        </Link>
    );
}
