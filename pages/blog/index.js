import Link from "next/link";
import { getAllArticles } from "@/lib/shared/articles";
import MetaProps from "@/components/MetaProps";

export async function getStaticProps() {
    const articles = await getAllArticles();
    return {
        props: {
            articles,
        },
        revalidate: 3000,
    };
}

export default function BlogIndex({ articles }) {
    const validArticles = articles.filter((a) => a?.Slug);

    return (
        <>
            <MetaProps
                title={"Insights & Comparisons | AI Tool Pouch Blog"}
                description={
                    "Explore detailed AI tool comparisons, productivity tips, and insights for professionals using the latest AI technologies."
                }
                url={`https://aitoolpouch.com/blog/`}
            />
            <div className="w-full max-w-4xl mx-auto">
                <div
                    className="relative rounded-lg shadow-3xl shadow-[0_6px_16px_rgba(0,255,128,0.25)] overflow-hidden mb-8 h-[357px] flex items-center justify-left bg-cover bg-center px-2 md:px-12"
                    style={{ backgroundImage: "url('/images/blog_hero.png')" }}
                >
                    <div className="absolute inset-0 bg-backgroundDark opacity-50" />
                    <h1 className="relative z-10 text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-headingWhite">
                        Bit by Bit
                    </h1>
                </div>
                <ul className="space-y-6">
                    {validArticles.map((article) => (
                        <li
                            key={article.id}
                            className="border border-gray-700 p-6 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            <Link href={`/blog/${article.Slug}`}>
                                <h1 className="text-xl font-semibold text-accentGreen hover:underline">
                                    {article.Title}
                                </h1>
                            </Link>
                            <p className="text-gray-400 text-xs mt-1">
                                {article.Date}
                            </p>
                            {article.Summary && (
                                <p className="text-grayText mt-2">
                                    {article.Summary}
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}
