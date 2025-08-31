import { useState, useEffect } from "react";

export default function CautionsModal({ tool, onClose }) {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/tool/${tool.Slug}/cautions`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                setData(result);
            } catch (e) {
                console.error("Failed to fetch cautions:", e);
                setError("Failed to load cautions. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [tool.Slug]);

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-cardDark p-5 border border-gray-600 rounded-md shadow-md max-w-2xl w-full relative max-h-[90vh] overflow-y-auto"
                style={{
                    marginTop: "env(safe-area-inset-top, 3.5rem)",
                    marginBottom: "env(safe-area-inset-bottom, 1rem)",
                }}
                onClick={(e) => e.stopPropagation()}
            >

                <h3 className="text-xl font-bold mb-4">
                    Cautions for {tool.Name}
                </h3>
                {isLoading && <p>Loading cautions...</p>}
                {error && <p className="text-red-400">{error}</p>}
                {data && data.length > 0 ? (
                    <ul className="list-disc ml-6 space-y-2">
                        {data.map((caution, index) => (
                            <li key={index}>{caution.Caution}</li>
                        ))}
                    </ul>
                ) : (
                    !isLoading &&
                    !error && <p>No cautions found for this tool.</p>
                )}
            <div className="items-center mt-4">
                <button
                    id="ok-btn"
                    className="w-full px-4 py-2 bg-teal-600 text-gray-100 font-medium rounded-md shadow-sm hover:bg-blue-600"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
            </div>

        </div>
    );
}
