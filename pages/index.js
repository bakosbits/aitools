import { getAllTools, getFeaturedTools } from "@/lib/shared/tools";
import { getLatestSortedTools } from "@/lib/indexUtils";
import Link from "next/link";

import SearchBar from "@/components/SearchBar";
import MiniToolCard from "@/components/MiniToolCard";
import LogoCard from "@/components/LogoCard";
import MetaProps from "@/components/MetaProps";

export async function getStaticProps() {

    try {
        const tools = await getAllTools();
        const featuredTools = await getFeaturedTools();
        const latestTools = getLatestSortedTools(tools, 8);

        return {
            props: {
                tools, // All tools are passed to SearchBar
                latestTools,
                featuredTools,
            },
            revalidate: 300, // Revalidate every 5 minutes
        };
    } catch (error) {
        console.error("[getStaticProps - Home Page] Error:", error);
        return {
            props: {
                tools: [],
                latestTools: [],
                featuredTools: [],
            },
            revalidate: 60, // Shorter revalidate on error to retry quickly
        };
    }
}

export default function Home({ tools, latestTools, featuredTools }) {

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
                        <h1 className="text-headingWhite text-3xl font-bold mb-2 ">
                            Welcome!
                        </h1>
                        <p className="text-grayText mb-8">
                            You can't help but notice the endless sea of AI
                            driven tools in the market. Did you know there are
                            +10,000 tools out there with some type of AI
                            moniker? It's no surprise that many of us struggle
                            to find something that best fits our use case.
                            You don't have to fumble through countless feature 
                            lists to find a solution. We hope you find our 
                            information to be laid out in a format that enables 
                            you to make quick, well informed choices.
                        </p>
                        <div className="flex flex-col items-left sm:items-left justify-left">
                            <div className="flex justify-between items-center mb-4">
                                <h1 className="text-headingWhite text-xl font-bold">
                                    Discover powerful AI tools tailored to your
                                    profession or use case.
                                </h1>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-left w-full lg:space-x-4 space-x-0">
                                <a
                                    href="/categories"
                                    title="Find Your Category"
                                    className="inline-flex items-left justify-center space-x-2
                                        bg-accentGreen hover:bg-headingWhite transition-colors
                                        text-backgroundDark font-semibold border border-gray-700 p-2 rounded-lg mb-4 whitespace-nowrap"
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
                                        bg-accentGreen hover:bg-headingWhite transition-colors
                                        text-backgroundDark font-semibold border border-gray-700 p-2 rounded-lg shadow-md
                                        mb-4 whitespace-nowrap"
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
                        </div>
                        <p className="text-grayText mb-4 md:mb-8">
                            We'll show you a manageable list of tools to choose
                            from. You can conduct side-by-side comparisons to help you
                            narrow down your search to something that best fits
                            your needs. We answer the who, what and why so you
                            can quickly determine which tools belong in your
                            tool pouch. To jumpstart your selection process
                            browse our
                            <Link
                                href="/categories"
                                className="text-accentGreen hover:text-headingWhite transition"
                            >
                                {" "}categories{" "}
                            </Link>
                            or define your
                            <Link
                                href="/usecases"
                                className="text-accentGreen hover:text-headingWhite transition"
                            >
                                {" "}use case{" "}
                            </Link>
                            to get started.
                        </p>
                        <div className="hidden md:block">
                            <h1 className="text-headingWhite text-3xl font-bold mb-4">
                                Hot Topics:
                            </h1>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                                {featuredTools.map((tool) => (
                                    <Link
                                        key={tool.Slug}
                                        href={`/tool/${tool.Slug}`}
                                        title={tool.Name}
                                        className="block h-full group"
                                        passHref
                                    >
                                        <LogoCard
                                            name={tool.Name}
                                            domain={tool.Domain}
                                            className="w-[180px] h-auto bg-headingWhite object-contain"
                                        />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Right column: Search + Newest */}
                <div className="w-full md:w-[40%]">
                    <div className="w-full md:w-[80%]">
                        <div className="mb-6">
                            <SearchBar tools={tools} />
                        </div>
                        <h1 className="text-headingWhite text-xl font-bold mb-4">
                            Latest Additions:
                        </h1>
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
