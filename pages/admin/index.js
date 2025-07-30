import Link from "next/link";
import { useState, useEffect } from "react";
import randomQuotes from "random-quotes";

export default function AdminDashboard() {
    const resources = ["Tools", "Categories", "Aliases", "Articles"].sort();
    const [quote, setQuote] = useState({ text: "", author: "" });

    useEffect(() => {
        const randomQuote = randomQuotes();
        // The library returns { body, author }, so we map it to our state shape.
        setQuote({ text: randomQuote.body, author: randomQuote.author });
    }, []);

    return (
        <div className="flex flex-col w-[80%] mx-auto items-center justify-center h-full py-12">
            <h1 className="text-3xl font-bold mb-8 text-center">Admin Dashboard</h1>
            <div className="flex flex-col gap-4 w-full max-w-md mb-12 px-20">
                {resources.map((resource) => (
                    <Link
                        key={resource}
                        href={`/admin/${resource.toLowerCase()}`}
                        className="bg-teal-600 text-slate-100 font-bold p-6 hover:bg-teal-700 rounded-lg border border-gray-600 transition-colors text-center">
                        <h2 className="text-xl">Manage {resource}</h2>
                    </Link>
                ))}
            </div>
            {quote.text && (
                <div className="items-center text-center max-w-2xl">
                    <p className="text-lg italic ">"{quote.text}"</p>
                    <p className="text-md mt-2">- {quote.author}</p>
                </div>
            )}
        </div>
    );
}
