import { useState, useEffect } from "react";
import { AI_MODELS } from "@/lib/constants";
import Link from "next/link";

export default function UpdateUseCaseTagsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [statusLog, setStatusLog] = useState([]);
    const [error, setError] = useState(null);
    const [model, setModel] = useState("google/gemini-2.5-flash");


    const handleStartUpdate = () => {
        setStatusLog(["Starting bulk update process... This may take a while."]);
        setError(null);
        setIsLoading(true);

        const eventSource = new EventSource(`/api/bulk-update-use-case-tags?model=${model}`);

        eventSource.addEventListener('status', (event) => {
            const data = JSON.parse(event.data);
            if (data.message) {
                setStatusLog(prevLog => [...prevLog, data.message]);
                setIsLoading(false);
                eventSource.close();
            }
        });
        eventSource.addEventListener('error', (event) => {

            if (typeof event.data !== 'string' || event.data.trim() === '') {
                setError("An unexpected error occurred without specific details from the server.");
                setStatusLog(prevLog => [...prevLog, "An unexpected error occurred."]);
                setIsLoading(false);
                eventSource.close();
                return;
            }
        });
        eventSource.onerror = (event) => {
            if (!error) {
                const genericErrorMessage = "Connection closed unexpectedly or network error.";
                setError(genericErrorMessage);
                setStatusLog(prevLog => [...prevLog, genericErrorMessage]);
            }
            setIsLoading(false);
            eventSource.close();
        };
    };
    return (
        <div className="flex items-center justify-center py-12">
            <div className="w-full max-w-2xl p-8 space-y-6 bg-cardDark rounded-lg border border-gray-600">
                <div className="mb-4">
                    <Link href="/admin/bulk-updates" className="text-slate-300 hover:text-teal-400">
                        &larr; Back to Bulk Updates
                    </Link>
                </div>
                <h1 className="text-2xl font-bold mb-2">Bulk Update Use Case Tags</h1>
                <p className="mb-4">
                    This process uses AI to Analyze use cases.
                    It will iterate over every use case, analyze its purpose, and select 3-10
                    of the most relevant tags from the master list to assign to it. The
                    existing tags for each use case will be overwritten.
                </p>
                <p className="mb-6 text-yellow-400">
                    Warning: This action is irreversible and may take a significant
                    amount of time to complete depending on the number of use cases.
                </p>

                <div className="mb-6">
                    <label
                        htmlFor="model-select"
                        className="block text-lg font-medium text-slate-100 mb-2"
                    >
                        Select an AI Model
                    </label>
                    <select
                        id="model-select"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-slate-100 placeholder-text-slate-100 border border-gray-600"
                    >
                        {[...AI_MODELS]
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((model) => (
                                <option key={model.id} value={model.id}>
                                    {model.name}
                                </option>
                            ))}
                    </select>
                </div>

                <button
                    onClick={handleStartUpdate}
                    disabled={isLoading}
                    className="bg-teal-600 text-slate-100 font-bold py-3 px-6 rounded hover:bg-teal-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Updating..." : "Start Tag Update Process"}
                </button>

                {(statusLog.length > 0 || error) && (
                    <div className="mt-6 p-4 rounded-md bg-gray-800 border border-gray-600 max-h-96 overflow-y-auto">
                        <h3 className="font-semibold mb-2 text-slate-100">Status:</h3>
                        {statusLog.map((message, index) => (
                            <p key={index} className="text-green-400 mb-1">
                                {message}
                            </p>
                        ))}
                        {error && <p className="text-red-500 mt-2">{error}</p>}
                    </div>
                )}
            </div>
        </div>
    );
}