import React from "react";
import MetaProps from "@/components/MetaProps";
import InfoPageLayout from "@/components/InfoPageLayout";

export default function TermsOfUsePage() {
  return (
    <>
      <MetaProps
        title={`Terms - AI Tool Pouch`}
        description={`Terms And Conditions Of Use`}
        url={`https://aitoolpouch.com/terms/`}
      />
      <InfoPageLayout
        title="Terms of Use"
        imageSrc="/images/pouch-04.jpg"
        imageAlt="A tool bag, representing terms of use"
      >
        <p className=" text-gray-100 mb-4">
          By using this website, you agree to the following terms and
          conditions.
        </p>
        <h2 className="text-xl font-semibold mb-2">Content Accuracy</h2>
        <p className="mb-4 ml-2">
          We strive to provide accurate and timely information, but we make no
          guarantees regarding completeness, correctness, or availability of any
          listings or data on this site.
        </p>
        <h2 className="text-xl font-semibold mb-2">Use of Site</h2>
        <p className="mb-4 ml-2">
          You agree to use this website for lawful purposes only. You may not
          attempt to gain unauthorized access to any part of the site or use our
          data for malicious purposes.
        </p>
        <h2 className="text-xl font-semibold mb-2">Affiliate Disclosure</h2>
        <p className="mb-4 ml-2">
          Some links on this site may be affiliate links. If you click and make
          a purchase, we may earn a commission at no additional cost to you.
        </p>
        <h2 className="text-xl font-semibold mb-2">Limitation of Liability</h2>
        <p className="mb-4 ml-2">
          We are not liable for any direct or indirect damages resulting from
          the use of this site or any tools or services listed on it.
        </p>
        <h2 className="text-xl font-semibold mb-2">Changes to These Terms</h2>
        <p className="mb-4 ml-2">
          We reserve the right to update these terms at any time. Continued use
          of the site after changes are posted constitutes acceptance of those
          changes.
        </p>
      </InfoPageLayout>
    </>
  );
}
