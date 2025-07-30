import Head from "next/head";

export default function Custom403() {
    return (
        <>
            <Head>
                <title>403 - Forbidden</title>
                <meta name="description" content="Access to this page is restricted." />
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <div className="flex flex-col justify-center items-center bg-backgroundDark px-6 py-20 text-center">
                <h1 className="text-2xl font-bold mb-4 text-gray-100">
                    403 - Forbidden
                </h1>
                <p className="mb-8 text-gray-400">
                    Sorry, you do not have permission to access this page.
                </p>
            </div>
        </>
    );
}