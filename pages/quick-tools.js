// pages/quick-tools.js
import { useState } from 'react';
import { quickTools } from '@/lib/constants';

export default function QuickTools() {

    const [activeTool, setActiveTool] = useState(quickTools[0].id);
    const [inputText, setInputText] = useState('');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const selectedTool = quickTools.find(tool => tool.id === activeTool);

    const runTool = async () => {
        setLoading(true);
        setOutput('');

        try {
            const res = await fetch('/api/quick-tools', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ toolType: activeTool, inputText })
            });

            const data = await res.json();
            setOutput(data.output);
        } catch (err) {
            setOutput('Error: Could not generate output.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center py-12">
            <div className="w-full max-w-4xl p-6 space-y-6 bg-cardDark rounded-lg shadow-lg border border-gray-600">
                <h1 className="text-3xl font-bold mb-4">Quick Tools</h1>

                {/* Tabs */}
                <div className="w-full mb-4 flex">
                    <select
                        id="tool-select"
                        value={activeTool}
                        onChange={(e) => {
                            setActiveTool(e.target.value);
                            setInputText(''); // Reset input when tool changes
                            setOutput(''); // Reset output when tool changes
                        }}
                        className="w-full py-2 rounded-md bg-gray-800 text-slate-100 placeholder-text-slate-100 border border-gray-600"
                    >
                        {[...quickTools]
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((tool) => (
                                <option key={tool.id} value={tool.id}>
                                    {tool.name}
                                </option>
                            ))}
                    </select>
                </div>
                <div className="flex flex-wrap gap-2 bg-cardDark mb-4">

                    {selectedTool && selectedTool.memo && (
                        <div className=" mb-2  bg-cardDark text-gray-100">
                            {selectedTool.memo}
                        </div>
                    )}

                </div>
                {/* Input */}
                <textarea
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    className="w-full p-3 border border-gray-600 bg-backgroundDark text-slate-300 rounded-lg mb-4"
                    rows={5}
                    placeholder="Enter your text here..."
                />

                <button
                    onClick={runTool}
                    disabled={loading}
                    className="px-6 py-2 bg-teal-600 text-slate-100 font-semibold rounded-lg hover:bg-teal-700"
                >
                    {loading ? 'Generating...' : 'Generate'}
                </button>

                {/* Output */}
                {output && (
                    <div className="relative mt-6">
                        <div
                            className="p-4 border border-gray-600 bg-backgroundDark text-slate-300 rounded-lg whitespace-pre-wrap"
                        >
                            {output}
                        </div>
                        <button
                            onClick={() => {
                                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                                    navigator.clipboard.writeText(output);
                                    setCopied(true);
                                } else {
                                    alert('Clipboard not supported in this environment.');
                                }
                            }}
                            className="absolute top-2 right-2 px-3 py-1 bg-teal-600 text-slate-100 rounded hover:bg-teal-700 text-sm font-semibold shadow"
                            title="Copy to clipboard"
                        >
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                )}

                <input
                    type="text"
                    name="company"
                    className="absolute left-[-9999px] top-[-9999px]"
                    autoComplete="off"
                />


            </div>
        </div>
    );
}
