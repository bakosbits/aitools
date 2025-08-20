import React, { useState, useCallback } from 'react';
import ToolCompareCard from '@/components/ToolCompareCard';
import CompareBar from '@/components/CompareBar';
import { ChevronLeft, ChevronRight, X, Sparkles, Filter } from 'lucide-react';
import { getWizardData } from '@/lib/airtable/use-cases';

export async function getStaticProps() {
    const wizardData = await getWizardData();
    return {
        props: {
            useCaseCategories: wizardData.useCaseCategories,
            allTools: wizardData.allTools,
        },
        revalidate: 60,
    };
}

const WizardStep = ({ category, tags, selectedTags, onTagSelect }) => (
    <div className="flex flex-col items-center justify-center bg-cardDark p-6 border border-gray-600 rounded-lg shadow-lg w-full max-w-7xl">
        <h2 className="text-2xl font-extrabold text-center text-gray-300 mb-8">{category}</h2>
        <div className="flex flex-wrap justify-center gap-4">
            {tags.map(tag => {
                const isSelected = selectedTags.has(tag);
                return (
                    <button
                        key={tag}
                        onClick={() => onTagSelect(tag)}
                        className={`
              px-3 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out
              ${isSelected
                                ? 'bg-blue-600 text-gray-100'
                                : 'bg-teal-600 text-gray-100 hover:bg-teal-700'
                            }
            `}
                    >
                        {tag}
                    </button>
                );
            })}
        </div>
    </div>
);

const SelectionDisplay = ({ selectedTags, onTagRemove, filteredCount }) => (
    <div className="w-full flex justify-center items-center py-4">
        <div className="max-w-full flex flex-wrap items-center justify-center bg-gray-800 px-4 py-2 gap-x-4 gap-y-2 transition-all duration-300">
            <div className="px-2 flex items-center">
                <Filter className="w-5 h-5 text-gray-300 mr-2" />
                <span className="text-sm font-medium text-gray-100 mr-2 whitespace-nowrap">Your Selections:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 py-1">
                {[...selectedTags].length > 0 ? (
                    [...selectedTags].map(tag => (
                        <div key={tag} className="flex items-center bg-gray-500 text-gray-100 hover:bg-gray-600 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap">
                            <span>{tag}</span>
                            <button
                                onClick={() => onTagRemove(tag)}
                                className="ml-2 text-gray-100 hover:bg-gray-600 transition-colors duration-200"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))
                ) : (
                    <span className="text-sm text-gray-100">No tags selected yet.</span>
                )}
            </div>
            {[...selectedTags].length > 0 && (
                <span className={`text-sm font-medium ${filteredCount === 0 ? "text-red-500" : "text-gray-100"} ml-2 whitespace-nowrap`}>
                    {filteredCount} tool{filteredCount === 1 ? '' : 's'} match your use case selections
                </span>
            )}
        </div>
    </div>
);

