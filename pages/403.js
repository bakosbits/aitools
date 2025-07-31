import Head from "next/head";
import MetaProps from "@/components/MetaProps";
import randomQuotes from "random-quotes";
import { useState, useEffect } from "react";

export default function Custom403() {
  const [quote, setQuote] = useState({ text: "", author: "" });

  useEffect(() => {
    const randomQuote = randomQuotes();
    // The library returns { body, author }, so we map it to our state shape.
    setQuote({ text: randomQuote.body, author: randomQuote.author });
  }, []);

  return (
    <>
      <MetaProps
        title={`403 Forbidden`}
        description={`Access to this page is restricted`}
        url={`https://aitoolpouch.com/404/`}
      />
      <div className="flex flex-col items-center justify-center text-center py-12">
        <h1 className="text-2xl">You are forbidden..</h1>
        <h2 className="text-xl mb-8">We're sorry but you can't do that.</h2>
        <p className="text-lg mb-2">Enjoy this random quote instead:</p>
        {quote.text && (
          <div className="items-center text-center">
            <p className="text-lg italic ">"{quote.text}"</p>
            <p className="text-md mt-2">- {quote.author}</p>
          </div>
        )}
      </div>
    </>
  );
}
