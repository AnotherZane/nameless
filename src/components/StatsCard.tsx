import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { Variant } from "@mui/material/styles/createTypography";

type StatsCardProps = {
  stat: string | number | JSX.Element;
  icon: JSX.Element;
  title: string | number | JSX.Element;
  variant?: Variant;
};

const StatsCard = ({ stat, icon, title, variant = "h5" }: StatsCardProps) => {
  return (
    <Card className="flex flex-col w-40">
      <CardContent className="items-center">
        <div className="flex items-center place-content-center space-x-2">
          {icon}
          {typeof(stat) == "string" || typeof(stat) == 'number' ? (
            <Typography variant={variant}>{stat}</Typography>
          ) : (
            <div className="">{stat}</div>
          )}
        </div>
        <Typography className="text-center">{title}</Typography>
      </CardContent>
    </Card>
  );
};

export { StatsCard };
