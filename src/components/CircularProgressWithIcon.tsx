import {
  Box,
  CircularProgress,
  CircularProgressProps,
  Typography,
} from "@mui/material";
import React from "react";

type CircularProgressWithIconProps = {
  icon: React.ReactNode;
} & CircularProgressProps;

const CircularProgressWithIcon = (props: CircularProgressWithIconProps) => {
  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress {...props} />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
      >
        <Typography className="w-full h-full flex justify-center items-center" variant="caption">{props.icon}</Typography>
      </Box>
    </Box>
  );
};

export { CircularProgressWithIcon };
