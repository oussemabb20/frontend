import { LinearProgressProps as MuiLinearProgressProps } from '@mui/material/LinearProgress';

export interface VuiProgressProps extends MuiProgressProps {
  variant?: 'determinate' | 'indeterminate';
  color?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | 'light' | 'dark';
  value?: number;
  label?: boolean;
}

declare const VuiProgress: React.FC<VuiProgressProps>;

export default VuiProgress;
