/*!

=========================================================
* ByteBattle Platform - TypeScript Migration
=========================================================

* Based on Vision UI Free React
* Migrated to TypeScript with Redux Toolkit

=========================================================

*/

import { useState, useEffect, useMemo, useRef } from "react";

// react-router components
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// @mui material components
import { ThemeProvider, createTheme, alpha } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Brightness4Icon from "@mui/icons-material/Brightness4";

// MUI X Date Pickers components
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// Custom DatePicker Theme
import "./styles/datepicker-theme.css";

// Vision UI Dashboard React example components
import Sidenav from "./examples/Sidenav/index.jsx";

// Vision UI Dashboard React themes
import theme from "./assets/theme/index.js";
import themeRTL from "./assets/theme/theme-rtl.js";

// Theme variables (must be imported first)
import "./assets/css/theme-variables.css";

// Semantic theme variables
import "./theme-semantic.css";

// Theme overrides for consistent layout
import "./assets/css/theme-overrides.css";

// Accessibility styles
import "./assets/css/accessibility.css";

// RTL plugins
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

// Vision UI Dashboard React routes
import routes from "./routes.jsx";

// Vision UI Dashboard React contexts
import { useVisionUIController, setMiniSidenav, setDarkMode } from "./context/index.jsx";

// Protected Route Component
import ProtectedRoute from "./components/ProtectedRoute/index.tsx";

// Admin Redirect Component
import { AdminRedirect } from "./components/AdminRedirect.tsx";

// Redux
import { useDispatch } from "react-redux";
import { setUser } from "./store/slices/userSlice.ts";
import { authService } from "./services/auth.service.ts";

// Chat service for socket connection
import chatService from "./services/chat.service.ts";
import tokenRefreshService from "./services/tokenRefresh.service.ts";

const lightPalette = {
  mode: "light",
  background: {
    default: "#f8fafb",
    paper: "#ffffff",
  },
  text: {
    main: "#1a202c",
    focus: "#0f172a",
  },
  white: {
    main: "#ffffff",
    focus: "#f8fafc",
  },
  dark: {
    main: "#0f172a",
    focus: "#1e293b",
    body: "#f8fafb",
  },
  grey: {
    100: "#f7fafc",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },
  sidenav: {
    button: "#e8ecf1",
  },
  borderCol: {
    main: "rgba(203, 213, 225, 0.5)",
    red: "#dc2626",
    navbar: "rgba(203, 213, 225, 0.35)",
  },
  inputColors: {
    backgroundColor: "#ffffff",
    borderColor: {
      main: "rgba(203, 213, 225, 0.6)",
      focus: "rgba(0, 117, 255, 0.5)",
    },
    boxShadow: "rgba(0, 117, 255, 0.1)",
    error: "#ef4444",
    success: "#10b981",
  },
  gradients: {
    navbar: {
      deg: "135deg",
      main: "rgba(255, 255, 255, 0.98) 0%",
      state: "rgba(248, 250, 252, 0.97) 100%",
    },
    sidenav: {
      deg: "135deg",
      main: "rgba(255, 255, 255, 0.99) 0%",
      state: "rgba(248, 250, 252, 0.98) 100%",
    },
    cardDark: {
      deg: "135deg",
      main: "rgba(255, 255, 255, 0.99) 0%",
      state: "rgba(248, 250, 252, 0.98) 100%",
    },
    cardLight: {
      deg: "135deg",
      main: "rgba(255, 255, 255, 0.99) 0%",
      state: "rgba(248, 250, 252, 0.98) 100%",
    },
    cardContent: {
      deg: "135deg",
      main: "rgba(255, 255, 255, 0.99) 0%",
      state: "rgba(248, 250, 252, 0.98) 100%",
    },
    card: {
      deg: "135deg",
      main: "rgba(255, 255, 255, 0.99) 0%",
      state: "rgba(248, 250, 252, 0.98) 100%",
    },
    menu: {
      deg: "135deg",
      main: "#ffffff 0%",
      state: "#f8fafc 100%",
    },
    box: {
      deg: "135deg",
      main: "rgba(255, 255, 255, 0.99) 0%",
      state: "rgba(248, 250, 252, 0.97) 100%",
    },
    bill: {
      deg: "135deg",
      main: "rgba(255, 255, 255, 0.99) 0%",
      state: "rgba(248, 250, 252, 0.98) 100%",
    },
    dark: {
      main: "#2d3748",
      state: "#1a202c",
    },
    light: {
      main: "#ffffff",
      state: "#f7fafc",
    },
    info: {
      main: "#0075ff",
      state: "#3b82f6",
    },
    success: {
      main: "#10b981",
      state: "#34d399",
    },
    warning: {
      main: "#f59e0b",
      state: "#fbbf24",
    },
    error: {
      main: "#ef4444",
      state: "#f87171",
    },
    primary: {
      deg: "135deg",
      main: "#4318ff",
      state: "#7c3aed",
    },
    secondary: {
      main: "#64748b",
      state: "#94a3b8",
    },
    logo: {
      deg: "135deg",
      main: "rgba(67, 24, 255, 0.8) 0%",
      state: "rgba(0, 117, 255, 0.3) 100%",
    },
  },
};

