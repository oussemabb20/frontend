import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  VisionUIControllerProvider,
  useVisionUIController,
  setMiniSidenav,
  setTransparentSidenav,
  setSidenavColor,
  setTransparentNavbar,
  setFixedNavbar,
  setOpenConfigurator,
  setDirection,
  setLayout,
  setDarkMode,
} from './index';

describe('VisionUIController Context', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('VisionUIControllerProvider', () => {
    it('should provide initial state with default values', () => {
      const { result } = renderHook(() => useVisionUIController(), {
        wrapper: VisionUIControllerProvider,
      });

      const [controller] = result.current;

      expect(controller).toEqual({
        miniSidenav: false,
        transparentSidenav: true,
        sidenavColor: 'info',
        transparentNavbar: true,
        fixedNavbar: true,
        openConfigurator: false,
        direction: 'ltr',
        layout: 'dashboard',
        darkMode: false,
      });
    });

    it('should read darkMode from localStorage if available', () => {
      localStorage.setItem('bb-dark-mode', 'false');

      const { result } = renderHook(() => useVisionUIController(), {
        wrapper: VisionUIControllerProvider,
      });

      const [controller] = result.current;
      expect(controller.darkMode).toBe(false);
    });

    it('should read darkMode true from localStorage if available', () => {
      localStorage.setItem('bb-dark-mode', 'true');

      const { result } = renderHook(() => useVisionUIController(), {
        wrapper: VisionUIControllerProvider,
      });

      const [controller] = result.current;
      expect(controller.darkMode).toBe(true);
    });

    it('should default to light mode when localStorage is empty', () => {
      const { result } = renderHook(() => useVisionUIController(), {
        wrapper: VisionUIControllerProvider,
      });

      const [controller] = result.current;
      expect(controller.darkMode).toBe(false);
    });
  });

  describe('useVisionUIController hook', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useVisionUIController());
      }).toThrow('useVisionUIController should be used inside the VisionUIControllerProvider.');
    });

    it('should return controller and dispatch', () => {
      const { result } = renderHook(() => useVisionUIController(), {
        wrapper: VisionUIControllerProvider,
      });

      expect(result.current).toHaveLength(2);
      expect(result.current[0]).toBeDefined();
      expect(result.current[1]).toBeTypeOf('function');
    });
  });

  describe('setMiniSidenav', () => {
    it('should update miniSidenav state', () => {
      const { result } = renderHook(() => useVisionUIController(), {
        wrapper: VisionUIControllerProvider,
      });

      const [, dispatch] = result.current;

      act(() => {
        setMiniSidenav(dispatch, true);
      });

      const [controller] = result.current;
      expect(controller.miniSidenav).toBe(true);
    });
  });

  describe('setTransparentSidenav', () => {
    it('should update transparentSidenav state', () => {
      const { result } = renderHook(() => useVisionUIController(), {
        wrapper: VisionUIControllerProvider,
      });

      const [, dispatch] = result.current;

      act(() => {
        setTransparentSidenav(dispatch, false);
      });

      const [controller] = result.current;
      expect(controller.transparentSidenav).toBe(false);
    });
  });

  describe('setSidenavColor', () => {
    it('should update sidenavColor state', () => {
      const { result } = renderHook(() => useVisionUIController(), {
        wrapper: VisionUIControllerProvider,
      });

      const [, dispatch] = result.current;

      act(() => {
        setSidenavColor(dispatch, 'primary');
      });

      const [controller] = result.current;
      expect(controller.sidenavColor).toBe('primary');
    });
  });

  describe('setTransparentNavbar', () => {
    it('should update transparentNavbar state', () => {
      const { result } = renderHook(() => useVisionUIController(), {
        wrapper: VisionUIControllerProvider,
      });

      const [, dispatch] = result.current;

      act(() => {
        setTransparentNavbar(dispatch, false);
      });

      const [controller] = result.current;
      expect(controller.transparentNavbar).toBe(false);
    });
  });

  describe('setFixedNavbar', () => {
    it('should update fixedNavbar state', () => {
      const { result } = renderHook(() => useVisionUIController(), {
        wrapper: VisionUIControllerProvider,
      });

      const [, dispatch] = result.current;

      act(() => {
        setFixedNavbar(dispatch, false);
      });

      const [controller] = result.current;
      expect(controller.fixedNavbar).toBe(false);
    });
  });

  describe('setOpenConfigurator', () => {
    it('should update openConfigurator state', () => {
      const { result } = renderHook(() => useVisionUIController(), {
        wrapper: VisionUIControllerProvider,
      });

      const [, dispatch] = result.current;

      act(() => {
        setOpenConfigurator(dispatch, true);
      });

      const [controller] = result.current;
      expect(controller.openConfigurator).toBe(true);
    });
  });

  describe('setDirection', () => {
    it('should update direction state', () => {
      const { result } = renderHook(() => useVisionUIController(), {
        wrapper: VisionUIControllerProvider,
      });

      const [, dispatch] = result.current;

      act(() => {
        setDirection(dispatch, 'rtl');
      });

      const [controller] = result.current;
      expect(controller.direction).toBe('rtl');
    });
  });

  describe('setLayout', () => {
    it('should update layout state', () => {
      const { result } = renderHook(() => useVisionUIController(), {
        wrapper: VisionUIControllerProvider,
      });

      const [, dispatch] = result.current;

      act(() => {
        setLayout(dispatch, 'page');
      });

      const [controller] = result.current;
      expect(controller.layout).toBe('page');
    });
  });

  describe('setDarkMode', () => {
    it('should update darkMode state', () => {
      const { result } = renderHook(() => useVisionUIController(), {
        wrapper: VisionUIControllerProvider,
      });

      const [, dispatch] = result.current;

      act(() => {
        setDarkMode(dispatch, false);
      });

      const [controller] = result.current;
      expect(controller.darkMode).toBe(false);
    });

    it('should persist darkMode to localStorage', () => {
      const { result } = renderHook(() => useVisionUIController(), {
        wrapper: VisionUIControllerProvider,
      });

      const [, dispatch] = result.current;

      act(() => {
        setDarkMode(dispatch, false);
      });

      expect(localStorage.getItem('bb-dark-mode')).toBe('false');
    });

    it('should toggle darkMode correctly', () => {
      const { result } = renderHook(() => useVisionUIController(), {
        wrapper: VisionUIControllerProvider,
      });

      const [, dispatch] = result.current;

      act(() => {
        setDarkMode(dispatch, false);
      });

      let [controller] = result.current;
      expect(controller.darkMode).toBe(false);
      expect(localStorage.getItem('bb-dark-mode')).toBe('false');

      act(() => {
        setDarkMode(dispatch, true);
      });

      [controller] = result.current;
      expect(controller.darkMode).toBe(true);
      expect(localStorage.getItem('bb-dark-mode')).toBe('true');
    });
  });

  describe('reducer error handling', () => {
    it('should throw error for unknown action type', () => {
      const { result } = renderHook(() => useVisionUIController(), {
        wrapper: VisionUIControllerProvider,
      });

      const [, dispatch] = result.current;

      expect(() => {
        act(() => {
          dispatch({ type: 'UNKNOWN_ACTION', value: true });
        });
      }).toThrow('Unhandled action type: UNKNOWN_ACTION');
    });
  });
});
