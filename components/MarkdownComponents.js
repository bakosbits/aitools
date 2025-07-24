// components/CustomMarkdownImage.jsx (or directly in your page file)
import React from "react"; // Needed for JSX

export const MarkdownImage = ({ node, ...props }) => {
    // node prop contains info about the Markdown node, props contains src, alt, title etc.
    return (
        <img
            {...props} // Pass through original src, alt, title
            className="my-6 object-contain border border-gray-700 rounded-lg block mx-auto w-full h-auto shadow-4xl shadow-[0_6px_16px_rgba(0,255,128,0.25)]" // Apply Tailwind classes
        />
    );
};

export const MarkdownLink = ({ node, ...props }) => {
    return (
        <a
            {...props}
            className="text-accentGreen no-underline hover:text-headingWhite transition-colors"
            target={props.href?.startsWith("http") ? "_blank" : undefined}
            rel={
                props.href?.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
            }
        ></a>
    );
};
