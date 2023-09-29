import { Add } from "@mui/icons-material";
import { Paper, Typography } from "@mui/material";
import React from "react";
import { FileSelector } from "../components";

const Demo = () => {
  return (
    <>
      <div className="flex grow my-8 justify-around">
        {/* <Paper
          elevation={4}
          className="flex flex-col place-items-center max-w-fit p-4"
        >
          <Typography variant="body1">Select file(s)</Typography>
          <Paper elevation={2} className="">
            <Add fontSize="large" className="" />
          </Paper>
        </Paper> */}
        {/* <FileSelector className="flex-[0_0_50%] px-24 py-16" /> */}
        <div className="flex-[0_0_50%] text-center">
          <Typography variant="h3">Astral Share</Typography>
        </div>
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
