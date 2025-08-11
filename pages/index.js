import { getFeaturedTools, getNewestTools } from "@/lib/airtable/tools";
import { shuffleArray } from "@/lib/indexUtils";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import MiniToolCard from "@/components/MiniToolCard";
import MetaProps from "@/components/MetaProps";
import QuickTools from "@/components/QuickTools";

const ERROR_REVALIDATE_SECONDS = 60; // Shorter revalidate on error to retry quickly

export async function getStaticProps() {
  try {
    const allFeaturedTools = await getFeaturedTools();
    const featuredTools = shuffleArray(allFeaturedTools).slice(0, 4);
    const latestTools = (await getNewestTools(8)).sort((a, b) =>
      a.Name.localeCompare(b.Name),
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
        <div className="w-full md:w-[60%] md:mt-[3%] flex justify-center">
          {/* INNER WRAPPER: 60% of left column, padded on mobile */}
          <div className="w-full md:w-[80%] justify-start text-left flex flex-col">
            <div className="block md:hidden mb-4">
              <SearchBar />
            </div>
            <h1 className="text-3xl font-bold mb-2 ">Welcome</h1>
            <p className="md:ml-2 mb-4">
              Here you&apos;ll find tools grouped by profession and/or use case. Why?
              So you don&apos;t have to fumble through feature lists to find a
              solution. We&apos;ve organized everything in a way that enables you to
              make quick, well informed choices.
            </p>
            <h2 className="text-xl font-bold mb-2">
              Discover powerful AI tools tailored to your profession or use case
            </h2>
            <p className="md:ml-2 mb-4">
              We&apos;ll show you who, what and why to help you determine which tools
              belong in your tool pouch. Leverage our side-by-side comparisons
              to narrow your search. To get started browse our
              <Link
                href="/categories"
                className="text-gray-100 hover:text-gray-300 transition"
              >
                {" "}
                categories{" "}
              </Link>
              or define your
              <Link
                href="/use-cases"
                className="text-gray-100 hover:text-gray-300 transition"
              >
                {" "}
                use case{"."}
              </Link>
            </p>
            <h2 className="text-xl font-bold mb-4 mt-4">
              A Series Of Quick Content Generation Tools:
            </h2>
            <div className="ml-2">
              <QuickTools />
            </div>
          </div>
        </div>
        {/* Right column: Search + Newest */}
        <div className="w-full md:w-[40%]">
          <div className="w-full mt-0 md:w-[80%]">
            <div className=" hidden md:block mb-8">
              <SearchBar />
            </div>
            <h2 className="text-xl font-bold mb-2">Latest Additions:</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 ml-2">
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
