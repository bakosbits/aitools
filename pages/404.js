import MetaProps from "@/components/MetaProps";
export default function Custom404() {
    return (
        <>
            <MetaProps
                title={`404 Not Found`}
                description={`This page doesn’t exist or may have moved. Use the menu to explore the best AI tools by profession on AI Tool Pouch.`}
                url={`https://aitoolpouch.com/404/`}
            />
            <div className="flex flex-col justify-center items-center bg-backgroundDark px-6 py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">
                    Oops. Well, that doesn't seem to exist.
                </h1>
                <p className="mb-8 text-gray-400">
                    We couldn’t locate what you were looking for. It must be a
                    glitch.
                </p>
            </div>
        </>
    );
}
