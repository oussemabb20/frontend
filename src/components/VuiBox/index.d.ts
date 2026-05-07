
import { BoxProps } from "@mui/material/Box";
import React from "react";

export interface VuiBoxProps extends BoxProps {
  component?: React.ElementType;
  variant?: string;
  bgColor?: string;
  color?: string;
  opacity?: number;
  borderRadius?: string | number;
  shadow?: string;
  [key: string]: any;
}

declare const VuiBox: React.FC<VuiBoxProps>;

export default VuiBox;

export default VuiBox;

