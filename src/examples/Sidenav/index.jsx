/*!

=========================================================
* Vision UI Free React - v1.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/vision-ui-free-react
* Copyright 2021 Creative Tim (https://www.creative-tim.com/)
* Licensed under MIT (https://github.com/creativetimofficial/vision-ui-free-react/blob/master LICENSE.md)

* Design and Coded by Simmmple & Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

// react-router-dom components
import { useLocation, NavLink, useNavigate } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";
import { keyframes } from "@mui/material";

// Vision UI Dashboard React components
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiButton from "components/VuiButton";

// Vision UI Dashboard React example components
import SidenavCollapse from "examples/Sidenav/SidenavCollapse";

// Custom styles for the Sidenav
import SidenavRoot from "examples/Sidenav/SidenavRoot";
import sidenavLogoLabel from "examples/Sidenav/styles/sidenav";

// Vision UI Dashboard React context
import { useVisionUIController, setMiniSidenav, setTransparentSidenav } from "context";

// Vision UI Dashboard React icons
import SimmmpleLogo from "examples/Icons/SimmmpleLogo";

// Auth service to get current user
import { authService } from "services/auth.service";

// Redux actions
import { logout as clearUser } from "../../store/slices/userSlice";

// Define animations
const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 8px rgba(67, 24, 255, 0.3); }
  50% { box-shadow: 0 0 16px rgba(67, 24, 255, 0.6); }
`;

// function Sidenav({ color, brand, brandName, routes, ...rest }) {
function Sidenav({ color, brandName, routes, ...rest }) {
  const [controller, dispatch] = useVisionUIController();
  const { miniSidenav, transparentSidenav, darkMode } = controller;
  const currentUserFromStore = useSelector((state) => state.user?.currentUser);
  const reduxDispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  const closeSidenav = () => setMiniSidenav(dispatch, true);

  // Check if a route is active by comparing the route path with current pathname
  const isRouteActive = (routePath) => {
    if (!routePath) return false;
    // Normalize paths for comparison
    const normalizedCurrentPath = pathname.split('?')[0]; // Remove query params
    const normalizedRoutePath = routePath.split('?')[0];
    // Check if the current path starts with the route path (for nested routes)
    return normalizedCurrentPath === normalizedRoutePath || normalizedCurrentPath.startsWith(normalizedRoutePath + '/');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      reduxDispatch(clearUser());
      navigate('/authentication/sign-in');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state and redirect even if API call fails
      reduxDispatch(clearUser());
      navigate('/authentication/sign-in');
    }
  };

  useEffect(() => {
    // A function that sets the mini state of the sidenav.
    function handleMiniSidenav() {
      setMiniSidenav(dispatch, window.innerWidth < 1200);
    }

    /** 
     The event listener that's calling the handleMiniSidenav function when resizing the window.
    */
    window.addEventListener("resize", handleMiniSidenav);

    // Call the handleMiniSidenav function to set the state with the initial value.
    handleMiniSidenav();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleMiniSidenav);
  }, [dispatch, location]);

  useEffect(() => {
    if (window.innerWidth < 1440) {
      setTransparentSidenav(dispatch, false);
    }
  }, []);

  // Get current user to check role
  const currentUser = currentUserFromStore || authService.getCurrentUser();
  const userRole = currentUser?.role || 'user';

  // Filter routes based on user role
  const filterRoutesByRole = (route) => {
    // Hide regular user dashboard entry for admins to avoid dashboard route flicker.
    if (userRole === 'admin' && route.key === 'dashboard') {
      return false;
    }

    // If route requires admin role and user is not admin, hide it
    if (route.requiredRole === 'admin' && userRole !== 'admin') {
      return false;
    }
    return true;
  };

  // Render all the routes from the routes.js (All the visible items on the Sidenav)
  const renderRoutes = routes
    .filter(filterRoutesByRole)
    .filter((route) => !route.hidden)
    .map(({ type, name, icon, title, noCollapse, key, route, href }) => {
      let returnValue;

      if (type === "collapse") {
        // Wrap the entire item in li, not inside the link
        returnValue = (
          <SidenavCollapse
            key={key}
            color={color}
            name={name}
            icon={icon}
            active={isRouteActive(route)}
            noCollapse={noCollapse}
            href={href}
            route={route}
          />
        );
      } else if (type === "title") {
        returnValue = (
          <VuiTypography
            key={key}
            component="li"
            role="presentation"
            color={darkMode ? "white" : "dark"}
            display="block"
            variant="caption"
            fontWeight="bold"
            textTransform="uppercase"
            pl={2}
            mt={2}
            mb={1}
            ml={0}
          >
            {title}
          </VuiTypography>
        );
      } else if (type === "divider") {
        returnValue = <Divider light key={key} component="li" role="presentation" />;
      }

      return returnValue;
    });

  return (
    <SidenavRoot {...rest} variant="permanent" ownerState={{ transparentSidenav, miniSidenav }} aria-label="Main navigation" component="nav">
      <VuiBox
        pt={3.5}
        pb={0.5}
        pr={4}
        textAlign="center"
        sx={{
          overflow: "unset !important",
        }}
      >
        <VuiBox
          display={{ xs: "block", xl: "none" }}
          position="absolute"
          top={0}
          right={0}
          p={1.625}
          onClick={closeSidenav}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeSidenav(); } }}
          role="button"
          tabIndex={0}
          aria-label="Close navigation"
          sx={{ cursor: "pointer" }}
        >
          <VuiTypography variant="h6" color="text">
            <Icon sx={{ fontWeight: "bold" }} aria-hidden="true">close</Icon>
          </VuiTypography>
        </VuiBox>
        <VuiBox component={NavLink} to="/dashboard" display="flex" alignItems="center" aria-label="ByteBattle Home">
          <VuiBox
            sx={
              ((theme) => sidenavLogoLabel(theme, { miniSidenav }),
              {
                display: "flex",
                alignItems: "center",
                margin: "0 auto",
                gap: 1.25,
              })
            }
          >
            <VuiBox
              display="flex"
              sx={
                ((theme) => sidenavLogoLabel(theme, { miniSidenav, transparentSidenav }),
                {
                  width: 36,
                  height: 36,
                  minWidth: 36,
                  borderRadius: "12px",
                  alignItems: "center",
                  justifyContent: "center",
                  background: (theme) =>
                    theme.palette.mode === "light"
                      ? "linear-gradient(135deg, rgba(67, 24, 255, 0.18) 0%, rgba(0, 117, 255, 0.14) 100%)"
                      : "linear-gradient(135deg, rgba(67, 24, 255, 0.45) 0%, rgba(0, 117, 255, 0.35) 100%)",
                  border: (theme) =>
                    theme.palette.mode === "light"
                      ? "1px solid rgba(67, 24, 255, 0.18)"
                      : "1px solid rgba(255, 255, 255, 0.14)",
                  boxShadow: (theme) =>
                    theme.palette.mode === "light"
                      ? "0 8px 20px rgba(67, 24, 255, 0.12)"
                      : "0 8px 20px rgba(0, 0, 0, 0.25)",
                  mr: miniSidenav || (miniSidenav && transparentSidenav) ? 0 : 1,
                })
              }
            >
              <SimmmpleLogo size="28px" color={darkMode ? "white" : "#111827"} aria-hidden="true" />
            </VuiBox>
            <VuiTypography
              variant="button"
              color={darkMode ? "white" : "dark"}
              fontSize={15}
              letterSpacing={1.8}
              fontWeight="bold"
              sx={
                ((theme) => sidenavLogoLabel(theme, { miniSidenav, transparentSidenav }),
                {
                  opacity: miniSidenav || (miniSidenav && transparentSidenav) ? 0 : 1,
                  maxWidth: miniSidenav || (miniSidenav && transparentSidenav) ? 0 : "100%",
                  margin: "0 auto",
                  textShadow: (theme) =>
                    theme.palette.mode === "light"
                      ? "none"
                      : "0 2px 10px rgba(67, 24, 255, 0.35)",
                })
              }
            >
              {brandName}
            </VuiTypography>
          </VuiBox>
        </VuiBox>
      </VuiBox>
      <Divider light={darkMode} />
      <List>{renderRoutes}</List>
      
      {/* Logout Button only - Teams button removed */}
      <VuiBox
        my={2}
        mx={2}
        mt="auto"
        sx={({ breakpoints }) => ({
          [breakpoints.up("xl")]: {
            pt: 2,
          },
          [breakpoints.only("xl")]: {
            pt: 1,
          },
          [breakpoints.down("xl")]: {
            pt: 2,
          },
        })}
      >
        <VuiButton
          onClick={handleLogout}
          variant="gradient"
          color="info"
          fullWidth
          aria-label="Logout from ByteBattle"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <Icon aria-hidden="true">logout</Icon>
          {!miniSidenav && "Logout"}
        </VuiButton>
      </VuiBox>
    </SidenavRoot>
  );
}

// Setting default values for the props of Sidenav
Sidenav.defaultProps = {
  color: "info",
  // brand: "",
};

// Typechecking props for the Sidenav
Sidenav.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  // brand: PropTypes.string,
  brandName: PropTypes.string.isRequired,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidenav;