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

    const isMatch = selectedItems.every((item) => {
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

    if (
        !useCases.length &&
        !modalities.length &&
        !preferences.length &&
        !contexts.length
    ) {
        return [];
    }

    const USE_CASE_ALIASES = allAliases["UseCases"] || {};
    const CONTEXT_ALIASES = allAliases["Contexts"] || {};
    const MODALITY_ALIASES = allAliases["Modalities"] || {};
    const PREFERENCES_ALIASES = allAliases["Preferences"] || {};

    return tools
        .map((tool) => {
            let score = 0;

            const standardSearchFields = ["Features", "Why", "Details", "Description"];

            const useCaseResult = checkAndScoreCategory({
                tool,
                selectedItems: useCases,
                aliasMap: USE_CASE_ALIASES,
                fieldsToSearch: standardSearchFields,
                scoreValue: 3.5,
            });

            const modalityResult = checkAndScoreCategory({
                tool,
                selectedItems: modalities,
                aliasMap: MODALITY_ALIASES,
                fieldsToSearch: standardSearchFields,
                scoreValue: 2.5,
            });

            const preferenceResult = checkAndScoreCategory({
                tool,
                selectedItems: preferences,
                aliasMap: PREFERENCES_ALIASES,
                fieldsToSearch: [...standardSearchFields, "Pricing"],
                scoreValue: 2,
            });

            score += useCaseResult.score + modalityResult.score + preferenceResult.score;

            // --- FIX: CONTEXT MATCHING LOGIC ---
            let matchedContext = true;
            if (contexts.length) { // Check if contexts filters are active
                matchedContext = contexts.every((cx) => {
                    const aliases = CONTEXT_ALIASES[cx] ? [cx, ...CONTEXT_ALIASES[cx]] : [cx];

                    // Check if any of the tool's assigned Categories (professions/contexts)
                    // match the selected context term or its aliases.
                    const hasContextMatch = tool.Categories?.some(category =>
                        aliases.some(alias => normalize(category.Name).includes(normalize(alias)))
                    );

                    return hasContextMatch;
                });
                if (matchedContext) {
                    score += 2;
                }
            }
            // --- FIX ---

            const matches =
                useCaseResult.matched &&
                modalityResult.matched &&
                preferenceResult.matched &&
                matchedContext;

            return matches ? { ...tool, matchScore: score } : null;
        })
        .filter(Boolean)
        .sort((a, b) => b.matchScore - a.matchScore);
}