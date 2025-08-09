const normalize = (str) => str.toLowerCase().replace(/\s+/g, "-");

const includesIgnoreCase = (field, value) => {
    if (!field || !value) return false;
    const normalizedValue = normalize(value);
    if (Array.isArray(field)) {
        return field.some((item) =>
            normalize(item).includes(normalizedValue),
        );
    }
    return normalize(field).includes(normalizedValue);
};

const checkAndScoreCategory = ({
    tool,
    selectedItems,
    aliasMap,
    fieldsToSearch,
    scoreValue,
}) => {
    if (!selectedItems.length) {
        return { matched: true, score: 0 };
    }

    const isMatch = selectedItems.some((item) => {
        const aliases = aliasMap[item] ? [item, ...aliasMap[item]] : [item];
        return aliases.some((alias) =>
            fieldsToSearch.some((field) =>
                includesIgnoreCase(tool[field], alias),
            ),
        );
    });

    return {
        matched: isMatch,
        score: isMatch ? scoreValue : 0,
    };
};

export function matchTools(tools, useCaseState, allAliases) {
    const { useCases, modalities, preferences, contexts } = useCaseState;

    console.log("--- matchTools execution start ---");
    console.log("useCaseState:", useCaseState);
    console.log("allAliases (first level keys):", Object.keys(allAliases));

    if (
        !useCases.length &&
        !modalities.length &&
        !preferences.length &&
        !contexts.length
    ) {
        console.log("No filters active, returning empty array.");
        return [];
    }

    const USE_CASE_ALIASES = allAliases["UseCases"] || {};
    const CONTEXT_ALIASES = allAliases["Contexts"] || {};
    const MODALITY_ALIASES = allAliases["Modalities"] || {};
    const PREFERENCES_ALIASES = allAliases["Preferences"] || {};

    console.log("USE_CASE_ALIASES keys:", Object.keys(USE_CASE_ALIASES));
    console.log("CONTEXT_ALIASES keys:", Object.keys(CONTEXT_ALIASES));
    console.log("MODALITY_ALIASES keys:", Object.keys(MODALITY_ALIASES));
    console.log("PREFERENCES_ALIASES keys:", Object.keys(PREFERENCES_ALIASES));


    return tools
        .map((tool) => {
            let score = 0;
            console.log("\n--- Processing tool:", tool.Name, "---");

            const standardSearchFields = ["Features", "Why", "Details", "Description"];

            const useCaseResult = checkAndScoreCategory({
                tool,
                selectedItems: useCases,
                aliasMap: USE_CASE_ALIASES,
                fieldsToSearch: standardSearchFields,
                scoreValue: 3.5,
            });
            console.log("useCaseResult for", tool.Name, ":", useCaseResult);


            const modalityResult = checkAndScoreCategory({
                tool,
                selectedItems: modalities,
                aliasMap: MODALITY_ALIASES,
                fieldsToSearch: standardSearchFields,
                scoreValue: 2.5,
            });
            console.log("modalityResult for", tool.Name, ":", modalityResult);


            const preferenceResult = checkAndScoreCategory({
                tool,
                selectedItems: preferences,
                aliasMap: PREFERENCES_ALIASES,
                fieldsToSearch: [...standardSearchFields, "Pricing"],
                scoreValue: 2,
            });
            console.log("preferenceResult for", tool.Name, ":", preferenceResult);


            score += useCaseResult.score + modalityResult.score + preferenceResult.score;

            // --- FIX: CONTEXT MATCHING LOGIC ---
            let matchedContext = true;
            if (contexts.length) { // Check if contexts filters are active
                console.log("Checking contexts for", tool.Name, ". Selected contexts:", contexts);
                matchedContext = contexts.some((cx) => {
                    const aliases = CONTEXT_ALIASES[cx] ? [cx, ...CONTEXT_ALIASES[cx]] : [cx];
                    console.log("  - Current context (cx):", cx, "Aliases:", aliases);
                    console.log("  - Tool Categories:", tool.Categories);

                    // Check if any of the tool's assigned Categories (professions/contexts)
                    // match the selected context term or its aliases.
                    const hasContextMatch = tool.Categories?.some(category => {
                        const categoryNameNormalized = normalize(category.Name);
                        const aliasMatch = aliases.some(alias => {
                            const normalizedAlias = normalize(alias);
                            const includes = categoryNameNormalized.includes(normalizedAlias);
                            console.log("    - Comparing category:", category.Name, "(", categoryNameNormalized, ") with alias:", alias, "(", normalizedAlias, "). Includes:", includes);
                            return includes;
                        });
                        return aliasMatch;
                    });
                    console.log("  - hasContextMatch for", cx, ":", hasContextMatch);
                    return hasContextMatch;
                });
                if (matchedContext) {
                    score += 2;
                }
                console.log("Final matchedContext for", tool.Name, ":", matchedContext);
            }
            // --- FIX ---

            const matches =
                useCaseResult.matched &&
                modalityResult.matched &&
                preferenceResult.matched &&
                matchedContext;

            console.log("Final matches for", tool.Name, ":", matches, "Total Score:", score);
            return matches ? { ...tool, matchScore: score } : null;
        })
        .filter(Boolean)
        .sort((a, b) => b.matchScore - a.matchScore);
}