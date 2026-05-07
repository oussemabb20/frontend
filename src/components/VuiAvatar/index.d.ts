import { ReactNode } from 'react';
import { AvatarProps as MuiAvatarProps } from '@mui/material/Avatar';

export interface VuiAvatarProps extends MuiAvatarProps {
  bgColor?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  shadow?: string;
  children?: ReactNode;
}

declare const VuiAvatar: React.FC<VuiAvatarProps>;

export default VuiAvatar;
