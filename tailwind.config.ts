import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        accent: "var(--accent-hex)",
        "accent-l": "var(--accent-l-hex)",
      },
    },
  },
  plugins: [],
};

export default config;
