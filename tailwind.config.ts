import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        burgundy: {
          DEFAULT: "#800020",
          light: "#a6002a",
          dark: "#5a0016",
        },
        gold: {
          DEFAULT: "#B8860B",
          light: "#daa520",
          dark: "#8b6914",
        },
      },
    },
  },
  plugins: [],
};
export default config;