const App = ({ useCaseCategories, allTools }) => {
    const handleSkipToEnd = () => {
        setShowResults(true);
    };
    const handleSkip = () => {
        handleNext();
    };

    const [currentStep, setCurrentStep] = useState(0);
    const [selectedTags, setSelectedTags] = useState(new Set());
    const [showResults, setShowResults] = useState(false);
    const [compareList, setCompareList] = useState([]);
    const [categoryMenu, setCategoryMenu] = useState(true); // New state for menu

    const filteredTools = React.useMemo(() => {
        if (selectedTags.size === 0) {
            return allTools;
        }
        return allTools.filter(tool =>
            [...selectedTags].every(tag => tool.tags.includes(tag))
        );
    }, [selectedTags, allTools]);

    const isLastStep = currentStep === useCaseCategories.length - 1;

    const handleCompare = (tool) => {
        setCompareList((prev) => {
            const exists = prev.find((t) => t.id === tool.id);
            return exists
                ? prev.filter((t) => t.id !== tool.id)
                : prev.length < 2
                    ? [...prev, tool]
                    : prev;
        });
    };

    const handleTagSelect = (tag) => {
        setSelectedTags(prevTags => {
            const newTags = new Set(prevTags);
            if (newTags.has(tag)) {
                newTags.delete(tag);
            } else {
                newTags.add(tag);
            }
            return newTags;
        });
    };

    const handleTagRemove = (tag) => {
        setSelectedTags(prevTags => {
            const newTags = new Set(prevTags);
            newTags.delete(tag);
            return newTags;
        });
    };


    const handleNext = () => {
        if (currentStep < useCaseCategories.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            setShowResults(true);
        }
    };

    // Jump to a category from the menu
    const handleCategorySelect = (idx) => {
        setCurrentStep(idx);
        setCategoryMenu(false);
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    return (
        <div className="w-full mx-auto flex flex-col items-center justify-center bg-gray-800 text-gray-300 py-6" >
            <CompareBar
                compareList={compareList}
                handleCompare={handleCompare}
            />
            <div className="w-full mx-auto md:max-w-7xl">
                <h1 className="text-3xl font-extrabold text-center mb-6 text-gray-300">
                    Alignment By Use Case | Task | Project 
                    <Sparkles className="hidden md:inline-block ml-2 w-8 h-8 text-gray-300" />
                </h1>

                {/* Category Menu Step */}
                {categoryMenu ? (
                    <div className="flex flex-col items-center justify-center w-full mx-auto md:max-w-3xl">
                        <div className="flex flex-col items-center justify-center w-full bg-cardDark rounded-lg shadow-lg border border-gray-600 p-6">
                            <h2 className="text-2xl font-extrabold text-center text-gray-300 mb-6">Use Case Categories</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
                                {useCaseCategories.map((cat, idx) => (
                                    <button
                                        key={cat.category}
                                        onClick={() => handleCategorySelect(idx)}
                                        className="w-full px-6 py-4 bg-teal-600 hover:bg-teal-700 text-gray-100 rounded-lg font-semibold text-lg shadow-md transition-colors duration-200"
                                    >
                                        {cat.category}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={() => setCategoryMenu(false)}
                            className="mt-8 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-gray-100 rounded-md font-semibold shadow"
                        >
                            Start from the beginning of the wizard
                        </button>
                    </div>
                ) : showResults ? (
                    <div className="flex flex-col items-center bg-gray-800 w-full md:max-w-7xl mx-auto">
                        <h2 className="text-3xl font-extrabold text-center text-gray-300 mb-6">Your Recommended Tools</h2>
                        {filteredTools.length > 0 ? (
                            <div className="w-full grid gap-4">
                                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                                    {filteredTools.map((tool) => (
                                        <li key={tool.id}>
                                            <ToolCompareCard
                                                tool={tool}
                                                handleCompare={handleCompare}
                                                compareList={compareList}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <p className="text-center text-gray-100">No tools found for your selected tags. Try selecting more options!</p>
                        )}
                        <button
                            onClick={() => {
                                setShowResults(false);
                                setCurrentStep(0);
                                setSelectedTags(new Set());
                                setCompareList([]);
                                setCategoryMenu(true);
                            }}
                            className="mt-6 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-gray-100 rounded-md font-semibold shadow"
                        >
                            Start Over
                        </button>
                    </div>
                ) : (
                    <>
                        <WizardStep
                            category={useCaseCategories[currentStep].category}
                            tags={useCaseCategories[currentStep].tags}
                            selectedTags={selectedTags}
                            onTagSelect={handleTagSelect}
                        />

                        <div className="mt-8 w-full flex flex-col items-center">
                            <div className="flex justify-center items-center gap-4 mb-4">

                                <button
                                    onClick={() => {
                                        setShowResults(false);
                                        setCurrentStep(0);
                                        setSelectedTags(new Set());
                                        setCompareList([]);
                                        setCategoryMenu(true);
                                    }}
                                    className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-gray-100 rounded-md font-semibold shadow"
                                >
                                    Start Over
                                </button>

                                {currentStep > 0 && (
                                    <button
                                        onClick={handlePrev}
                                        className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-gray-100 rounded-md font-semibold shadow"
                                    >
                                        <ChevronLeft className="w-5 h-5 mr-1" /> Previous
                                    </button>
                                )}
                                <button
                                    onClick={handleNext}
                                    className="flex items-center px-3 py-2  bg-blue-600 hover:bg-blue-700 text-gray-100 rounded-md font-semibold shadow"
                                >
                                    {isLastStep ? 'Show Results' : 'Next Step'} <ChevronRight className="w-5 h-5 ml-1" />
                                </button>
                            </div>
                            <div className="flex items-center w-full mb-6 mt-6 font-semibold text-gray-300">
                                <div className="flex-1 flex justify-end">
                                    <button
                                        onClick={handleSkip}
                                        className="px-4 text-gray-300 hover:underline transition-colors duration-200"
                                    >
                                        Skip Category
                                    </button>
                                </div>
                                <div className="flex-shrink-0 flex items-center px-2">
                                    <span className="text-gray-300 font-semibold">|</span>
                                </div>
                                <div className="flex-1 flex justify-start">
                                    <button
                                        onClick={handleSkipToEnd}
                                        className="px-4 text-gray-300 font-semibold hover:underline transition-colors duration-200"
                                    >
                                        Skip to End
                                    </button>
                                </div>
                            </div>

                            <SelectionDisplay
                                selectedTags={selectedTags}
                                onTagRemove={handleTagRemove}
                                filteredCount={filteredTools.length}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default App;