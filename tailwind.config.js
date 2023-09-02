/** @type {import('tailwindcss').Config} */
import { alpha } from '@mui/material';

const primary = "#e6cca3";
const accent = "#9798E6";

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  important: '#root',
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          base: primary,
          main: alpha(primary, 0.7),
          light: alpha(primary, 0.5),
          dark: alpha(primary, 0.9),
        },
        accent: {
          base: accent,
          main: alpha(accent, 0.7),
          light: alpha(accent, 0.5),
          dark: alpha(accent, 0.9),
        },
        secondary: {
          light: "#e9e9e9",
          dark: "#1d1d1d"
        },
        txt: {
          light: "#fefdfb",
          dark: "#121212"
        },
        paper: {
          light: "#fefdfb",
          dark: "#121212"
        }
      }
    },
    fontFamily: {
      sans: ['DIN', 'Helvetica', 'sans-serif'],
    },
  },
  plugins: [],
  corePlugins: {
    // Remove the Tailwind CSS preflight styles so it can use Material UI's preflight instead (CssBaseline).
    preflight: false,
  },
};
