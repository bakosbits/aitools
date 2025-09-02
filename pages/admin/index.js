import Link from "next/link";
import { useState, useEffect } from "react";
import randomQuotes from "random-quotes";

export default function AdminPage() {
    const resources = [
        "Articles",
        "Bulk Updates",
        "Categories",
        "Tools",
    ].sort();
    const [quote, setQuote] = useState({ text: "", author: "" });

    useEffect(() => {
        const randomQuote = randomQuotes();
        setQuote({ text: randomQuote.body, author: randomQuote.author });
    }, []);

    return (
        <div className="md:flex flex-col w-full items-center justify-center h-full py-12">
            <h1 className="text-3xl font-bold mb-8 text-center">
                Admin Dashboard
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 max-w-2xl mb-12">
                {resources.map((resource) => {
                    const slug = resource.toLowerCase().replace(/\s+/g, "-");
                    return (
                        <Link
                            key={resource}
                            href={`/admin/${slug}`}
                            className="bg-teal-600 text-gray-100 font-bold p-6 hover:bg-blue-600 rounded-lg border border-gray-600 transition-colors text-center"
                        >
                            <h2 className="text-xl">Manage {resource}</h2>
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
