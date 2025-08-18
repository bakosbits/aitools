import { useState } from "react";
import { AI_MODELS } from "@/lib/constants";

export default function AiResearchAssistant({
    onResearchComplete,
    initialResearchTerm = "",
}) {
    const [researchTerm, setResearchTerm] = useState(initialResearchTerm);
    const [isResearching, setIsResearching] = useState(false);
    const [clientError, setClientError] = useState(null);
    const [selectedModel, setSelectedModel] = useState(
        "google/gemini-2.5-flash",
    );

    const handleResearch = async () => {
        if (!researchTerm) return;
        setIsResearching(true);
        setClientError(null);
        try {
            const response = await fetch("/api/research-tool", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    toolName: researchTerm,
                    model: selectedModel,
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || "Research failed.");
            }

            const data = await response.json();
            onResearchComplete(data); // Pass the researched data back to the parent
        } catch (err) {
            setClientError(err.message);
        } finally {
            setIsResearching(false);
        }
    };

    return (
        <div className="mb-8 p-8 bg-cardDark rounded-lg border border-gray-600">
            <h2 className="text-xl font-semibold mb-4">
                AI Research Assistant
            </h2>
            <p className="text-sm mb-2">Enter A Tool Name</p>
            <div className="flex flex-col gap-4 mb-4">
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={researchTerm}
                        onChange={(e) => setResearchTerm(e.target.value)}
                        placeholder="e.g., Figma"
                        className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-gray-300 placeholder-text-gray-300 border border-gray-600"
                    />
                    <button
                        onClick={handleResearch}
                        disabled={isResearching}
                        className="bg-teal-600 text-gray-100 font-bold mt-1 px-4 rounded hover:bg-teal-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        {isResearching ? "Researching..." : "Research"}
                    </button>
                </div>
                <div>
                    <label
                        htmlFor="model-select"
                        className="block text-sm font-medium text-gray-300 mb-2"
                    >
                        Select Research Model
                    </label>
                    <select
                        id="model-select"
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full mt-1 px-4 py-2 rounded-md bg-gray-800 text-gray-300 placeholder-text-gray-300 border border-gray-600"
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
            </div>
            {clientError && <p className="text-red-500 mt-2">{clientError}</p>}
        </div>
    );
}
