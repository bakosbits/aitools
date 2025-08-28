import { useState } from "react";
import { getToolBySlug } from "@/lib/airtable/tools";
import { getFeaturesByTool } from "@/lib/airtable/features";
import { getCautionsByTool } from "@/lib/airtable/cautions";
import DetailToolCard from "@/components/DetailToolCard";
import UseCaseCompareModal from "@/components/UseCaseCompareModal";
import MetaProps from "@/components/MetaProps";
import AnalysisModal from "@/components/AnalysisModal"; // Import the new modal component

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
        const [toolA, toolB, featuresA, featuresB, cautionsA, cautionsB] = await Promise.all([
            getToolBySlug(slugA),
            getToolBySlug(slugB),
            getFeaturesByTool(slugA),
            getFeaturesByTool(slugB),
            getCautionsByTool(slugA),
            getCautionsByTool(slugB),

        ]);

        if (!toolA || !toolB) {
            return { notFound: true };
        }

        return {
            props: { toolA, toolB, featuresA, featuresB, cautionsA, cautionsB },
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

export default function ComparePage({ toolA, toolB, featuresA, featuresB, cautionsA, cautionsB }) {
    const [showUseCaseCompareModal, setShowUseCaseCompareModal] = useState(false);
    const [showCompareAnalysisModal, setShowCompareAnalysisModal] = useState(false);
    const [analysis, setAnalysis] = useState(null); // State to store analysis data
    const [isLoading, setIsLoading] = useState(false); // State to manage loading status

    // Function to handle fetching AI analysis
    const fetchAnalysis = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/compare-analysis", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ toolA, toolB, category: "General" }), // Assuming a default category for now
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setAnalysis(data);
            setShowCompareAnalysisModal(true); // Open the modal with the fetched data
        } catch (error) {
            console.error("Failed to fetch analysis:", error);
            // Optionally, set an error state to display to the user
        } finally {
            setIsLoading(false);
        }

    };

    if (
        !toolA ||
        !toolB ||
        !toolA.Name ||
        !toolB.Name ||
        !toolA.Slug ||
        !toolB.Slug
    ) {
        return (
            <div className="max-w-2xl mx-auto py-12 text-center text-gray-300">
                <h2 className="text-xl font-bold mb-2">
                    Comparison Not Available
                </h2>
                <p>
                    Sorry, one or both tools could not be loaded. Please try
                    again later.
                </p>
            </div>
        );
    }

    return (
        <>
            <MetaProps
                title={`Compare ${toolA.Name} Against ${toolB.Name}`}
                description={`Compare ${toolA.Name} and ${toolB.Name} across features, pricing, and ideal use cases.`}
                url={`${process.env.NEXT_PUBLIC_BASE_URL ||
                    "https://aitoolpouch.com"
                    }/compare/${toolA.Slug}/vs/${toolB.Slug}`}
            />
            <div className="max-w-7xl mx-auto">
                <div className="h-full flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">
                        Comparing {toolA.Name} -to- {toolB.Name}
                    </h1>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowUseCaseCompareModal(true)}
                            className="px-3 py-1 text-sm font-semibold text-gray-100 bg-teal-600 rounded-md hover:bg-blue-600"
                        >
                            Compare Use Cases
                        </button>
                        <button
                            onClick={fetchAnalysis}
                            disabled={isLoading}
                            className={`px-3 py-1 text-sm font-semibold rounded-md ${isLoading
                                    ? "text-gray-100 bg-gray-500 cursor-not-allowed"
                                    : "text-gray-100 bg-teal-600 hover:bg-blue-600"
                                }`}
                        >
                            {isLoading ? "Loading Analysis..." : "Get AI Analysis"}
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailToolCard
                        tool={toolA}
                        features={featuresA}
                        cautions={cautionsA}
                    />
                    <DetailToolCard
                        tool={toolB}
                        features={featuresB}
                        cautions={cautionsB}
                    />
                </div>
            </div>
            {/* Modal for Use Cases */}
            {showUseCaseCompareModal && (
                <UseCaseCompareModal
                    toolA={toolA}
                    toolB={toolB}
                    onClose={() => setShowUseCaseCompareModal(false)}
                />
            )}
            {/* Modal for AI Analysis */}
            {showCompareAnalysisModal && (
                <AnalysisModal
                    isOpen={showCompareAnalysisModal}
                    onClose={() => setShowCompareAnalysisModal(false)}
                    analysisData={analysis}
                />
            )}
        </>
    );
}
