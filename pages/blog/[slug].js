import { getArticleBySlug } from "@/lib/airtable/articles";
import { MarkdownImage, MarkdownLink } from "@/components/MarkdownComponents";
import ReactMarkdown from "react-markdown";
import MetaProps from "@/components/MetaProps";

export async function getStaticPaths() {
    const paths = [];

    return {
        paths,
        fallback: "blocking",
    };
}

export async function getStaticProps({ params }) {
    const article = await getArticleBySlug(params.slug);
    if (!article) {
        return {
            notFound: true,
        };
    }
    return {
        props: {
            title: article.Title,
            summary: article.Summary,
            content: article.Content,
            author: article.Author,
            date: article.Date,
        },
        revalidate: 300,
    };
}

export default function BlogPost({ title, summary, content, author, date }) {
    return (
        <>
            <MetaProps
                title={title}
                description={summary}
                image={null} // Add image if available
                url={`/blog/${title.toLowerCase().replace(/\s+/g, "-")}`}
            />
            <div className="max-w-4xl mx-auto">
                <article>
                    <h1 className="text-4xl font-bold mb-3">{title}</h1>
                    <div className="text-gray-400 text-sm mb-6">{date}</div>
                    <hr className="border-gray-600 mb-8" />
                    <div className="text-gray-400 prose prose-invert max-w-none">
                        <ReactMarkdown
                            components={{
                                img: MarkdownImage,
                                a: MarkdownLink,
                            }}
                        >
                            {content}
                        </ReactMarkdown>
                        <p>That&apos;s all for now.</p>
                        <p>
                            Cheers!
                            <br />
                            {author}
                        </p>
                    </div>
                </article>
            </div>
        </>
    );
}
