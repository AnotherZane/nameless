import React from "react";
import { Typography } from "@mui/material";

type PageHeaderProps = {
  children: React.ReactNode;
};

const PageHeader = ({ children }: PageHeaderProps) => {
  return (
    <Typography variant="h4" className="underline my-4">
      {children}
    </Typography>
  );
};

export { PageHeader };
