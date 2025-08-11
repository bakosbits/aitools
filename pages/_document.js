import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Charset and Viewport (optional here; usually set in _app.js or individual pages) */}
        <meta charSet="utf-8" />
        <meta name="fo-verify" content="82ce619f-ae9b-47b7-8be9-c6a7c7952f20" />
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />

        {/* Web fonts or preloads, if any */}
        {/* <link rel="preconnect" href="https://fonts.googleapis.com" /> */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />

        {/* You can also include a default OG image fallback here */}
      </Head>
      <body>
        <Main />
        <div id="portal-root"></div>
        <NextScript />
      </body>
    </Html>
  );
}
