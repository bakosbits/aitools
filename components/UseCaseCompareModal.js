import { useState, useEffect } from "react";

export default function UseCaseCompareModal({ toolA, toolB, onClose }) {
    const [dataA, setDataA] = useState(null);
    const [dataB, setDataB] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [responseA, responseB] = await Promise.all([
                    fetch(`/api/tool/${toolA.Slug}/use-cases`),
                    fetch(`/api/tool/${toolB.Slug}/use-cases`),
                ]);

                if (!responseA.ok || !responseB.ok) {
                    throw new Error(`HTTP error!`);
                }

                const resultA = await responseA.json();
                const resultB = await responseB.json();

                setDataA(resultA);
                setDataB(resultB);
            } catch (e) {
                console.error("Failed to fetch use cases:", e);
                setError("Failed to load use cases. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [toolA.Slug, toolB.Slug]);

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-cardDark p-5 border border-gray-600 rounded-md shadow-md max-w-4xl w-full relative max-h-[90vh] overflow-y-auto"
                style={{
                    marginTop: "env(safe-area-inset-top, 3.5rem)",
                    marginBottom: "env(safe-area-inset-bottom, 1rem)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-center text-xl font-bold mb-4">
                    Use Case Comparison
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h4 className="text-lg font-semibold mb-2">
                            {toolA.Name}
                        </h4>
                        {isLoading && <p>Loading...</p>}
                        {error && <p className="text-red-400">{error}</p>}
                        {dataA && dataA.length > 0 ? (
                            <ul className="list-disc ml-6 space-y-2">
                                {dataA.map((uc, index) => (
                                    <li key={index}>{uc.UseCase}</li>
                                ))}
                            </ul>
                        ) : (
                            !isLoading && !error && <p>No use cases found.</p>
                        )}
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-2">
                            {toolB.Name}
                        </h4>
                        {isLoading && <p>Loading...</p>}
                        {error && <p className="text-red-400">{error}</p>}
                        {dataB && dataB.length > 0 ? (
                            <ul className="list-disc ml-6 space-y-2">
                                {dataB.map((uc, index) => (
                                    <li key={index}>{uc.UseCase}</li>
                                ))}
                            </ul>
                        ) : (
                            !isLoading && !error && <p>No use cases found.</p>
                        )}
                    </div>                 
                </div>
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
