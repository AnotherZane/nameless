/** @type {import('tailwindcss').Config} */
import { alpha } from '@mui/material';

const primary = "#e6cca3";
const accent = "#9798E6";

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  important: '#root',
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
