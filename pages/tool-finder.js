import { useState, useEffect } from 'react';
import Link from 'next/link';


// Step components
const GoalsStep = ({ data, updateData, nextStep }) => {
    const [selectedGoal, setSelectedGoal] = useState(data || null);

    const GOAL_OPTIONS = [
        { id: 'content', label: 'Content Creation', icon: '✍️' },
        { id: 'research', label: 'Research & Analysis', icon: '🔍' },
        { id: 'coding', label: 'Coding & Development', icon: '💻' },
        { id: 'design', label: 'Design & Creative', icon: '🎨' },
        { id: 'productivity', label: 'Productivity', icon: '⏱️' }
    ];

    const handleContinue = () => {
        updateData(selectedGoal);
        nextStep();
    };

    return (
        <div className="space-y-8">
            <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '20%' }}></div>
                </div>
                <p className="text-sm text-gray-500 mt-2 text-center">Step 1 of 5</p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-300">What's your primary goal?</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {GOAL_OPTIONS.map(goal => (
                    <button
                        key={goal.id}
                        className={`p-4 border rounded-lg flex items-center space-x-3 
              ${selectedGoal === goal.id ? 'border-teal-500 bg-gray-700' : 'border-gray-600'}`}
                        onClick={() => setSelectedGoal(goal.id)}
                    >
                        <span className="text-2xl">{goal.icon}</span>
                        <span className="text-gray-300">{goal.label}</span>
                    </button>
                ))}
            </div>

            <div className="flex justify-end">
                <button
                    className="px-6 py-2 bg-teal-600 text-gray-100 rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors"
                    disabled={!selectedGoal}
                    onClick={handleContinue}
                >
                    Continue
                </button>
            </div>
        </div>
    );
};

const ExperienceStep = ({ data, updateData, nextStep, prevStep }) => {
    const [selectedExperience, setSelectedExperience] = useState(data || null);

    const EXPERIENCE_OPTIONS = [
        { id: 'beginner', label: 'Beginner', icon: '🔰', description: 'New to AI tools, looking for user-friendly options' },
        { id: 'intermediate', label: 'Intermediate', icon: '🧠', description: 'Familiar with AI tools, but not an expert' },
        { id: 'advanced', label: 'Advanced', icon: '⚡', description: 'Experienced with AI tools, looking for powerful features' }
    ];

    const handleContinue = () => {
        updateData(selectedExperience);
        nextStep();
    };

    return (
        <div className="space-y-8">
            <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '40%' }}></div>
                </div>
                <p className="text-sm text-gray-500 mt-2 text-center">Step 2 of 5</p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-300">What's your experience level with AI tools?</h2>
            <p className="text-gray-400">This helps us recommend tools that match your comfort level.</p>

            <div className="grid grid-cols-1 gap-4">
                {EXPERIENCE_OPTIONS.map(experience => (
                    <button
                        key={experience.id}
                        className={`p-4 border rounded-lg flex items-center space-x-3 
              ${selectedExperience === experience.id ? 'border-teal-500 bg-gray-700' : 'border-gray-600'}`}
                        onClick={() => setSelectedExperience(experience.id)}
                    >
                        <span className="text-2xl">{experience.icon}</span>
                        <div className="flex flex-col text-left">
                            <span className="font-medium text-gray-300">{experience.label}</span>
                            <span className="text-sm text-gray-400">{experience.description}</span>
                        </div>
                    </button>
                ))}
            </div>

            <div className="flex justify-between mt-8">
                <button
                    className="px-6 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
                    onClick={prevStep}
                >
                    Back
                </button>
                <button
                    className="px-6 py-2 bg-teal-600 text-gray-100 rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors"
                    disabled={!selectedExperience}
                    onClick={handleContinue}
                >
                    Continue
                </button>
            </div>
        </div>
    );
};

