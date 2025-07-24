import React from "react";

/**
 * A component that renders a group of filter buttons.
 * @param {object} props
 * @param {string} props.title - The title of the filter group.
 * @param {string[]} props.options - The array of filter options to display as buttons.
 * @param {string[]} props.selectedOptions - The array of currently selected options.
 * @param {(option: string) => void} props.onSelect - The callback function to execute when an option is selected.
 */
const FilterButtonGroup = ({ title, options, selectedOptions, onSelect }) => (
    <>
        <h2 className="text-xl text-headingWhite font-bold mb-2">{title}</h2>
        <div className="w-full border border-gray-700 p-4 rounded-lg bg-cardDark mb-6">
            {options.map((option) => (
                <button
                    key={option}
                    onClick={() => onSelect(option)}
                    className={
                        selectedOptions.includes(option)
                            ? "px-2 py-2 text-accentGreen font-semibold"
                            : "px-2 py-2 hover:text-headingWhite transition"
                    }
                >
                    {option}
                </button>
            ))}
        </div>
    </>
);

export default FilterButtonGroup;