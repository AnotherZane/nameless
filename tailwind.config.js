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
        },
        accent: {
          base: ACCENT,
          main: alpha(ACCENT, 0.7),
          light: alpha(ACCENT, 0.5),
          dark: alpha(ACCENT, 0.9),
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
