import { ReactNode } from 'react';

export interface SidenavProps {
  color?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | 'dark';
  brandName: string;
  routes: Array<{
    type: 'collapse' | 'title' | 'divider';
    name?: string;
    icon?: ReactNode;
    title?: string;
    noCollapse?: boolean;
    key: string;
    route?: string;
    href?: string;
  }>;
  [key: string]: any;
}

declare const Sidenav: React.FC<SidenavProps>;

export default Sidenav;
