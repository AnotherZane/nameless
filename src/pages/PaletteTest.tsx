import React from "react";
import { Button, Typography } from "@mui/material";

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    accent: true;
  }
}

const PaletteTest = () => {
  return (
    <>
      <Typography
        className="max-w-fit bg-gradient-to-r bg-clip-text text-transparent from-primary-base to-accent-base"
        variant="h1"
      >
        H1 Material UI + Tailwind CSS
      </Typography>
      <Typography variant="h2">H1 Material UI + Tailwind CSS</Typography>
      <Typography variant="h3">H1 Material UI + Tailwind CSS</Typography>
      <Typography variant="h4">H1 Material UI + Tailwind CSS</Typography>
      <Typography variant="h5">H1 Material UI + Tailwind CSS</Typography>
      <Typography variant="h6">H1 Material UI + Tailwind CSS</Typography>
      <h1 className="max-w-fit bg-gradient-to-r bg-clip-text text-transparent from-primary-base to-accent-base">
        H1 Material UI + Tailwind CSS
      </h1>
      <h2>H2 Material UI + Tailwind CSS</h2>
      <h3>H3 Material UI + Tailwind CSS</h3>
      <h4>H4 Material UI + Tailwind CSS</h4>
      <h5>H5 Material UI + Tailwind CSS</h5>
      <h6>H6 Material UI + Tailwind CSS</h6>
      <p className="font-normal">
        DIN Regular 400 - Lorem ipsum dolor sit amet, consectetur adipiscing
        elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
        ut aliquip ex ea commodo consequat. Duis aute irure dolor in
        reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
        pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa
        qui officia deserunt mollit anim id est laborum.
      </p>
      <p className="font-medium">
        DIN Medium 500 - Lorem ipsum dolor sit amet, consectetur adipiscing
        elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
        ut aliquip ex ea commodo consequat. Duis aute irure dolor in
        reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
        pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa
        qui officia deserunt mollit anim id est laborum.
      </p>
      <p className="font-bold">
        DIN Bold 700 - Lorem ipsum dolor sit amet, consectetur adipiscing elit,
        sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
        enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
        aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit
        in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
        officia deserunt mollit anim id est laborum.
      </p>

      <div>
        <Button className="m-2" variant="outlined" size="large">
          Primary
        </Button>
        <Button className="m-2" variant="outlined" size="medium">
          Primary
        </Button>
        <Button className="m-2" variant="outlined" size="small">
          Primary
        </Button>

        <Button color="accent" className="m-2" variant="outlined" size="large">
          Accent
        </Button>
        <Button color="accent" className="m-2" variant="outlined" size="medium">
          Accent
        </Button>
        <Button color="accent" className="m-2" variant="outlined" size="small">
          Accent
        </Button>
      </div>

      <div>
        <Button className="m-2" variant="contained" size="large">
          Primary
        </Button>
        <Button className="m-2" variant="contained" size="medium">
          Primary
        </Button>
        <Button className="m-2" variant="contained" size="small">
          Primary
        </Button>
        <Button color="accent" className="m-2" variant="contained" size="large">
          Accent
        </Button>
        <Button
          color="accent"
          className="m-2"
          variant="contained"
          size="medium"
        >
          Accent
        </Button>
        <Button color="accent" className="m-2" variant="contained" size="small">
          Accent
        </Button>

        <Button
          color="secondary"
          className="m-2"
          variant="contained"
          size="large"
        >
          Secondary
        </Button>
        <Button
          color="secondary"
          className="m-2"
          variant="contained"
          size="medium"
        >
          Secondary
        </Button>
        <Button
          color="secondary"
          className="m-2"
          variant="contained"
          size="small"
        >
          Secondary
        </Button>
      </div>

      <div>
        <Button className="m-2" variant="text" size="large">
          Primary
        </Button>
        <Button className="m-2" variant="text" size="medium">
          Primary
        </Button>
        <Button className="m-2" variant="text" size="small">
          Primary
        </Button>
        <Button color="accent" className="m-2" variant="text" size="large">
          Accent
        </Button>
        <Button color="accent" className="m-2" variant="text" size="medium">
          Accent
        </Button>
        <Button color="accent" className="m-2" variant="text" size="small">
          Accent
        </Button>
      </div>
    </>
  );
};

export { PaletteTest };
