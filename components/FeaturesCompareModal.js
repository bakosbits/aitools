import { useState, useEffect } from "react";

export default function FeaturesCompareModal({ toolA, toolB, onClose }) {
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
                    fetch(`/api/tool/${toolA.Slug}/features`),
                    fetch(`/api/tool/${toolB.Slug}/features`),
                ]);

                if (!responseA.ok || !responseB.ok) {
                    throw new Error(`HTTP error!`);
                }

                const resultA = await responseA.json();
                const resultB = await responseB.json();

                setDataA(resultA);
                setDataB(resultB);
            } catch (e) {
                console.error("Failed to fetch features:", e);
                setError("Failed to load features. Please try again.");
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [toolA.Slug, toolB.Slug]);

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-cardDark p-6 rounded-lg shadow-lg max-w-4xl w-full relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-100 hover:text-gray-300 text-xl"
                >
                    &times;
                </button>
                <h3 className="text-xl font-bold mb-4 text-center">
                    Feature Comparison
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h4 className="text-lg font-semibold mb-2">{toolA.Name}</h4>
                        {isLoading && <p>Loading...</p>}
                        {error && <p className="text-red-400">{error}</p>}
                        {dataA && dataA.length > 0 ? (
                            <ul className="list-disc ml-6 space-y-2">
                                {dataA.map((feature, index) => (
                                    <li key={index}>{feature.Feature}</li>
                                ))}
                            </ul>
                        ) : (
                            !isLoading && !error && <p>No features found.</p>
                        )}
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-2">{toolB.Name}</h4>
                        {isLoading && <p>Loading...</p>}
                        {error && <p className="text-red-400">{error}</p>}
                        {dataB && dataB.length > 0 ? (
                            <ul className="list-disc ml-6 space-y-2">
                                {dataB.map((feature, index) => (
                                    <li key={index}>{feature.Feature}</li>
                                ))}
                            </ul>
                        ) : (
                            !isLoading && !error && <p>No features found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}