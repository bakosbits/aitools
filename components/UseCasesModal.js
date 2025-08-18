import { useState, useEffect } from "react";

export default function UseCasesModal({ tool, onClose }) {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/tool/${tool.Slug}/use-cases`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                setData(result);
            } catch (e) {
                console.error("Failed to fetch use cases:", e);
                setError("Failed to load use cases. Please try again.");
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
                className="bg-cardDark p-6 rounded-lg shadow-lg max-w-md w-full relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-100 hover:text-gray-300 text-xl"
                >
                    &times;
                </button>
                <h3 className="text-xl font-bold mb-4">
                    Use Cases for {tool.Name}
                </h3>
                {isLoading && <p>Loading use cases...</p>}
                {error && <p className="text-red-400">{error}</p>}
                {data && data.length > 0 ? (
                    <ul className="list-disc ml-6 space-y-2">
                        {data.map((uc, index) => (
                            <li key={index}>{uc.UseCase}</li>
                        ))}
                    </ul>
                ) : (
                    !isLoading && !error && <p>No use cases found for this tool.</p>
                )}
            </div>
        </div>
    );
}
