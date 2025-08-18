/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./context/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                cardDark: "#2C3340", // rich slate-gray
            },

            fontFamily: {
                sans: ["Inter", "sans-serif"], // default override
                heading: ["Inter", "sans-serif"], // for headings
                body: ["Inter", "sans-serif"], // for consistency
            },
        },
    },
    plugins: [require("@tailwindcss/typography")],
};
