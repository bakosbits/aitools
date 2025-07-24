import Link from "next/link";
import React from "react";

export default function BlogLinkCard({ articleSlug, toolName }) {
    if (!articleSlug) {
        return null; // Don't render anything if no linked article
    }
    

    return (
        <div className="mb-4 text-sm">
            <a
                href={`/blog/${articleSlug}`}
                className="text-accentGreen hover:text-headingWhite"
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                For more detail read our blog post about {toolName}.
            </a>    
        </div>
    );
}
