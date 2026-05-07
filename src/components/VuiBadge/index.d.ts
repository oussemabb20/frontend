import { ReactNode } from 'react';

export interface VuiBadgeProps {
  variant?: 'gradient' | 'contained';
  color?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | 'light' | 'dark';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  badgeContent?: ReactNode;
  circular?: boolean;
  indicator?: boolean;
  border?: boolean;
  container?: boolean;
  children?: ReactNode;
}

declare const VuiBadge: React.FC<VuiBadgeProps>;

export default VuiBadge;