const PrioritiesStep = ({ data, updateData, nextStep, prevStep }) => {
    const [selectedPriorities, setSelectedPriorities] = useState(data || []);

    const PRIORITY_OPTIONS = [
        { id: 'ease_of_use', label: 'Ease of Use', icon: '👌' },
        { id: 'features', label: 'Advanced Features', icon: '🛠️' },
        { id: 'cost', label: 'Cost-Effective', icon: '💰' },
        { id: 'integration', label: 'Integration Capabilities', icon: '🔄' },
        { id: 'support', label: 'Customer Support', icon: '🤝' }
    ];

    const togglePriority = (priorityId) => {
        setSelectedPriorities(prev => {
            if (prev.includes(priorityId)) {
                return prev.filter(id => id !== priorityId);
            } else {
                return [...prev, priorityId];
            }
        });
    };

    const handleContinue = () => {
        updateData(selectedPriorities);
        nextStep();
    };

    return (
        <div className="space-y-8">
            <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <p className="text-sm text-gray-500 mt-2 text-center">Step 3 of 5</p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-300">What are your priorities?</h2>
            <p className="text-gray-400">Select all that apply (at least one).</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PRIORITY_OPTIONS.map(priority => (
                    <button
                        key={priority.id}
                        className={`p-4 border rounded-lg flex items-center space-x-3 
              ${selectedPriorities.includes(priority.id) ? 'border-teal-500 bg-gray-700' : 'border-gray-600'}`}
                        onClick={() => togglePriority(priority.id)}
                    >
                        <span className="text-2xl">{priority.icon}</span>
                        <span className="text-gray-300">{priority.label}</span>
                    </button>
                ))}
            </div>

            <div className="flex justify-between mt-8">
                <button
                    className="px-6 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
                    onClick={prevStep}
                >
                    Back
                </button>
                <button
                    className="px-6 py-2 bg-teal-600 text-gray-100 rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors"
                    disabled={selectedPriorities.length === 0}
                    onClick={handleContinue}
                >
                    Continue
                </button>
            </div>
        </div>
    );
};

const FeaturesStep = ({ data, updateData, nextStep, prevStep }) => {
    const [selectedFeatures, setSelectedFeatures] = useState(data || []);
    const [customFeature, setCustomFeature] = useState('');

    const FEATURE_OPTIONS = [
        { id: 'text_generation', label: 'Text Generation' },
        { id: 'image_generation', label: 'Image Generation' },
        { id: 'code_assistance', label: 'Code Assistance' },
        { id: 'data_analysis', label: 'Data Analysis' },
        { id: 'automation', label: 'Workflow Automation' },
        { id: 'collaboration', label: 'Team Collaboration' },
        { id: 'api_access', label: 'API Access' },
        { id: 'free_tier', label: 'Free Tier Available' }
    ];

    const toggleFeature = (featureId) => {
        setSelectedFeatures(prev => {
            if (prev.includes(featureId)) {
                return prev.filter(id => id !== featureId);
            } else {
                return [...prev, featureId];
            }
        });
    };

    const addCustomFeature = () => {
        if (customFeature.trim() !== '' && !selectedFeatures.includes(customFeature.trim())) {
            setSelectedFeatures([...selectedFeatures, customFeature.trim()]);
            setCustomFeature('');
        }
    };

    const handleContinue = () => {
        updateData(selectedFeatures);
        nextStep();
    };

    return (
        <div className="space-y-8">
            <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '80%' }}></div>
                </div>
                <p className="text-sm text-gray-500 mt-2 text-center">Step 4 of 5</p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-300">What features do you need?</h2>
            <p className="text-gray-400">Select all that apply (optional).</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FEATURE_OPTIONS.map(feature => (
                    <button
                        key={feature.id}
                        className={`p-4 border rounded-lg flex items-center space-x-3 
              ${selectedFeatures.includes(feature.id) ? 'border-teal-500 bg-gray-700' : 'border-gray-600'}`}
                        onClick={() => toggleFeature(feature.id)}
                    >
                        <span className="text-gray-300">{feature.label}</span>
                    </button>
                ))}
            </div>

            <div className="mt-6">
                <label htmlFor="customFeature" className="block text-sm font-medium text-gray-300">
                    Add a custom feature (optional)
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                        type="text"
                        name="customFeature"
                        id="customFeature"
                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-600 bg-gray-700 text-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        placeholder="e.g., Voice recognition"
                        value={customFeature}
                        onChange={(e) => setCustomFeature(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addCustomFeature()}
                    />
                    <button
                        type="button"
                        className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-100 bg-teal-600 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                        onClick={addCustomFeature}
                    >
                        Add
                    </button>
                </div>
            </div>

            {selectedFeatures.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-300">Selected Features:</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {selectedFeatures.map((feature, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-900 text-teal-100"
                            >
                                {FEATURE_OPTIONS.find(f => f.id === feature)?.label || feature}
                                <button
                                    type="button"
                                    className="ml-1.5 inline-flex text-teal-300 hover:text-teal-100"
                                    onClick={() => setSelectedFeatures(selectedFeatures.filter((_, i) => i !== index))}
                                >
                                    &times;
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-between mt-8">
                <button
                    className="px-6 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
                    onClick={prevStep}
                >
                    Back
                </button>
                <button
                    className="px-6 py-2 bg-teal-600 text-gray-100 rounded-md hover:bg-blue-600 transition-colors"
                    onClick={handleContinue}
                >
                    Find My Tool
                </button>
            </div>
        </div>
    );
};

