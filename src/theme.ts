import { alpha, createTheme, getContrastRatio } from "@mui/material";

import DIN_Regular_400_WOFF2 from "./fonts/DIN/DIN_Regular_400.woff2";
import DIN_Regular_400_WOFF from "./fonts/DIN/DIN_Regular_400.woff";
import DIN_Regular_400_TTF from "./fonts/DIN/DIN_Regular_400.ttf";
import DIN_Medium_500_WOFF2 from "./fonts/DIN/DIN_Medium_500.woff2";
import DIN_Medium_500_WOFF from "./fonts/DIN/DIN_Medium_500.woff";
import DIN_Medium_500_TTF from "./fonts/DIN/DIN_Medium_500.ttf";
import DIN_Bold_700_WOFF2 from "./fonts/DIN/DIN_Bold_700.woff2";
import DIN_Bold_700_WOFF from "./fonts/DIN/DIN_Bold_700.woff";
import DIN_Bold_700_TTF from "./fonts/DIN/DIN_Bold_700.ttf";
// import DIN_Black_900_WOFF2 from "./fonts/DIN/DIN_Black_900.woff2";
// import DIN_Black_900_WOFF from "./fonts/DIN/DIN_Black_900.woff";
// import DIN_Black_900_TTF from "./fonts/DIN/DIN_Black_900.ttf";

const primary = "#e6cca3";
const accent = "#9798E6";

declare module "@mui/material/styles" {
  interface Palette {
    accent: Palette["primary"];
  }

  interface PaletteOptions {
    accent?: PaletteOptions["primary"];
  }
}

