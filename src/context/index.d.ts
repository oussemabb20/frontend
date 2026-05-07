import { ReactNode, Dispatch } from 'react';

export interface VisionUIController {
  miniSidenav: boolean;
  transparentSidenav: boolean;
  sidenavColor: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | 'dark';
  transparentNavbar: boolean;
  fixedNavbar: boolean;
  openConfigurator: boolean;
  direction: 'ltr' | 'rtl';
  layout: 'dashboard' | 'vr' | 'page';
  darkMode: boolean;
}

export type VisionUIAction = 
  | { type: 'MINI_SIDENAV'; value: boolean }
  | { type: 'TRANSPARENT_SIDENAV'; value: boolean }
  | { type: 'SIDENAV_COLOR'; value: string }
  | { type: 'TRANSPARENT_NAVBAR'; value: boolean }
  | { type: 'FIXED_NAVBAR'; value: boolean }
  | { type: 'OPEN_CONFIGURATOR'; value: boolean }
  | { type: 'DIRECTION'; value: 'ltr' | 'rtl' }
  | { type: 'LAYOUT'; value: string }
  | { type: 'DARK_MODE'; value: boolean };

export function VisionUIControllerProvider({ children }: { children: ReactNode }): JSX.Element;

export function useVisionUIController(): [VisionUIController, Dispatch<VisionUIAction>];

export function setMiniSidenav(dispatch: Dispatch<VisionUIAction>, value: boolean): void;
export function setTransparentSidenav(dispatch: Dispatch<VisionUIAction>, value: boolean): void;
export function setSidenavColor(dispatch: Dispatch<VisionUIAction>, value: string): void;
export function setTransparentNavbar(dispatch: Dispatch<VisionUIAction>, value: boolean): void;
export function setFixedNavbar(dispatch: Dispatch<VisionUIAction>, value: boolean): void;
export function setOpenConfigurator(dispatch: Dispatch<VisionUIAction>, value: boolean): void;
export function setDirection(dispatch: Dispatch<VisionUIAction>, value: 'ltr' | 'rtl'): void;
export function setLayout(dispatch: Dispatch<VisionUIAction>, value: string): void;
export function setDarkMode(dispatch: Dispatch<VisionUIAction>, value: boolean): void;
