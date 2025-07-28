import React, { useReducer, useMemo, useState, useEffect } from "react";
import { getAllTools } from "@/lib/shared/tools";
import { getAllAliases } from "@/lib/shared/aliases";
import { useCaseReducer, getInitialState, toggleSelection, getSortedFilterOptions } from "@/lib/useCaseUtils";
import { matchTools } from "@/lib/matchTools";

import CompareBar from "@/components/CompareBar";
import UseCasesToolCard from "@/components/UseCaseCard";
import MetaProps from "@/components/MetaProps";

export async function getStaticProps() {
    const allTools = await getAllTools();
    const allAliases = await getAllAliases();

    return {
        props: {
            allTools,
            allAliases,
        },
        revalidate: 300,
    };
}

export default function UseCasePage({ allTools, allAliases }) {
    const {
        useCases: USE_CASES,
        contexts: CONTEXTS,
        modalities: MODALITIES,
        preferences: PREFERENCES,
    } = useMemo(() => getSortedFilterOptions(allAliases), [allAliases]);

    const [state, dispatch] = useReducer(
        useCaseReducer,
        undefined,
        getInitialState,
    );
    const [compareList, setCompareList] = useState([]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            sessionStorage.setItem("useCaseState", JSON.stringify(state));
        }
    }, [state]);

    const matchedTools = useMemo(() => {
        const matches = matchTools(allTools, state, allAliases);
        const sortedMatches = [...matches].sort((a, b) =>
            a.Name.localeCompare(b.Name),
        );
        return sortedMatches;
    }, [allTools, state, allAliases]);

    const isAnyFilterActive = useMemo(() => {
        return (
            state.useCases.length > 0 ||
            state.modalities.length > 0 ||
            state.preferences.length > 0 ||
            state.contexts.length > 0
        );
    }, [state]);

    const toggleCompare = (tool) => {
        setCompareList((prev) => {
            const exists = prev.find((t) => t.id === tool.id);
            let newState;
            if (exists) {
                newState = prev.filter((t) => t.id !== tool.id);
            } else {
                newState = prev.length < 2 ? [...prev, tool] : prev;
            }
            return newState;
        });
    };

    const handleResetFilters = () => {
        dispatch({ type: "RESET" });
        setCompareList([]);
    };

    return (
        <>
            <MetaProps
                title={`Find the top AI tool for marketing, writing, content creation, solopreneurs`}
                description={`Search by profession and use case to find the right AI tool for you.`}
                url={`https://aitoolpouch.com/usecases`}
            />
            <div className="w-full mb-6">
                <CompareBar
                    compareList={compareList}
                    toggleCompare={toggleCompare}
                />
            </div>
            <div className="w-full lg:w-[80%] mx-auto grid grid-cols-1 md:grid-cols-[40%_60%] gap-6">
                {/* Top row: spans both columns */}
                <div className="md:col-span-2">
                    <div>
                        <h1 className="text-2xl text-gray-100 font-bold mb-4">
                            Alignment By Use Case | Task | Project
                        </h1>
                        <div>
                            <h1 className="text-gray-400 mb-4">
                                Answer Questions To Quickly Match A Tool To Your
                                Needs
                            </h1>
                        </div>

                    </div>
                </div>

                {/* Left column */}
                <div className="flex flex-col">
                    {/* Use Case */}
                    <h1 className="text-xl text-gray-100 font-bold mb-2">
                        💡 What's your use case? What do you want to do?
                    </h1>
                    <div className="w-full text-gray-400 border border-gray-700 p-4 rounded-lg bg-cardDark mb-6">
                        {USE_CASES.map((useCase) => (
                            <button
                                key={useCase}
                                onClick={() => {
                                    console.log(
                                        `[UseCasePage] Use Case selected: "${useCase}"`,
                                    );
                                    dispatch({
                                        type: "SET_USE_CASES",
                                        payload: toggleSelection(
                                            state.useCases,
                                            useCase,
                                        ),
                                    });
                                }}
                                className={
                                    state.useCases.includes(useCase)
                                        ? "px-2 py-2 text-emerald-400 font-semibold"
                                        : "px-2 py-2 hover:text-gray-100 transition"
                                }
                            >
                                {useCase}
                            </button>
                        ))}
                    </div>
                    {/* Modality Selection */}
                    <h1 className="text-xl text-gray-100 font-bold mb-2">
                        🧩 Are you working with data? What format is it in?
                    </h1>
                    <div className="w-full text-gray-400 border border-gray-600 p-4 rounded-lg bg-cardDark mb-6">
                        {MODALITIES.map((modality) => (
                            <button
                                key={modality}
                                onClick={() => {
                                    console.log(
                                        `[UseCasePage] Modality selected: "${modality}"`,
                                    );
                                    dispatch({
                                        type: "SET_MODALITIES",
                                        payload: toggleSelection(
                                            state.modalities,
                                            modality,
                                        ),
                                    });
                                }}
                                className={
                                    state.modalities.includes(modality)
                                        ? "px-2 py-2 text-emerald-400 font-semibold"
                                        : "px-2 py-2 hover:text-gray-300 transition"
                                }
                            >
                                {modality}
                            </button>
                        ))}
                    </div>
                    {/* Preferences */}
                    <h1 className="text-xl text-gray-100 font-bold mb-2">
                        ⚙️ Do you have preferences or constraints you'd like to
                        add?
                    </h1>
                    <div className="w-full text-gray-400 border border-gray-600 p-4 rounded-lg bg-cardDark mb-6">
                        {PREFERENCES.map((pref) => (
                            <button
                                key={pref}
                                onClick={() => {
                                    console.log(
                                        `[UseCasePage] Preference selected: "${pref}"`,
                                    );
                                    dispatch({
                                        type: "SET_PREFERENCES",
                                        payload: toggleSelection(
                                            state.preferences,
                                            pref,
                                        ),
                                    });
                                }}
                                className={
                                    state.preferences.includes(pref)
                                        ? "px-2 py-2 text-emerald-400 font-semibold"
                                        : "px-2 py-2 hover:text-gray-100 transition"
                                }
                            >
                                {pref}
                            </button>
                        ))}
                    </div>
                    {/* Professional Context */}
                    <h1 className="text-xl text-gray-100 font-bold mb-2">
                        ✨ Would you like results that are aligned to a
                        profession?
                    </h1>
                    <div className="w-full text-gray-400 border border-gray-700 p-4 rounded-lg bg-cardDark mb-6">
                        {CONTEXTS.map((context) => (
                            <button
                                key={context}
                                onClick={() => {
                                    console.log(
                                        `[UseCasePage] Context selected: "${context}"`,
                                    );
                                    dispatch({
                                        type: "SET_CONTEXT",
                                        payload: toggleSelection(
                                            state.contexts,
                                            context,
                                        ),
                                    });
                                }}
                                className={
                                    state.contexts.includes(context)
                                        ? "px-2 py-2 text-emerald-400 font-semibold"
                                        : "px-2 py-2 hover:text-gray-100 transition"
                                }
                            >
                                {context}
                            </button>
                        ))}
                    </div>
                </div>
                {/* Right column */}

                <div className="flex flex-col lg:px-6">
                    {matchedTools.length > 0 ? (
                        // Case 1: Tools are found
                        <>
                            {console.log(
                                "[UseCasePage] Displaying matched tools results.",
                            )}
                            <h1 className="text-xl text-gray-100 font-bold mb-4">
                                🧠 Your Results
                            </h1>
                            <div>
                                <button
                                    supressHydrationWarning
                                    onClick={handleResetFilters}
                                    className="bg-emerald-500 text-gray-100 hover:bg-emerald-600 font-semibold py-2 px-4 rounded-lg text-lg transition-colors mb-4"
                                >
                                    Reset Filters
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {matchedTools.map((tool) => (
                                    <UseCasesToolCard
                                        key={tool.id}
                                        tool={tool}
                                        compareList={compareList}
                                        toggleCompare={toggleCompare}
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        // Case 2: No tools found, but differentiate between "no selection" and "no match"
                        <>
                            {isAnyFilterActive ? (
                                // Sub-case 2a: Filters are active, but no tools match
                                <>
                                    {console.log(
                                        "[UseCasePage] Displaying 'Nothing Found' (filters active).",
                                    )}
                                    <h1 className="text-xl text-gray-100 font-bold mb-4">
                                        🧠 Your Results
                                    </h1>
                                    <div>
                                        <button
                                            supressHydrationWarning
                                            onClick={handleResetFilters}
                                            className="bg-emerald-500 hover:bg-emraild-600 text-gray-100 font-semibold py-2 px-4 rounded-lg text-lg transition-colors mb-4"
                                        >
                                            Reset Filters
                                        </button>
                                    </div>
                                    <div className="flex flex-col border border-gray-700 p-6 rounded-lg bg-cardDark">
                                        <p>
                                            Nothing found. Try adjusting your
                                            selections!
                                        </p>
                                    </div>
                                </>
                            ) : (
                                // Sub-case 2b: No filters are active, show original instructions
                                <>
                                    {console.log(
                                        "[UseCasePage] Displaying instructions (no filters active).",
                                    )}
                                    <h1 className="text-xl text-gray-100 font-bold mb-2">
                                        {" "}
                                        🌐 Instructions
                                    </h1>
                                    <div className="w-full border border-gray-700 p-6 rounded-lg bg-cardDark">
                                        <p className="text-gray-400">
                                            Answer at least 1 of the questions
                                            to get started. You're not required
                                            to answer every question. Each
                                            question can have multiple answers.
                                            Apply as many filters in any
                                            combination you wish, but remember -
                                            The amount of context you add
                                            impacts the results. Enjoy.
                                        </p>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
