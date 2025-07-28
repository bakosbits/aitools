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
 */
export default function MetaProps({ title, description, url }) {
    return (
        <Head>
            {/* Primary Meta */}
            <title>{title}</title>
            <meta name="robots" content="index, follow" />
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
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
        </Head>
    );
}
