import Link from "next/link";
import React from "react";

/**
 * Renders a card with a link to a related blog post for a tool.
 *
 * @param {object} props - The component props.
 * @param {string} props.articleSlug - The slug of the related blog article.
 * @param {string} props.toolName - The name of the tool, used in the link text.
 */
export default function BlogLinkCard({ articleSlug, toolName }) {
  if (!articleSlug) {
    return null; // Don't render anything if no linked article
  }

  return (
    <div className="mb-4 text-sm">
      <Link
        href={`/blog/${articleSlug}`}
        className="text-slate-100 hover:text-slate-300 transition"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        For more details, read our blog post about {toolName}.
      </Link>
    </div>
  );
}
