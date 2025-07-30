import React from "react";
import MetaProps from "@/components/MetaProps";
import InfoPageLayout from "@/components/InfoPageLayout";

export default function PrivacyPolicyPage() {
    return (
        <>
            <MetaProps
                title={`Privacy - AI Tool Pouch`}
                description={`Privacy Policy`}
                url={`https://aitoolpouch.com/privacy/`}
            />
            <InfoPageLayout
                title="Privacy Policy"
                imageSrc="/images/pouch03.jpg"
                imageAlt="A pouch with AI-themed tools, representing data privacy"
            >
                <p className="mb-6 text-gray-400">
                    This Privacy Policy explains how AI Tool Pouch collects,
                    uses, and protects your information when you use our
                    website.
                </p>
                <h2 className="text-xl font-semibold mb-1">
                    Information We Collect
                </h2>
                <p className="mb-4 text-gray-400">
                    We do not collect personal information unless you explicitly
                    provide it (e.g., via contact forms). We use basic analytics
                    tools (such as Plausible) to understand aggregate site
                    usage.
                </p>
                <h2 className="text-xl font-semibold mb-1">
                    How We Use Your Information
                </h2>
                <p className="mb-4 text-gray-400">
                    We use non-personal data to improve website performance,
                    content relevance, and user experience.
                </p>
                <h2 className="text-xl font-semibold mb-1">
                    Third-Party Links
                </h2>
                <p className="mb-4 text-gray-400">
                    Our site contains links to external websites, some of which
                    are affiliate partners. We are not responsible for the
                    privacy practices or content of those sites.
                </p>
                <h2 className="text-xl font-semibold mb-1">
                    Your Rights
                </h2>
                <p className="mb-4 text-gray-400">
                    You may request to access, correct, or delete any personal
                    information you've provided. Contact us at via the form
                    listed on our Contact page.
                </p>
                <h2 className="text-xl font-semibold mb-1">
                    Updates
                </h2>
                <p className="mb-4 text-gray-400">
                    We may update this Privacy Policy periodically. Changes will
                    be posted on this page with an updated revision date.
                </p>
            </InfoPageLayout>
        </>
    );
}
