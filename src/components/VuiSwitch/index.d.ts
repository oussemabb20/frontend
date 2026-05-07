import { SwitchProps as MuiSwitchProps } from '@mui/material/Switch';

export interface VuiSwitchProps extends MuiSwitchProps {
  color?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | 'light' | 'dark';
}

declare const VuiSwitch: React.ForwardRefExoticComponent<VuiSwitchProps & React.RefAttributes<HTMLButtonElement>>;

export default VuiSwitch;
