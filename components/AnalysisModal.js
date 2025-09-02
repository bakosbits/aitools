import React from "react";

export default function AnalysisModal({ isOpen, onClose, analysisData }) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-cardDark p-5 border border-gray-600 rounded-md shadow-md max-w-2xl w-full relative max-h-[90vh] overflow-y-auto"
                style={{
                    marginTop: "env(safe-area-inset-top, 3.5rem)",
                    marginBottom: "env(safe-area-inset-bottom, 1rem)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-center">
                    <h3 className="text-xl font-bold mb-4">AI Comparison Analysis</h3>
                    <div>
                        {analysisData ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-lg text-left font-semibold mb-2">
                                            {analysisData.toolA_name || "Tool A"} Strengths:
                                        </h4>
                                        <ul className="list-disc list-inside text-left mb-4 ml-2">
                                            {(analysisData.toolA_strengths || []).map((strength, index) => (
                                                <li key={index}>{strength}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="text-lg text-left font-semibold mb-2">
                                            {analysisData.toolB_name || "Tool B"} Strengths:
                                        </h4>
                                        <ul className="list-disc list-inside text-left mb-4 ml-2">
                                            {(analysisData.toolB_strengths || []).map((strength, index) => (
                                                <li key={index}>{strength}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-left text-md font-semibold mb-2">Comparative Summary:</h4>
                                    <p className="text-left mb-4 ml-2">{analysisData.comparative_summary || ""}</p>
                                </div>
                            </>
                        ) : (
                            <p>Loading analysis...</p>
                        )}
                    </div>
                    <div className="items-center">
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
        </div>
    );
};
