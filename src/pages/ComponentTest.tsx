import { Add } from "@mui/icons-material";
import { Paper, Typography } from "@mui/material";
import React from "react";

const Demo = () => {
  return (
    <>
      <div>
        <Paper
          elevation={4}
          className="flex flex-col place-items-center max-w-fit p-4"
        >
          <Typography variant="body1">Select file(s)</Typography>
          <Paper elevation={2} className="">
            <Add fontSize="large" className="" />
          </Paper>
        </Paper>
      </div>
    </>
  );
};

const ComponentTest = () => {
  return (
    <>
      <Demo />
    </>
  );
};

export { ComponentTest };
