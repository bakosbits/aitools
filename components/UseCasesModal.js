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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 mt-16 md:mt-4"
            onClick={onClose}
        >
            <div
                className="bg-cardDark p-4 rounded-lg shadow-lg max-w-md w-full relative max-h-[90vh] overflow-y-auto"
                style={{ marginTop: 'env(safe-area-inset-top, 3.5rem)', marginBottom: 'env(safe-area-inset-bottom, 1rem)' }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="align-right bg-teal-600 text-gray-100 hover:bg-teal-700 rounded px-2 py-1 font-semibold mb-4"
                >
                    Close
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
    )
}    
