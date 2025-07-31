import { getToolBySlug } from "@/lib/airtable/tools";

import DetailToolCard from "@/components/DetailToolCard";
import MetaProps from "@/components/MetaProps";

export async function getStaticPaths() {
  try {
    // We don't pre-render any comparison paths at build time.
    // They will be generated on-demand with fallback: "blocking".
    return { paths: [], fallback: "blocking" };
  } catch (error) {
    console.error("[getStaticPaths - Compare] Error:", error);
    return { paths: [], fallback: "blocking" };
  }
}

export async function getStaticProps({ params }) {
  const { slugA, slugB } = params;

  try {
    const [toolA, toolB] = await Promise.all([
      getToolBySlug(slugA),
      getToolBySlug(slugB),
    ]);

    if (!toolA || !toolB) {
      return { notFound: true };
    }

    return {
      props: { toolA, toolB },
      revalidate: 300, // Revalidate every 5 minutes
    };
  } catch (error) {
    console.error(
      `[getStaticProps - Compare] Error for slugs ${slugA}, ${slugB}:`,
      error,
    );
    return { notFound: true };
  }
}

export default function ComparePage({ toolA, toolB }) {
  if (
    !toolA ||
    !toolB ||
    !toolA.Name ||
    !toolB.Name ||
    !toolA.Slug ||
    !toolB.Slug
  ) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center text-slate-300">
        <h2 className="text-xl font-bold mb-2">Comparison Not Available</h2>
        <p>
          Sorry, one or both tools could not be loaded. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <>
      <MetaProps
        title={`Compare ${toolA.Name} Against ${toolB.Name}`}
        description={`Compare ${toolA.Name} and ${toolB.Name} across features, pricing, and ideal use cases.`}
        url={`https://aitoolpouch.com/compare/${toolA.Slug}/vs/${toolB.Slug}`}
      />
      <div className="max-w-7xl mx-auto">
        <div className="h-full flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            Comparing {toolA.Name} -to- {toolB.Name}
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[toolA, toolB].map((tool) => (
            <DetailToolCard key={tool.Slug} tool={tool} />
          ))}
        </div>
      </div>
    </>
  );
}