const darkPalette = {
  mode: "dark",
  background: {
    default: "#0a0e23",
    paper: "#141829",
  },
  text: {
    main: "#e2e8f0",
    focus: "#ffffff",
  },
  white: {
    main: "#ffffff",
    focus: "#f8fafc",
  },
  dark: {
    main: "#141829",
    focus: "#0a0e23",
    body: "#0a0e23",
  },
  grey: {
    100: "#1e293b",
    200: "#334155",
    300: "#475569",
    400: "#64748b",
    500: "#94a3b8",
    600: "#cbd5e1",
    700: "#e2e8f0",
    800: "#f1f5f9",
    900: "#ffffff",
  },
  sidenav: {
    button: "#1e293b",
  },
  borderCol: {
    main: "rgba(148, 163, 184, 0.25)",
    red: "#e31a1a",
    navbar: "rgba(148, 163, 184, 0.15)",
  },
  inputColors: {
    backgroundColor: "#1e293b",
    borderColor: {
      main: "rgba(148, 163, 184, 0.20)",
      focus: "rgba(0, 117, 255, 0.38)",
    },
    boxShadow: "#1e40af",
    error: "#fd5c70",
    success: "#66d432",
  },
  gradients: {
    navbar: {
      deg: "123.64deg",
      main: "rgba(20, 24, 41, 0.95) -22.38%",
      state: "rgba(30, 41, 59, 0.90) 70.38%",
    },
    sidenav: {
      deg: "127.09",
      main: "rgba(10, 14, 35, 0.94) 19.41%",
      state: "rgba(20, 24, 41, 0.49) 76.65%",
    },
    cardDark: {
      deg: "126.97",
      main: "rgba(20, 24, 41, 0.80) 28.26%",
      state: "rgba(30, 41, 59, 0.60) 91.2%",
    },
    cardLight: {
      deg: "127.09",
      main: "rgba(20, 24, 41, 0.80) 19.41%",
      state: "rgba(30, 41, 59, 0.60) 76.65%",
    },
    cardContent: {
      deg: "126.97",
      main: "rgba(20, 24, 41, 0.80) 28.26%",
      state: "rgba(30, 41, 59, 0.60) 91.2%",
    },
    card: {
      deg: "127.09",
      main: "rgba(20, 24, 41, 0.80) 19.41%",
      state: "rgba(30, 41, 59, 0.60) 76.65%",
    },
    menu: {
      deg: "126.97",
      main: "#1e293b 28.26%",
      state: "#334155 91.2%",
    },
    box: {
      deg: "126.97",
      main: "rgba(20, 24, 41, 0.80) 28.26%",
      state: "rgba(30, 41, 59, 0.60) 91.2%",
    },
    bill: {
      deg: "127.09",
      main: "rgba(20, 24, 41, 0.80) 19.41%",
      state: "rgba(30, 41, 59, 0.60) 76.65%",
    },
    dark: {
      main: "#1e293b",
      state: "#0a0e23",
    },
    light: {
      main: "#334155",
      state: "#475569",
    },
    info: {
      main: "#0075ff",
      state: "#21d4fd",
    },
    success: {
      main: "#01B574",
      state: "#35d996",
    },
    warning: {
      main: "#ffb547",
      state: "#ffcd75",
    },
    error: {
      main: "#f53c2b",
      state: "#f85c52",
    },
    primary: {
      deg: "97.89",
      main: "#4318ff",
      state: "#7c3aed",
    },
    secondary: {
      main: "#a0aec0",
      state: "#cbd5e1",
    },
    logo: {
      deg: "97.89",
      main: "rgba(67, 24, 255, 0.5) 0%",
      state: "rgba(117, 122, 140, 0.1) 100%",
    },
  },
};

