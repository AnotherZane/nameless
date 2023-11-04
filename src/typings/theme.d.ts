export * from "@mui/material";

declare module "@mui/material" {
  export interface ButtonPropsColorOverrides {
    accent: true;
  }

  export interface ChipPropsColorOverrides {
    accent: true
  }
}
