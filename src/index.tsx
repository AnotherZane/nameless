import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import {
  CssBaseline,
  StyledEngineProvider,
  ThemeProvider,
} from "@mui/material";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Test from "./pages/Test";
import { createAstralTheme } from "./themes";
import Home from "./pages/Home";

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement as HTMLElement);

const theme = createAstralTheme(rootElement);

const defaultRouter = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
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
