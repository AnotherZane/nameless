/** @type {import('tailwindcss').Config} */
import { alpha } from "@mui/material";

const PRIMARY = "#e6cca3";
const ACCENT = "#9798E6";

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],

  // Make sure that tailwind can override mui
  important: "#root",

  // Use dark mode based on a 'dark' class on the root element
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          base: PRIMARY,
          main: alpha(PRIMARY, 0.7),
          light: alpha(PRIMARY, 0.5),
          dark: alpha(PRIMARY, 0.9),
          50: "#fbf8f1",
          100: "#f6eede",
          200: "#eddbbb",
          300: "#e6cca3",
          400: "#d4a163",
          500: "#ca8845",
          600: "#bc733a",
          700: "#9d5c31",
          800: "#7e4a2e",
          900: "#663e28",
          950: "#371f13",
        },
        accent: {
          base: ACCENT,
          main: alpha(ACCENT, 0.7),
          light: alpha(ACCENT, 0.5),
          dark: alpha(ACCENT, 0.9),
          50: "#f1f2fc",
          100: "#e5e8fa",
          200: "#d0d4f5",
          300: "#b3b8ee",
          400: "#9798e6",
          500: "#7f79db",
          600: "#6e5fcc",
          700: "#5f4fb3",
          800: "#4d4291",
          900: "#423b74",
          950: "#282343",
        },
        secondary: {
          light: "#e9e9e9",
          dark: "#1d1d1d",
        },
        txt: {
          light: "#fefdfb",
          dark: "#121212",
        },
        paper: {
          light: "#fefdfb",
          dark: "#121212",
        },
      },
    },

    // Set default font family
    fontFamily: {
      sans: ["DIN", "Helvetica", "sans-serif"],
    },
  },
  plugins: [],
  corePlugins: {
    // Remove the Tailwind CSS preflight styles so it can use Material UI's preflight instead (CssBaseline).
    preflight: false,
  },
};
