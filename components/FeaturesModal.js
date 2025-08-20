import { useState, useEffect } from "react";

export default function FeaturesModal({ tool, onClose }) {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/tool/${tool.Slug}/features`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                setData(result);
            } catch (e) {
                console.error("Failed to fetch features:", e);
                setError("Failed to load features. Please try again.");
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [tool.Slug]);

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-cardDark p-4 rounded-md shadow-md max-w-2xl w-full relative max-h-[90vh] overflow-y-auto"
                style={{ marginTop: 'env(safe-area-inset-top, 3.5rem)', marginBottom: 'env(safe-area-inset-bottom, 1rem)' }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="bg-teal-600 text-gray-100 hover:bg-teal-700 rounded-md px-2 py-1 font-semibold mb-4"
                >
                    Close
                </button> 
                <h3 className="text-xl font-bold mb-4">
                    Features for {tool.Name}
                </h3>
                {isLoading && <p>Loading features...</p>}
                {error && <p className="text-red-400">{error}</p>}
                {data && data.length > 0 ? (
                    <ul className="list-disc ml-6 space-y-2">
                        {data.map((feature, index) => (
                            <li key={index}>{feature.Feature}</li>
                        ))}
                    </ul>
                ) : (
                    !isLoading && !error && <p>No features found for this tool.</p>
                )}
            </div>
        </div>
    );
}
