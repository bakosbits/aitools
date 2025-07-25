import Link from "next/link";
import MetaProps from "@/components/MetaProps";
import { getAllCategories } from "@/lib/shared/categories";

export async function getStaticProps() {
    try {
        const categories = await getAllCategories();

        if (!Array.isArray(categories) || categories.length === 0) {
            return {
                notFound: true,
            };
        }

        return {
            props: {
                categories,
            },
            revalidate: 1800,
        };
    } catch (error) {
        console.error("[getStaticProps - Categories Page] Error fetching categories:", error);
        return {
            notFound: true,
        };
    }
}

export default function CategoriesPage({ categories }) {
    return (
        <>
            <MetaProps
                title={`AI Tool Categories`}
                description={"Top AI Tools. AI tools for all professions"}
                url={`https://aitoolpouch.com/categories/`}
            />
            <div className="max-w-7xl mx-auto">
                <div className="w-full grid grid-cols-1 justify-between items-center mb-4">
                    <h1 className="text-2xl text-headingWhite font-bold mb-4">
                        Alignment By Profession | Skill | Trade | Craft
                    </h1>
                    <p className="text-grayText mb-4">
                        Each category below contains a listing of top AI tools
                        best suited for the category. This enables you to
                        quickly sharpen your focus by aligning with tools that
                        map well into your profession and/or use cases. Many AI
                        tools have similar features but implementation can help
                        or hinder your productivity.. Some are better suited for
                        your use cases than others. We've done the heavy lifting
                        for you. Once you've selected a category you can get
                        explore individual tools in detail and/or compare two
                        side-by-side to compare and contrast.
                    </p>
                </div>

                <div className=" grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    {[...categories]
                        .sort((a, b) => a.Name.localeCompare(b.Name))
                        .map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/category/${cat.Slug}`}
                                className="block border border-gray-700 p-4 rounded-lg bg-cardDark hover:bg-gray-800 transition-colors flex flex-col"
                            >
                                <h2 className="text-xl text-accentGreen hover:text-headingWhite font-bold mb-2">
                                    {cat.Name}
                                </h2>
                                <p className=" text-grayText mb-2">
                                    {cat.Description}
                                </p>
                                <div className="mt-auto">
                                    <p className="text-xs text-headingWhite">
                                        {cat.Count} tools
                                    </p>
                                </div>
                            </Link>
                        ))}
                </div>
            </div>
        </>
    );
}
