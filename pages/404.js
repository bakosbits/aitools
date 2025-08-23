import MetaProps from "@/components/MetaProps";
import randomQuotes from "random-quotes";
import { useState, useEffect } from "react";

export default function Custom404() {
    const [quote, setQuote] = useState({ text: "", author: "" });

    useEffect(() => {
        const randomQuote = randomQuotes();
        // The library returns { body, author }, so we map it to our state shape.
        setQuote({ text: randomQuote.body, author: randomQuote.author });
    }, []);

    return (
        <>
            <MetaProps
                title={`404 Not Found`}
                description={`This page doesn't exist or may have moved.`}
                url={`https://aitoolpouch.com/404/`}
            />
            <div className="flex flex-col items-center justify-center text-center py-12">
                <h1 className="text-2xl">404 Not Found.</h1>
                <h2 className="text-xl mb-8">
                    It&apos;s probably just a glitch.
                </h2>
                <p className="text-lg mb-2">
                    In the meantime, here&apos;s a random quote:
                </p>
                {quote.text && (
                    <div className="items-center text-center">
                        <p className="text-lg italic">{quote.text}</p>
                        <p className="text-md mt-2">- {quote.author}</p>
                    </div>
                )}
            </div>
        </>
    );
}
