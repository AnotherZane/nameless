import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./components";
import { SnackbarProvider, closeSnackbar } from "notistack";

const App = () => {
  return (
    <SnackbarProvider
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      dense
      maxSnack={3}
      preventDuplicate
    >
      <div id="app" className="flex flex-col">
        <Navbar className="flex-initial" />
        <div className="flex flex-col flex-auto h-full">
          <Outlet />
        </div>
      </div>
    </SnackbarProvider>
  );
};

export default App;
