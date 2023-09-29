import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "./App";
import {
  Home,
  About,
  FAQs,
  Privacy,
  PaletteTest,
  ShareRedirector,
} from "./pages";
import {
  CssBaseline,
  StyledEngineProvider,
  ThemeProvider,
} from "@mui/material";
import { useThemeStore } from "./state";
import { createAstralTheme } from "./theme";

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement as HTMLElement);

const defaultRouter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    // TODO: custom 404
    // errorElement: <></>,
    children: [
      {
        index: true,
        element: <Home />,
      },
      // {
      //   path: "receive",
      //   element: <></>,
      // },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "faqs",
        element: <FAQs />,
      },
      {
        path: "privacy",
        element: <Privacy />,
      },
    ],
  },
  {
    path: "/s/:code",
    element: <ShareRedirector />,
  },
  {
    path: "/palette",
    element: <PaletteTest />,
  },
]);

type ThemeWrapperProps = {
  root: HTMLElement | null;
};

const ThemeWrapper = ({ root }: ThemeWrapperProps) => {
  const themeSelection = useThemeStore((s) => s.theme);
  const theme = createAstralTheme(root, themeSelection == "dark");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={defaultRouter} />
    </ThemeProvider>
  );
};

root.render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <ThemeWrapper root={rootElement} />
    </StyledEngineProvider>
  </React.StrictMode>
);
