import { getAllArticles, getArticleBySlug } from "@/lib/airTable";
import ReactMarkdown from "react-markdown";
import { MarkdownImage, MarkdownLink } from "@/components/MarkdownComponents";
import MetaProps from "@/components/MetaProps";

export async function getStaticPaths() {
    const articles = await getAllArticles();
    const paths = [];
    
    return {
        paths,
        fallback: "blocking",
    };
}

export async function getStaticProps({ params }) {
    const articles = await getAllArticles();
    const article = articles.find((a) => a.Slug === params.slug);
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
                    <h1 className="text-4xl font-bold text-white mb-3">
                        {title}
                    </h1>
                    <div className="text-gray-500 text-sm mb-6">
                        {new Date(date).toLocaleDateString()}
                    </div>
                    <hr className="border-gray-700 mb-8" />
                    <div className="text-grayText prose prose-invert max-w-none">
                        <ReactMarkdown
                            components={{
                                img: MarkdownImage,
                                a: MarkdownLink,
                            }}
                        >
                            {content}
                        </ReactMarkdown>
                        <p>That's all for now.</p>
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
