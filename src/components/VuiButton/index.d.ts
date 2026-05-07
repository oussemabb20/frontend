import { ReactNode, ElementType } from 'react';
import { ButtonProps as MuiButtonProps } from '@mui/material/Button';

export interface VuiButtonProps extends Omit<MuiButtonProps, 'color'> {
  color?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | 'light' | 'dark' | 'white';
  variant?: 'text' | 'contained' | 'outlined' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  circular?: boolean;
  iconOnly?: boolean;
  children?: ReactNode;
  component?: ElementType;
}

declare const VuiButton: React.FC<VuiButtonProps>;

export default VuiButton;
