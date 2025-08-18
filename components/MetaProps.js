import Head from "next/head";

/**
 * Renders essential meta tags for SEO and social media sharing.
 * This component populates the document's `<head>` with primary meta tags
 * (title, description, canonical URL) as well as Open Graph and Twitter Card
 * metadata to ensure proper display when sharing links on social platforms.
 * @param {object} props - The component props.
 * @param {string} props.title - The title of the page, used for `<title>`, `og:title`, and `twitter:title`.
 * @param {string} props.description - The meta description for the page, used for the description tag, `og:description`, and `twitter:description`.
 * @param {string} props.url - The canonical URL for the page, used for `rel="canonical"` and `og:url`.
 * @param {string} [props.image] - The URL for a preview image for social sharing (optional).
 */
export default function MetaProps({ title, description, url, image }) {
    return (
        <Head>
            {/* Primary Meta */}
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href={url} />

            {/* Open Graph */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={url} />
            <meta property="og:site_name" content="AI Tool Pouch" />

            {/* Twitter */}
            <meta
                name="twitter:card"
                content={image ? "summary_large_image" : "summary"}
            />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />

            {/* Conditionally render image tags only if an image is provided */}
            {image && (
                <>
                    <meta property="og:image" content={image} />
                    <meta name="twitter:image" content={image} />
                </>
            )}
        </Head>
    );
}
