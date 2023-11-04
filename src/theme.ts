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

const PRIMARY = "#e6cca3";
const ACCENT = "#9798E6";

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
  // Set dark class attribute to let tailwind know it should use dark variants of colors
  if (darkMode) {
    rootElement?.setAttribute("class", "dark");
  } else {
    rootElement?.setAttribute("class", "");
  }

  return createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: PRIMARY,
        light: alpha(PRIMARY, 0.5),
        dark: alpha(PRIMARY, 0.9),
        contrastText:
          getContrastRatio(PRIMARY, "#fff") > 4.5 ? "#fefdfb" : "#121212",
      },
      secondary: {
        main: darkMode ? "#1d1d1d" : "#e9e9e9",
      },

      // Custom color variants
      // Usage: https://mui.com/material-ui/customization/palette/#provide-tokens-manually:~:text=To%20use%20a,a%20Button%20component%3A
      accent: {
        main: ACCENT,
        light: alpha(ACCENT, 0.5),
        dark: alpha(ACCENT, 0.9),
        contrastText:
          getContrastRatio(ACCENT, "#fff") > 4.5 ? "#fefdfb" : "#121212",
      },
      text: {
        primary: darkMode ? "#fefdfb" : "#121212",
      },
      background: {
        default: darkMode ? "#121212" : "#fefdfb",
        paper: darkMode ? "#121212" : "#fefdfb",
      },
    },

    // Set default fonts and weights
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

      // Disable mui text transformation to uppercase
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
            // Default highlight color
            color: darkMode ? PRIMARY : ACCENT,
            // No underline
            textDecoration: "none",
          },

          // Underline on hover
          "a:hover": {
            textDecoration: "underline",
          },

          // Set default height to 100%
          html: {
            height: "100%",
          },
          body: {
            height: "100%",
          },
          "#root": {
            height: "100%",

            // Scroll on the #root element
            overflow: "auto",
          },

          // Custom scrollbar
          "#root::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
            display: "none",
          },
          "#root::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "#root::-webkit-scrollbar-thumb": {
            background: darkMode ? "#333333" : "#dddddd",
            visibility: "hidden",
          },
          "#root:hover::-webkit-scrollbar-thumb": {
            visibility: "visible",
          },

          // File list scrollbar
          "#file-list-container::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "#file-list-container::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "#file-list-container::-webkit-scrollbar-thumb": {
            background: darkMode ? "#333333" : "#dddddd",
          },

          // Live Icon
          "@keyframes pulse": {
            "0%": {
              transform: "scale(0.33)",
            },
            "80%, 100%": {
              opacity: 0,
            },
          },

          "@keyframes circle": {
            "0%": {
              transform: "scale(0.8)",
            },
            "50%": {
              transform: "scale(1)",
            },
            "100%": {
              transform: "scale(0.8)",
            },
          },
          ".circle-live-icon-parent": {
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translateX(-50%) translateY(-50%)",
          },

          ".circle-live-icon": {
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translateX(-50%) translateY(-50%)",
            width: "12px",
            height: "12px",
          },
          ".circle-live-icon:before": {
            content: '""',
            position: "relative",
            display: "block",
            width: "250%",
            height: "250%",
            boxSizing: "border-box",
            marginLeft: "-75%",
            marginTop: "-75%",
            borderRadius: "45px",
            backgroundColor: "#bea6ff",
            animation:
              "pulse 1.25s cubic-bezier(0.215, 0.61, 0.355, 1) infinite",
          },
          ".circle-live-icon:after": {
            content: '""',
            position: "absolute",
            left: 0,
            top: 0,
            display: "block",
            width: "100%",
            height: "100%",
            backgroundColor: "#bea6ff",
            borderRadius: "50px",
            animation:
              "circle 1.25s cubic-bezier(0.455, 0.03, 0.515, 0.955) -0.4s infinite",
          },

          // Main inner container for the navbar and pages
          // Responsive x margin sizing on app
          "#app": {
            minHeight: "100%",
            margin: "0 5%",
            // minWidth: "250px",
            transitionProperty: "margin",
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
            transitionDuration: "300ms",
          },
          "@media (min-width: 640px)": {
            // Hide scrollbar when in phone view
            "#root::-webkit-scrollbar": {
              display: "block",
            },
            "#app": {
              margin: "0 5%",
            },
          },
          "@media (min-width: 768px)": {
            "#app": {
              margin: "0 5%",
            },
          },
          "@media (min-width: 1024px)": {
            "#root::-webkit-scrollbar": {
              width: "12px",
              height: "12px",
            },
            "#app": {
              margin: "0 7.5%",
            },
          },
          "@media (min-width: 1280px)": {
            "#app": {
              margin: "0 8%",
            },
          },
          "@media (min-width: 1536px)": {
            "#app": {
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
          // Default html elements, sizes don't match Typography
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

          // Use fallbacks as a hack to specify additional @font-face definitions
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

            // We don't currently need this weight
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

      // Accordion customization
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
            borderBottom: darkMode
              ? "1px solid rgba(245, 245, 245, 0.2)"
              : "1px solid rgba(18, 18, 18, 0.2)",
          },
        },
      },
    },
  });
};

export { createAstralTheme };
