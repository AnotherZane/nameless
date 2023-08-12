import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import {
  CssBaseline,
  StyledEngineProvider,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement as HTMLElement);

const theme = createTheme({
  palette: {
    mode: "dark",
    // primary: {
    //   main: "#663399",
    // },
  },
  typography: {
    fontFamily: "Noto Sans, sans-serif",
  },
  spacing: 1,
});

const defaultRouter = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
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
