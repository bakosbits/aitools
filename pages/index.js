import { getNewestTools } from "@/lib/airtable/tools";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import MiniToolCard from "@/components/MiniToolCard";
import MetaProps from "@/components/MetaProps";
import QuickTools from "@/components/QuickTools";

const ERROR_REVALIDATE_SECONDS = 60; // Shorter revalidate on error to retry quickly

export async function getStaticProps() {
    try {
        const latestTools = (await getNewestTools(8)).sort((a, b) =>
            a.Name.localeCompare(b.Name),
        );

        return {
            props: {
                latestTools,
            },
            revalidate: 300, // Revalidate every 5 minutes
        };
    } catch (error) {
        console.error(
            "[getStaticProps - Home Page] Error:",
            error,
            error?.stack,
        );
        return {
            props: {
                latestTools: [],
            },
            revalidate: ERROR_REVALIDATE_SECONDS,
        };
    }
}

export default function Home({ latestTools }) {
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
            <div className="w-full md:w-[85%] mx-auto grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-8">
                <div className="w-full md:max-w-[85%] justify-left text-left flex flex-col md:mt-[5%]">
                    {/* Changed md:w-[85%] to md:max-w-[85%] and added md:ml-0 for left alignment */}
                    <div className="block md:hidden mb-8 mt-4">
                        <SearchBar />
                    </div>
                    <h1 className="text-3xl font-bold mb-2 ">
                        Welcome
                    </h1>
                    <p className="md:ml-2 mb-4">
                        Here you&apos;ll find tools grouped by profession and/or
                        use case. Why? So you don&apos;t have to fumble through
                        feature lists to find a solution. We&apos;ve organized
                        everything in a way that enables you to make quick, well
                        informed choices.
                    </p>
                    <h2 className="text-2xl font-bold mb-2">
                        Discover powerful AI tools tailored to your profession
                        or use case
                    </h2>
                    <p className="md:ml-2 mb-4">
                        We&apos;ll show you who, what and why to help you
                        determine which tools belong in your tool pouch.
                        Leverage our side-by-side comparisons to narrow your
                        search. To get started browse our
                        <Link
                            href="/categories"
                            className="text-gray-100 hover:underline transition"
                        >
                            {" "}
                            categories{" "}
                        </Link>
                        or define your
                        <Link
                            href="/use-cases"
                            className="text-gray-100 hover:underline transition"
                        >
                            {" "}
                            use case{"."}
                        </Link>
                    </p>
                    <h2 className="text-2xl font-bold mb-4 mt-4">
                        Content Generation Tools
                    </h2>
                    <QuickTools />
                </div>
                {/* Right column */}
                <div className="w-full">
                    {" "}
                    {/* Removed md:w-[100%] */}
                    <div className=" hidden md:block mb-8">
                        <SearchBar />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">
                        Latest Additions
                    </h2>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {latestTools.map((tool) => (
                            <MiniToolCard key={tool.Slug} tool={tool} />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