export default function App() {
  const [controller, dispatch] = useVisionUIController();
  const { miniSidenav, direction, layout, sidenavColor, darkMode } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState<any>(null);
  const { pathname } = useLocation();
  const reduxDispatch = useDispatch();

  // Initialize user from localStorage on app load
  useEffect(() => {
    const user = authService.getCurrentUser();
    const isAuthenticated = authService.isAuthenticated();
    
    console.log('App initialization - isAuthenticated:', isAuthenticated);
    console.log('App initialization - user:', user);
    
    if (isAuthenticated && user) {
      // Ensure the user object has the correct structure
      const userWithCorrectStructure = {
        id: user.id || user._id || "",
        username: user.username || "",
        email: user.email || "",
        role: user.role,
        avatar: user.profile?.avatar || user.providerAvatar,
        rank: typeof user.statistics?.rank === "number" ? user.statistics.rank : undefined,
        points: typeof user.statistics?.totalPoints === "number" ? user.statistics.totalPoints : undefined,
      };
      
      console.log('Setting user in Redux:', userWithCorrectStructure);
      reduxDispatch(setUser(userWithCorrectStructure));
      
      // Restore user's theme preference after login
      const storedDarkMode = localStorage.getItem("bb-dark-mode");
      if (storedDarkMode !== null) {
        setDarkMode(dispatch, storedDarkMode === "true");
      }
    }
  }, [reduxDispatch, dispatch]);

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    const isAuthenticated = authService.isAuthenticated();
    
    if (!isAuthenticated) return;
    
    console.log('User authenticated - initializing socket connection');
    
    // Start automatic token refresh
    tokenRefreshService.startAutoRefresh();
    
    // Initialize socket connection
    const token = localStorage.getItem('accessToken');
    chatService.initializeSocket(token);
    
    // Request online users after connection
    setTimeout(() => {
      chatService.getOnlineUsers();
    }, 1000);
    
    // Listen for token refresh events to reconnect socket
    const handleTokenRefresh = (event: any) => {
      console.log('Token refreshed in App, reconnecting socket...');
      chatService.disconnect();
      chatService.initializeSocket(event.detail.accessToken);
      
      // Request online users again after reconnect
      setTimeout(() => {
        chatService.getOnlineUsers();
      }, 1000);
    };

    window.addEventListener('tokenRefreshed', handleTokenRefresh);

    // Cleanup function - only runs when component unmounts
    return () => {
      console.log('App component unmounting - cleaning up');
      tokenRefreshService.stopAutoRefresh();
      window.removeEventListener('tokenRefreshed', handleTokenRefresh);
      // Only disconnect socket on unmount, not on navigation
      chatService.disconnect();
    };
  }, []); // Empty dependency array - only run once on mount

  // Cache for the rtl
  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin as any],
    });

    setRtlCache(cacheRtl);
  }, []);

  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // Setting the dir attribute for the body element
  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  useEffect(() => {
    const mode = darkMode ? "dark" : "light";
    document.body.setAttribute("data-theme", mode);
    document.documentElement.setAttribute("data-theme", mode);
  }, [darkMode]);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    if (document.scrollingElement) {
      document.scrollingElement.scrollTop = 0;
    }
  }, [pathname]);

  const getRoutes = (allRoutes: any[]): JSX.Element[] => {
    return allRoutes.flatMap((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        const Component = route.component;

        if (route.authRequired || route.requiredRole) {
          return (
            <Route element={<ProtectedRoute requiredRole={route.requiredRole} />} key={route.key}>
              <Route path={route.route} element={<Component />} />
            </Route>
          );
        }

        return <Route path={route.route} element={<Component />} key={route.key} />;
      }

      return [];
    });
  };

  const lightTheme = useMemo(
    () => {
      const createdTheme = createTheme(theme, {
        palette: {
          ...lightPalette,
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                background: "#ffffff", // Pure white background
                backgroundAttachment: "fixed",
                color: "#1a202c",
              },
              html: {
                backgroundColor: "#ffffff", // Pure white background
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05)",
                backgroundColor: "#ffffff",
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
                border: "1px solid rgba(203, 213, 225, 0.4)",
                backgroundColor: "#ffffff",
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
              },
              containedPrimary: {
                boxShadow: "0 2px 8px rgba(67, 24, 255, 0.25)",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(67, 24, 255, 0.35)",
                },
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                "& fieldset": {
                  borderColor: "rgba(203, 213, 225, 0.5)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(203, 213, 225, 0.7)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#0075ff",
                  borderWidth: 2,
                },
              },
            },
          },
        },
      });
      // Attach alpha utility to theme for MUI X components compatibility
      (createdTheme as any).alpha = alpha;
      return createdTheme;
    },
    []
  );

  const lightThemeRtl = useMemo(
    () => {
      const createdTheme = createTheme(themeRTL, {
        palette: {
          ...lightPalette,
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                background: "#ffffff", // Pure white background
                backgroundAttachment: "fixed",
                color: "#1a202c",
              },
              html: {
                backgroundColor: "#ffffff", // Pure white background
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05)",
                backgroundColor: "#ffffff",
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
                border: "1px solid rgba(203, 213, 225, 0.4)",
                backgroundColor: "#ffffff",
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
              },
              containedPrimary: {
                boxShadow: "0 2px 8px rgba(67, 24, 255, 0.25)",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(67, 24, 255, 0.35)",
                },
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                "& fieldset": {
                  borderColor: "rgba(203, 213, 225, 0.5)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(203, 213, 225, 0.7)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#0075ff",
                  borderWidth: 2,
                },
              },
            },
          },
        },
      });
      // Attach alpha utility to theme for MUI X components compatibility
      (createdTheme as any).alpha = alpha;
      return createdTheme;
    },
    []
  );

  const darkTheme = useMemo(
    () => {
      const createdTheme = createTheme(theme, {
        palette: {
          ...darkPalette,
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                background:
                  "radial-gradient(circle at top left, rgba(67, 24, 255, 0.15), transparent 40%), radial-gradient(circle at bottom right, rgba(0, 117, 255, 0.10), transparent 35%), linear-gradient(180deg, #0a0e23 0%, #141829 100%)",
                backgroundAttachment: "fixed",
                color: "#e2e8f0",
              },
              html: {
                backgroundColor: "#0a0e23",
              },
            },
          },
        },
      });
      // Attach alpha utility to theme for MUI X components
      (createdTheme as any).alpha = alpha;
      return createdTheme;
    },
    []
  );

  const darkThemeRtl = useMemo(
    () => {
      const createdTheme = createTheme(themeRTL, {
        palette: {
          ...darkPalette,
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                background:
                  "radial-gradient(circle at top left, rgba(67, 24, 255, 0.15), transparent 40%), radial-gradient(circle at bottom right, rgba(0, 117, 255, 0.10), transparent 35%), linear-gradient(180deg, #0a0e23 0%, #141829 100%)",
                backgroundAttachment: "fixed",
                color: "#e2e8f0",
              },
              html: {
                backgroundColor: "#0a0e23",
              },
            },
          },
        },
      });
      // Attach alpha utility to theme for MUI X components
      (createdTheme as any).alpha = alpha;
      return createdTheme;
    },
    []
  );

  const activeTheme = direction === "rtl" ? (darkMode ? darkThemeRtl : lightThemeRtl) : darkMode ? darkTheme : lightTheme;

  const handleThemeToggle = () => {
    setDarkMode(dispatch, !darkMode);
  };

  const content = (
    <>
      <CssBaseline />
      <AdminRedirect />
      
      {layout === "dashboard" && (
        <>
          <Sidenav
            color={sidenavColor}
            brand=""
            brandName="BYTEBATTLE"
            routes={routes}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
          />
        </>
      )}

      <Box
        component="aside"
        aria-label="Theme settings"
        sx={{
          position: "fixed",
          right: 16,
          bottom: 16,
          zIndex: 1400,
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.5,
          py: 1,
          background: "var(--gradient-surface)",
          border: "1px solid var(--border-secondary)",
          borderRadius: "50px",
          backdropFilter: "blur(12px)",
          boxShadow: "var(--shadow-lg)",
          transition: "all 0.3s ease",
          "&:hover": {
            backdropFilter: "blur(16px)",
            boxShadow: "var(--shadow-xl)",
          },
        }}
      >
        <Box sx={{ 
          fontSize: 13, 
          fontWeight: 700, 
          color: "var(--text-primary)", 
          pl: 0.5,
          letterSpacing: "0.5px",
        }}>
          {darkMode ? "Dark" : "Light"}
        </Box>
        <Tooltip title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
          <IconButton 
            onClick={handleThemeToggle}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            sx={{ 
              color: "var(--color-primary)",
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "scale(1.1) rotate(20deg)",
              },
            }}
          >
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Tooltip>
      </Box>

      <Routes>
        {getRoutes(routes)}
        <Route path="*" element={<Navigate to="/authentication/sign-in" replace />} />
      </Routes>
    </>
  );

  return direction === "rtl" ? (
    <CacheProvider value={rtlCache}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ThemeProvider theme={activeTheme}>
          {content}
        </ThemeProvider>
      </LocalizationProvider>
    </CacheProvider>
  ) : (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeProvider theme={activeTheme}>
        {content}
      </ThemeProvider>
    </LocalizationProvider>
  );
}