const ResultsStep = ({ wizardData, resetWizard }) => {
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // Fetch recommendation when component mounts
    useEffect(() => {
        const fetchRecommendation = async () => {
            try {
                setLoading(true);

                const response = await fetch('/api/recommend-tool', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(wizardData)
                });

                if (!response.ok) {
                    throw new Error('Failed to get recommendation');
                }

                const data = await response.json();
                setResult(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendation();
    }, [wizardData]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 border-4 border-teal-400 border-t-teal-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-lg text-gray-400">Finding the perfect tool for you...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-red-500 text-5xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold mb-2 text-gray-300">Oops! Something went wrong</h3>
                <p className="text-gray-400 mb-6">{error}</p>
                <button
                    onClick={resetWizard}
                    className="px-6 py-2 bg-teal-600 text-gray-100 rounded-md hover:bg-blue-600 transition-colors"
                >
                    Start Over
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                </div>
                <p className="text-sm text-gray-500 mt-2 text-center">Step 5 of 5</p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-300">Your Recommended Tool</h2>

            {result && (
                <div className="border border-teal-600 rounded-lg p-6 bg-cardDark">
                    <h3 className="text-xl font-bold mb-4 text-gray-300">{result.recommendedTool}</h3>

                    <h4 className="font-semibold mt-4 text-gray-300">Why it's perfect for you:</h4>
                    <ul className="list-disc pl-5 mt-2 text-gray-400">
                        {result.reasons.map((reason, i) => (
                            <li key={i}>{reason}</li>
                        ))}
                    </ul>

                    <h4 className="font-semibold mt-4 text-gray-300">Things to consider:</h4>
                    <ul className="list-disc pl-5 mt-2 text-gray-400">
                        {result.limitations.map((limitation, i) => (
                            <li key={i}>{limitation}</li>
                        ))}
                    </ul>

                    {result.alternatives && result.alternatives.length > 0 && (
                        <>
                            <h4 className="font-semibold mt-4 text-gray-300">Other options to explore:</h4>
                            <ul className="list-disc pl-5 mt-2 text-gray-400">
                                {result.alternatives.map((alt, i) => (
                                    <li key={i}>
                                        <span className="font-medium text-gray-300">{alt.name}</span> - {alt.key_benefit}
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}

                    <div className="mt-6 flex flex-col sm:flex-row gap-4">
                        <Link
                            href={`/tool/${result.slug || encodeURIComponent(result.recommendedTool.toLowerCase().replace(/\s+/g, '-'))}`}
                            className="px-6 py-2 bg-teal-600 text-gray-100 rounded-md text-center hover:bg-blue-600 transition-colors"
                        >
                            View Tool Details
                        </Link>
                        <button
                            onClick={resetWizard}
                            className="px-6 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
                        >
                            Start Over
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function ToolFinder() {
    const [currentStep, setCurrentStep] = useState(0);
    const [wizardData, setWizardData] = useState({
        userGoals: null,
        experienceLevel: null,
        priorities: [],
        requiredFeatures: []
    });

    const updateWizardData = (key, value) => {
        setWizardData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const nextStep = () => setCurrentStep(currentStep + 1);
    const prevStep = () => setCurrentStep(currentStep - 1);
    const resetWizard = () => {
        setWizardData({
            userGoals: null,
            experienceLevel: null,
            priorities: [],
            requiredFeatures: []
        });
        setCurrentStep(0);
    };

    // Render the appropriate step based on currentStep
    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <GoalsStep
                        data={wizardData.userGoals}
                        updateData={(value) => updateWizardData('userGoals', value)}
                        nextStep={nextStep}
                    />
                );
            case 1:
                return (
                    <ExperienceStep
                        data={wizardData.experienceLevel}
                        updateData={(value) => updateWizardData('experienceLevel', value)}
                        nextStep={nextStep}
                        prevStep={prevStep}
                    />
                );
            case 2:
                return (
                    <PrioritiesStep
                        data={wizardData.priorities}
                        updateData={(value) => updateWizardData('priorities', value)}
                        nextStep={nextStep}
                        prevStep={prevStep}
                    />
                );
            case 3:
                return (
                    <FeaturesStep
                        data={wizardData.requiredFeatures}
                        updateData={(value) => updateWizardData('requiredFeatures', value)}
                        nextStep={nextStep}
                        prevStep={prevStep}
                    />
                );
            case 4:
                return (
                    <ResultsStep
                        wizardData={wizardData}
                        resetWizard={resetWizard}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8 text-center text-gray-300">
                Find Your Perfect AI Tool
            </h1>
            {renderStep()}
        </div>
    );
}
