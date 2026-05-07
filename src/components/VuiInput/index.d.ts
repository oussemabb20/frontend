import { InputProps as MuiInputProps } from '@mui/material/Input';

export interface VuiInputProps extends Omit<MuiInputProps, 'size'> {
  size?: 'small' | 'medium' | 'large';
  icon?: {
    component: React.ReactNode;
    direction: 'left' | 'right';
  };
  success?: boolean;
  error?: boolean;
}

declare const VuiInput: React.FC<VuiInputProps>;

export default VuiInput;
