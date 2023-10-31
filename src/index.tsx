import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import { Link, RouterProvider, createBrowserRouter } from "react-router-dom";
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
  Tooltip,
  Typography,
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
    errorElement: (
      <>
        <div className="w-full h-screen flex flex-col space-y-2 items-center place-content-center">
          <Typography className="mb-2" variant="h4">
            <Tooltip title="All your base are belong to us" placement="top">
              <Typography variant="h4" display={"inline"}>
                404
              </Typography>
            </Tooltip>{" "}
            - Page Not Found
          </Typography>
          <Typography>
            Looks like you stumbled across a page that does not exist.
          </Typography>
          <Link to={"/"}>
            <Typography>Click here to go to the main page.</Typography>
          </Link>
        </div>
      </>
    ),
    children: [
      {
        index: true,
        element: <Home />,
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
