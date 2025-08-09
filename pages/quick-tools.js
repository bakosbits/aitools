// pages/quick-tools.js
import { useState } from 'react';

export default function QuickTools() {
    const tools = [
        { id: 'headline', name: 'Headline Rewriter' },
        { id: 'tweet', name: 'Tweet Expander' },
        { id: 'tagline', name: 'Idea → Tagline' },
        { id: 'meeting', name: 'Meeting Summary' },
        { id: 'blog', name: 'Blog Post Outliner' }
    ];

    const [activeTool, setActiveTool] = useState(tools[0].id);
    const [inputText, setInputText] = useState('');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);

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
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">Quickies</h1>

            {/* Tabs */}
            <div className="flex space-x-2 mb-6">
                {tools.map(tool => (
                    <button
                        key={tool.id}
                        onClick={() => { setActiveTool(tool.id); 
                            setInputText(''); 
                            setOutput(''); }}
                        className={`px-4 py-2 rounded-lg ${activeTool === tool.id
                                ? 'bg-teal-600 text-slate-100'
                                : 'bg-cardDark text-slate-300 hover:text-slate-100'
                            }`}
                    >
                        {tool.name}
                    </button>
                ))}
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
                <div 
                onChange={e => setInputText(e.target.value)}
                className="mt-6 p-4 border border-gray-600 bg-backgroundDark text-slate-300 rounded-lg whitespace-pre-wrap">
                    {output}
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
