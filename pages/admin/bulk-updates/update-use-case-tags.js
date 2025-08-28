import Link from "next/link";
import { useState } from "react";
import { AI_MODELS } from "@/lib/constants";
import { usePersistentSSE } from "@/lib/hooks/usePersistentSSE";

export default function UpdateUseCaseTags() {
    const [model, setModel] = useState("google/gemini-2.5-flash");

    const { statusLog, error, isLoading, startStream } = usePersistentSSE({
        url: `/api/admin/map-use-case-tags?model=${model}`,
    });

    return (
        <div className="flex items-center justify-center py-12">
            <div className="w-full max-w-2xl p-8 space-y-6 bg-cardDark rounded-lg border border-gray-600">
                <div className="mb-4">
                    <Link
                        href="/admin/bulk-updates"
                        className="text-gray-300 hover:text-teal-400"
                    >
                        &larr; Back to Bulk Updates
                    </Link>
                </div>

                <h1 className="text-2xl font-bold mb-2">
                    Bulk Update Use Case Tags
                </h1>
                <p>
                    This process uses AI analyze each tools why, description and
                    details. It will iterate over every tool, analyze its
                    purpose, and generate 1-2 single sentence use cases to map
                    back to Use Case Pillars
                </p>

                <p className="mb-6 text-yellow-400">
                    Warning: This action is irreversible and may take a
                    significant amount of time to complete depending on the
                    number of tools.
                </p>
                <div className="mb-6">
                    <label
                        htmlFor="model-select"
                        className="block text-lg font-medium text-gray-100 mb-2"
                    >
                        Select an AI Model
                    </label>
                    <select
                        id="model-select"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-gray-100 placeholder-text-gray-100 border border-gray-600"
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
                    onClick={startStream}
                    disabled={isLoading}
                    className="bg-teal-600 text-gray-100 font-bold py-3 px-6 rounded hover:bg-blue-600 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Updating..." : "Start"}
                </button>

                {(statusLog.length > 0 || error) && (
                    <div className="mt-6 p-4 rounded-md bg-gray-800 border border-gray-600 max-h-96 overflow-y-auto">
                        <h3 className="font-semibold mb-2 text-gray-100">
                            Status:
                        </h3>
                        {statusLog.map((message, index) => (
                            <p key={index} className="text-green-400 mb-2">
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
