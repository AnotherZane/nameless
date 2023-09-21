import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import {
  CssBaseline,
  StyledEngineProvider,
  ThemeProvider,
} from "@mui/material";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { createAstralTheme } from "./theme";
import App from "./App";
import {
  Home,
  About,
  FAQs,
  Privacy,
  PaletteTest,
  Test,
  ShareRedirector,
} from "./pages";

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement as HTMLElement);

const theme = createAstralTheme(rootElement);

const defaultRouter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    // errorElement: <></>,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "receive",
        element: <></>
      },
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
  {
    path: "/test",
    element: <Test />,
  },
]);

root.render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={defaultRouter} />
      </ThemeProvider>
    </StyledEngineProvider>
  </React.StrictMode>
);