const createAstralTheme = (
  rootElement: HTMLElement | null,
  darkMode = true
) => {
  // Set dark attribute to let tailwind know it should use dark variants of colors
  if (darkMode) {
    rootElement?.setAttribute("class", "dark");
  } else {
    rootElement?.setAttribute("class", "");
  }

  return createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: primary,
        light: alpha(primary, 0.5),
        dark: alpha(primary, 0.9),
        contrastText:
          getContrastRatio(primary, "#fff") > 4.5 ? "#fefdfb" : "#121212",
      },
      secondary: {
        main: darkMode ? "#1d1d1d" : "#e9e9e9",
      },
      // Usage: https://mui.com/material-ui/customization/palette/#provide-tokens-manually:~:text=To%20use%20a,a%20Button%20component%3A
      accent: {
        main: accent,
        light: alpha(accent, 0.5),
        dark: alpha(accent, 0.9),
        contrastText:
          getContrastRatio(accent, "#fff") > 4.5 ? "#fefdfb" : "#121212",
      },
      text: {
        primary: darkMode ? "#fefdfb" : "#121212",
      },
      background: {
        default: darkMode ? "#121212" : "#fefdfb",
        paper: darkMode ? "#121212" : "#fefdfb",
      },
    },
    typography: {
      fontFamily: '"DIN", "Helvetica", sans-serif',
      h1: {
        fontFamily: '"Montserrat", "DIN", "Helvetica", sans-serif',
        fontWeight: 500,
      },
      h2: {
        fontFamily: '"Montserrat", "DIN", "Helvetica", sans-serif',
        fontWeight: 500,
      },
      h3: {
        fontFamily: '"Montserrat", "DIN", "Helvetica", sans-serif',
        fontWeight: 500,
      },
      h4: {
        fontFamily: '"Montserrat", "DIN", "Helvetica", sans-serif',
        fontWeight: 500,
      },
      h5: {
        fontFamily: '"Montserrat", "DIN", "Helvetica", sans-serif',
        fontWeight: 500,
      },
      h6: {
        fontFamily: '"Montserrat", "DIN", "Helvetica", sans-serif',
        fontWeight: 500,
      },
      button: {
        textTransform: "none",
      },

      // We don't have a light version of DIN, 400 should be fine
      fontWeightLight: 400,
    },
    // spacing: 1,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          a: {
            color: darkMode ? primary : accent,
            textDecoration: "none",
          },
          "a:hover": {
            textDecoration: "underline",
          },
          body: {
            margin: "0 5%",
          },
          "@media (min-width: 640px)": {
            body: {
              margin: "0 5%",
            },
          },
          "@media (min-width: 768px)": {
            body: {
              margin: "0 5%",
            },
          },
          "@media (min-width: 1024px)": {
            body: {
              margin: "0 7.5%",
            },
          },
          "@media (min-width: 1280px)": {
            body: {
              margin: "0 8%",
            },
          },
          "@media (min-width: 1536px)": {
            body: {
              margin: "0 10%",
            },
          },
          // DIN Regular 400
          "@font-face": {
            fontFamily: '"DIN"',
            fontDisplay: "swap",
            fontStyle: "normal",
            fontWeight: 400,
            src: `local('DIN'), local('DIN-Regular'),
                  url(${DIN_Regular_400_WOFF2}) format('woff2'),
                  url(${DIN_Regular_400_WOFF}) format('woff'),
                  url(${DIN_Regular_400_TTF}) format('truetype')`,
          },
          h1: {
            fontFamily: '"Montserrat", "DIN", "Helvetica", sans-serif',
          },
          h2: {
            fontFamily: '"Montserrat", "DIN", "Helvetica", sans-serif',
          },
          h3: {
            fontFamily: '"Montserrat", "DIN", "Helvetica", sans-serif',
          },
          h4: {
            fontFamily: '"Montserrat", "DIN", "Helvetica", sans-serif',
          },
          h5: {
            fontFamily: '"Montserrat", "DIN", "Helvetica", sans-serif',
          },
          h6: {
            fontFamily: '"Montserrat", "DIN", "Helvetica", sans-serif',
          },
          fallbacks: [
            {
              // DIN Medium 500
              "@font-face": {
                fontFamily: '"DIN"',
                fontDisplay: "swap",
                fontStyle: "normal",
                fontWeight: 500,
                src: `local('DIN Medium'), local('DIN-Medium'),
                      url(${DIN_Medium_500_WOFF2}) format('woff2'),
                      url(${DIN_Medium_500_WOFF}) format('woff'),
                      url(${DIN_Medium_500_TTF}) format('truetype')`,
              },
            },
            {
              // DIN Bold 700
              "@font-face": {
                fontFamily: '"DIN"',
                fontDisplay: "swap",
                fontStyle: "normal",
                fontWeight: 700,
                src: `local('DIN Bold'), local('DIN-Bold'),
                      url(${DIN_Bold_700_WOFF2}) format('woff2'),
                      url(${DIN_Bold_700_WOFF}) format('woff'),
                      url(${DIN_Bold_700_TTF}) format('truetype')`,
              },
            },
            // {
            //   // DIN Black 900
            //   "@font-face": {
            //     fontFamily: "DIN",
            //     fontDisplay: "swap",
            //     fontStyle: "normal",
            //     fontWeight: 900,
            //     src: `local('DIN Black'), local('DIN-Black'),
            //           url(${DIN_Black_900_WOFF2}) format('woff2'),
            //           url(${DIN_Black_900_WOFF}) format('woff'),
            //           url(${DIN_Black_900_TTF}) format('truetype')`,
            //   },
            // },
          ],
        },
      },
      // Ensure that tailwind can affect these elements
      // https://mui.com/material-ui/guides/interoperability/#tailwind-css:~:text=Change%20the%20target,the%20Tailwind%20config.
      MuiPopover: {
        defaultProps: {
          container: rootElement,
        },
      },
      MuiPopper: {
        defaultProps: {
          container: rootElement,
        },
      },
      MuiDialog: {
        defaultProps: {
          container: rootElement,
        },
      },
      MuiModal: {
        defaultProps: {
          container: rootElement,
        },
      },
      MuiAccordion: {
        defaultProps: {
          sx: {
                ":before": {
                  backgroundColor: "transparent",
                  top: 0,
                  height: 0,
                  opacity: 0,
                },
                boxShadow: "unset",
                backgroundImage: "unset",
                borderBottom: darkMode ? "1px solid rgba(245, 245, 245, 0.2)" : "1px solid rgba(18, 18, 18, 0.2)",
              },
        },
      },
    },
  });
};

export { createAstralTheme };
