import React from "react";
import MetaProps from "@/components/MetaProps";
import InfoPageLayout from "@/components/InfoPageLayout";

export default function AboutPage() {
    return (
        <>
            <MetaProps
                title={`About Us`}
                description={
                    "Find the best AI tools for you, group and compare side-by-side"
                }
                url={`https://aitoolpouch.com/about/`}
            />
            <InfoPageLayout
                title="About AI Tool Pouch"
                imageSrc="/images/pouch-01.jpg"
                imageAlt="A tool bag, representing About Us"
            >
                <h2 className="text-2xl font-semibold mt-4 mb-4">
                    Our Mission & Vision
                </h2>
                <p className="mb-4 ml-2 text-gray-400">
                    In a rapidly evolving landscape of artificial intelligence,
                    finding valuable and relevant tools for your profession can
                    be overwhelming. We intend to cut through the noise,
                    providing a focused and reliable resource that empowers
                    professionals to leverage AI effectively in their daily
                    tasks. It won&apos;t be too far off into the future where
                    every individual and business is looking to integrate AI to
                    their daily routine. We want to help you avoid the paradox
                    of choice.
                </p>
                <h2 className="text-2xl font-semibold mb-2">How We Curate</h2>
                <p className="mb-4 ml-2 text-gray-400">
                    Our process is straightforward. We tear into each tool by
                    assessing its core functionality, unique features, target
                    audience, and real-world benefits. Our goal is to provide
                    insights that help you understand what the tool is, who
                    it&apos;s for, and why it matters to someone in that role.
                    We prioritize tools that offer clear value and solve
                    specific problems, ensuring our directory remains a
                    high-quality resource.
                </p>
                <h2 className="text-2xl font-semibold mb-2">Why Trust Us?</h2>
                <p className="mb-2 ml-2 text-gray-400">
                    All tools are independently researched and categorized by
                    us. The reviews and classifications are based on evaluation,
                    not paid placements. While listings may contain affiliate
                    links, these relationships do not influence our assessment
                    or inclusion criteria; they simply help support the
                    operational costs of maintaining and improving this valuable
                    resource at no additional cost to you. Our commitment is
                    always to transparency and unbiased information.
                </p>
                <p className="mb-4 ml-2 text-gray-400">
                    We’re building a smarter, more practical way to explore the
                    AI landscape.
                </p>
                <h2 className="text-2xl font-semibold mb-2">Our Future</h2>
                <p className="mb-4 ml-2 text-gray-400">
                    As the world of AI continues to evolve, so too will AI Tool
                    Pouch. We will continue to add new tools, refine our
                    categories, and work to make our platform simple and
                    affective so you&apos;re able to integrate AI into your
                    professional life quickly.
                </p>
            </InfoPageLayout>
        </>
    );
}
