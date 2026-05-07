import { ReactNode, ElementType } from 'react';
import { TypographyProps as MuiTypographyProps } from '@mui/material/Typography';

export interface VuiTypographyProps extends Omit<MuiTypographyProps, 'color' | 'variant'> {
  color?: 'inherit' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | 'light' | 'dark' | 'text' | 'white' | 'logo';
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'button' | 'caption' | 'overline' | 'lg' | 'md' | 'sm' | 'xs' | 'xxs';
  fontWeight?: 'light' | 'regular' | 'medium' | 'bold' | number;
  textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
  verticalAlign?: 'unset' | 'baseline' | 'sub' | 'super' | 'text-top' | 'text-bottom' | 'middle' | 'top' | 'bottom';
  textGradient?: boolean;
  opacity?: number;
  children?: ReactNode;
  component?: ElementType;
}

declare const VuiTypography: React.FC<VuiTypographyProps>;

export default VuiTypography;
