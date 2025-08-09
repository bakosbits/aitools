import { getFeaturedTools, getNewestTools } from "@/lib/airtable/tools";
import { shuffleArray } from "@/lib/indexUtils";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import MiniToolCard from "@/components/MiniToolCard";
import MetaProps from "@/components/MetaProps";

const ERROR_REVALIDATE_SECONDS = 60; // Shorter revalidate on error to retry quickly

export async function getStaticProps() {
    try {
        const allFeaturedTools = await getFeaturedTools();
        const featuredTools = shuffleArray(allFeaturedTools).slice(0, 4);
        const latestTools = (await getNewestTools(8)).sort((a, b) =>
            a.Name.localeCompare(b.Name)
        );


        return {
            props: {
                featuredTools,
                latestTools,
            },
            revalidate: 300, // Revalidate every 5 minutes
        };
    } catch (error) {
        console.error("[getStaticProps - Home Page] Error:", error, error?.stack);
        return {
            props: {
                latestTools: [],
                featuredTools: [],
            },
            revalidate: ERROR_REVALIDATE_SECONDS,
        };
    }
}


export default function Home({ latestTools, featuredTools }) {
    return (
        <>
            <MetaProps
                title={`AI Tool Pouch`}
                Description={
                    "Discover top AI tools for professionals and creators. Filter by role, compare features, and find the tools that fit your workflow"
                }
                url={`https://aitoolpouch.com/`}
            />
            {/* OUTER WRAPPER: 90% of screen width, centered */}
            <div className="w-full w-[90%] mx-auto flex flex-col md:flex-row gap-8">
                {/* LEFT COLUMN: 60% of outer container */}
                <div className="w-full md:w-[60%] mt-[0%] md:mt-[5%] flex justify-center">
                    {/* INNER WRAPPER: 60% of left column, padded on mobile */}
                    <div className="w-full md:w-[80%] justify-start text-left flex flex-col">
                        <h1 className="text-3xl font-bold mb-2 ">Welcome!</h1>
                        <p className="text-gray-400 mb-10">
                            Here you'll find tools grouped by profession and/or use case. Why?
                            So you don't have to fumble through feature lists to find a
                            solution. We've organized everything in a way that enables you to
                            make quick, well informed choices.
                        </p>
                        <div className="flex flex-col items-left sm:items-left justify-left">
                            <div className="flex flex-col lg:flex-row justify-left w-full lg:space-x-4 space-x-0 mb-6">
                                <a
                                    href="/categories"
                                    title="Find Your Category"
                                    className="inline-flex items-left justify-center space-x-2
                                        bg-teal-600 hover:bg-teal-700 transition-colors
                                        text-slate-100 font-semibold p-2 rounded-lg mb-4 whitespace-nowrap"
                                >
                                    <span>Find Your Category</span>
                                    <svg
                                        className="w-6 h-6"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10.293 15.707a1 1 0 010-1.414L13.586 11H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </a>
                                <a
                                    href="/use-cases"
                                    title="Define Your Use Case"
                                    className="inline-flex items-left justify-center space-x-2
                                        bg-teal-600 hover:bg-teal-700 transition-colors
                                        text-slate-100 font-semibold p-2 rounded-lg mb-4 whitespace-nowrap"
                                >
                                    <span>Define Your Use Case</span>
                                    <svg
                                        className="w-6 h-6 space-x-4"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10.293 15.707a1 1 0 010-1.414L13.586 11H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </a>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <h1 className="text-xl font-bold">
                                    Discover powerful AI tools tailored to your profession or use
                                    case.
                                </h1>
                            </div>
                        </div>
                        <p className="text-gray-400 md:mb-2 lg:mb-8">
                            We'll tell you who, what and why to help you determine which tools
                            belong in your tool pouch. Leverage our side-by-side comparisons
                            to narrow your search. To get started browse our
                            <Link
                                href="/categories"
                                className="text-slate-100 hover:text-slate-300 transition"
                            >
                                {" "}
                                categories{" "}
                            </Link>
                            or define your
                            <Link
                                href="/use-cases"
                                className="text-slate-100 hover:text-slate-300 transition"
                            >
                                {" "}
                                use case{"."}
                            </Link>
                        </p>
                        <div className="mt-8 mb-2">
                            <h1 className="text-3xl font-bold mb-4">Hot Topics:</h1>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 ">
                                {featuredTools.map((tool) => (
                                    <Link
                                        key={tool.Slug}
                                        href={`/tool/${tool.Slug}`}
                                        title={tool.Name}
                                        className="block h-full group "
                                        passHref
                                    >
                                        <img
                                            src={tool.Logo}
                                            alt={`${tool.Name} logo`}
                                            title={tool.Name}
                                            className="w-[200px] h-auto object-contain border rounded-3xl border-gray-800"
                                        />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Right column: Search + Newest */}
                <div className="w-full md:w-[40%]">
                    <div className="w-full mt-0 md:w-[80%]">
                        <div className=" hidden md:block mb-8">
                            <SearchBar />
                        </div>
                        <h1 className="text-xl font-bold mb-4">Latest Additions:</h1>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {latestTools.map((tool) => (
                                <MiniToolCard key={tool.Slug} tool={tool} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
