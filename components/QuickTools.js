// pages/quick-tools.js
import { useState } from "react";
import { QUICK_TOOLS } from "@/lib/constants";

export default function QuickTools() {
    const [activeTool, setActiveTool] = useState(QUICK_TOOLS[0].id);
    const [inputText, setInputText] = useState("");
    const [output, setOutput] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const selectedTool = QUICK_TOOLS.find((tool) => tool.id === activeTool);

    const runTool = async () => {
        setLoading(true);
        setOutput("");

        try {
            const res = await fetch("/api/quick-tools/quick-tools", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ toolType: activeTool, inputText }),
            });

            const data = await res.json();
            setOutput(data.output);
        } catch (err) {
            setOutput("Error: Could not generate output.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full p-6 space-y-4 bg-cardDark rounded-lg shadow-lg border border-gray-600">
            <h2 className="text-2xl font-bold mb-4">Quick Tools</h2>
            <div className="w-full mb-2 flex">
                <select
                    id="tool-select"
                    value={activeTool}
                    onChange={(e) => {
                        setActiveTool(e.target.value);
                        setInputText(""); // Reset input when tool changes
                        setOutput(""); // Reset output when tool changes
                    }}
                    className="w-full py-2 px-2 rounded-md bg-gray-800 text-gray-300 placeholder-text-gray-300 border border-gray-600"
                >
                    {[...QUICK_TOOLS]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((tool) => (
                            <option key={tool.id} value={tool.id}>
                                {tool.name}
                            </option>
                        ))}
                </select>
            </div>
            <div className="flex flex-wrap gap-2 bg-cardDark">
                {selectedTool && selectedTool.memo && (
                    <p className="px-2 text-sm text-gray-300">
                        {selectedTool.memo}
                    </p>
                )}
            </div>
            {/* Input */}
            <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full p-3 border border-gray-600 bg-gray-800 text-gray-400 rounded-lg mb-4"
                rows={5}
                placeholder="Enter your text or a URL here..."
            />

            <button
                onClick={runTool}
                disabled={loading}
                className="px-4 py-2 bg-teal-600 text-gray-100 font-semibold rounded-lg hover:bg-teal-700"
            >
                {loading ? "Generating..." : "Generate"}
            </button>

            {/* Output */}
            {output && (
                <div className="relative mt-6">
                    <button
                        onClick={() => {
                            if (
                                typeof navigator !== "undefined" &&
                                navigator.clipboard
                            ) {
                                navigator.clipboard.writeText(output);
                                setCopied(true);
                            } else {
                                alert(
                                    "Clipboard not supported in this environment.",
                                );
                            }
                        }}
                        className="absolute top-2 right-2 px-3 py-1 bg-teal-600 text-gray-100 rounded hover:bg-teal-700 text-sm font-semibold shadow z-10"
                        title="Copy to clipboard"
                    >
                        {copied ? "Copied!" : "Copy"}
                    </button>
                    <div className="p-4 border border-gray-600 bg-gray-800 text-gray-400 rounded-lg whitespace-pre-wrap pt-10">
                        {output}
                    </div>
                </div>
            )}

            <input
                type="text"
                name="company"
                className="absolute left-[-9999px] top-[-9999px]"
                autoComplete="off"
            />
        </div>
    );
}
