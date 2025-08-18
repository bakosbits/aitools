import Link from "next/link";
import { useState, useEffect } from "react";
import randomQuotes from "random-quotes";

export default function Admin() {
    const resources = [
        "Update Tool Categories",
        "Map Use Case Tags",
        "Map Caution Tags",
        "Update Use Cases",
        "Update Cautions",
        "Update Use Case Tags",
    ].sort();
    const [quote, setQuote] = useState({ text: "", author: "" });

    useEffect(() => {
        const randomQuote = randomQuotes();
        // The library returns { body, author }, so we map it to our state shape.
        setQuote({ text: randomQuote.body, author: randomQuote.author });
    }, []);

    return (
        <div className="flex flex-col w-full items-center justify-center h-full py-12">
            <Link
                href="/admin"
                className="text-gray-100 hover:text-gray-300 mb-6 inline-block"
            >
                &larr; Back to Tools
            </Link>
            <h1 className="text-3xl font-bold mb-8 text-center">
                Bulk Updates
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mb-12">
                {resources.map((resource) => {
                    const slug =
                        resource === "Update Tags"
                            ? "update-tags"
                            : resource.toLowerCase().replace(/\s+/g, "-");
                    return (
                        <Link
                            key={resource}
                            href={`/admin/bulk-updates/${slug}`}
                            className="bg-teal-600 text-gray-100 font-bold p-6 hover:bg-teal-700 rounded-lg border border-gray-600 transition-colors text-center"
                        >
                            <h2 className="text-xl">{resource}</h2>
                        </Link>
                    );
                })}
            </div>
            {quote.text && (
                <div className="items-center text-center max-w-2xl">
                    <p className="text-lg italic">{quote.text}</p>
                    <p className="text-md mt-2">- {quote.author}</p>
                </div>
            )}
        </div>
    );
}
