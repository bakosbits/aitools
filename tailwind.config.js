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
        brandDark: "#3F3F44",
        brandLight: "#F7F7F7",
        apocalypse: "#39FF14",
        grayText: "#9CA3AF",
        headingWhite: "#FFFFFF",
        backgroundDark: "#1F2937",
        accentGreen: "#58FF8C", // Zombie green
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
