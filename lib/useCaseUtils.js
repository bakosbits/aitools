export const initialUseCaseState = {
  useCases: [],
  modalities: [],
  preferences: [],
  contexts: [],
};

export function useCaseReducer(state, action) {
  switch (action.type) {
    case "SET_USE_CASES":
      return { ...state, useCases: action.payload };
    case "SET_MODALITIES":
      return { ...state, modalities: action.payload };
    case "SET_PREFERENCES":
      return { ...state, preferences: action.payload };
    case "SET_CONTEXT":
      return { ...state, contexts: action.payload };
    case "RESET":
      return initialUseCaseState;
    default:
      return state;
  }
}

export function toggleSelection(array, value) {
  return array.includes(value)
    ? array.filter((v) => v !== value)
    : [...array, value];
}

export function getInitialState() {
  if (typeof window === "undefined") {
    return initialUseCaseState;
  }

  try {
    const savedState = sessionStorage.getItem("useCaseState");
    if (savedState) {
      const parsedState = JSON.parse(savedState);

      // Basic validation to ensure the stored state is in the correct shape
      if (
        typeof parsedState === "object" &&
        parsedState !== null &&
        Array.isArray(parsedState.useCases) &&
        Array.isArray(parsedState.modalities) &&
        Array.isArray(parsedState.preferences) &&
        Array.isArray(parsedState.contexts)
      ) {
        return parsedState;
      }
    }
  } catch (error) {
    console.error(
      "[getInitialState] Error reading from sessionStorage:",
      error,
    );
  }
  return initialUseCaseState;
}

export function getSortedFilterOptions(allAliases) {
  const getSortedKeys = (key) =>
    Object.keys(allAliases[key] || {}).sort((a, b) => a.localeCompare(b));

  return {
    useCases: getSortedKeys("UseCases"),
    contexts: getSortedKeys("Contexts"),
    modalities: getSortedKeys("Modalities"),
    preferences: getSortedKeys("Preferences"),
  };
}
