import Link from "next/link";
import { getAllArticles } from "@/lib/airtable/articles";
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
                    className="relative rounded-lg shadow-3xl overflow-hidden mb-8 h-[357px] flex items-center justify-left bg-cover bg-center px-2 md:px-12"
                    style={{ backgroundImage: "url('/images/blog_hero.png')" }}
                >
                    <div className="absolute inset-0 bg-gray-800 opacity-50" />
                    <h1 className="relative z-10 text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold">
                        Bit by Bit
                    </h1>
                </div>
                <ul className="space-y-6">
                    {validArticles.map((article) => (
                        <li key={article.id}>
                            <Link
                                href={`/blog/${article.Slug}`}
                                className="block bg-cardDark border border-gray-600 p-6 rounded-lg shadow-3xl hover:bg-gray-800 transition-colors"
                            >
                                <h1 className="text-xl font-semibold ">
                                    {article.Title}
                                </h1>
                                <p className="text-slate-300 text-xs mt-1">
                                    {article.Date}
                                </p>
                                {article.Summary && (
                                    <p className="text-gray-400 mt-2">
                                        {article.Summary}
                                    </p>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}
