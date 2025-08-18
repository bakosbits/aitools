// components/CustomMarkdownImage.jsx (or directly in your page file)
import React from "react"; // Needed for JSX

/**
 * Renders a styled image for use within markdown content.
 * This component is designed to be used with a library like `react-markdown`
 * to override the default `img` element rendering. It applies custom styling
 * to ensure visual consistency.
 * @param {object} props - The component props, passed by the markdown renderer.
 * @param {object} props.node - The markdown AST node for the image.
 * @param {string} props.src - The source URL of the image.
 * @param {string} [props.alt] - The alternative text for the image.
 */
export const MarkdownImage = ({ node, ...props }) => {
    // node prop contains info about the Markdown node, props contains src, alt, title etc.
    return (
        <img
            {...props} // Pass through original src, alt, title
            className="my-6 object-contain border border-gray-600 rounded-lg block mx-auto w-full h-auto shadow-[0_6px_16px_rgba(0,255,128,0.25)]" // Apply Tailwind classes
        />
    );
};

/**
 * Renders a styled link for use within markdown content.
 * This component is designed to be used with a library like `react-markdown`
 * to override the default `a` element rendering. It applies custom styling
 * and automatically handles opening external links in a new tab for better
 * security and user experience.
 * @param {object} props - The component props, passed by the markdown renderer.
 * @param {object} props.node - The markdown AST node for the link.
 * @param {string} props.href - The URL the link points to.
 * @param {React.ReactNode} props.children - The content of the link (e.g., text or an image).
 */
export const MarkdownLink = ({ node, ...props }) => {
    return (
        <a
            {...props}
            className="text-gray-100 no-underline hover:text-gray-300 transition-colors"
            target={props.href?.startsWith("http") ? "_blank" : undefined}
            rel={
                props.href?.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
            }
        >
            {props.children}
        </a>
    );
};
