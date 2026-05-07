import { ReactNode } from 'react';

export interface Route {
  type: 'collapse' | 'title' | 'divider';
  name?: string;
  key: string;
  route?: string;
  icon?: ReactNode;
  component?: React.ComponentType<any>;
  noCollapse?: boolean;
  title?: string;
  collapse?: Route[];
}

declare const routes: Route[];

export default routes;
