
import { useState, useEffect } from 'react';

export default function EditUseCasesModal({ isOpen, onClose, useCases, onSave }) {
    const [localUseCases, setLocalUseCases] = useState([]);
    console.log('Use cases are:', useCases);
    useEffect(() => {
        if (Array.isArray(useCases)) {
            // Normalize: if array of strings, convert to array of objects
            const normalized = useCases.map(uc =>
                typeof uc === 'string' ? { UseCase: uc } : uc
            );
            setLocalUseCases(JSON.parse(JSON.stringify(normalized)));
        } else {
            setLocalUseCases([]);
        }
    }, [useCases, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(localUseCases);
        onClose();
    };

    const handleUseCaseChange = (index, value) => {
        const updatedUseCases = [...localUseCases];
        updatedUseCases[index] = { ...updatedUseCases[index], UseCase: value };
        setLocalUseCases(updatedUseCases);
    };

    const addUseCase = () => {
        setLocalUseCases([...localUseCases, { UseCase: '' }]);
    };

    const removeUseCase = (index) => {
        const updatedUseCases = localUseCases.filter((_, i) => i !== index);
        setLocalUseCases(updatedUseCases);
    };

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
                <h2 className="text-2xl font-bold mb-4">Edit Use Cases</h2>
                <div className="space-y-4">
                    {localUseCases.map((useCase, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <textarea
                                value={useCase.UseCase || ''}
                                onChange={(e) => handleUseCaseChange(index, e.target.value)}
                                className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-gray-400"
                                rows="3"
                            />
                            <button onClick={() => removeUseCase(index)} className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700">
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
                <button onClick={addUseCase} className="mt-4 px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">
                    Add Use Case
                </button>
                <div className="flex justify-end space-x-4 mt-4">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-gray-500 text-gray-100 hover:bg-gray-600">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded bg-teal-600 text-gray-100 hover:bg-blue-600">Save</button>
                </div>
            </div>
        </div>
    );
}
