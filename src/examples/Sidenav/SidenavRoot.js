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

// @mui material components
import Drawer from "@mui/material/Drawer";
import { styled } from "@mui/material/styles";
import linearGradient from "assets/theme/functions/linearGradient";

export default styled(Drawer)(({ theme, ownerState }) => {
  const { palette, boxShadows, transitions, breakpoints, functions } = theme;
  const { transparentSidenav, miniSidenav } = ownerState;
  const isLightMode = palette.mode === "light";

  const sidebarWidth = 250;
  const { transparent, gradients } = palette;
  const { xxl } = boxShadows;
  const { pxToRem } = functions;

  // styles for the sidenav when miniSidenav={false}
  const drawerOpenStyles = () => ({
    transform: "translateX(0)",
    transition: transitions.create("transform", {
      easing: transitions.easing.sharp,
      duration: transitions.duration.shorter,
    }),

    [breakpoints.up("xl")]: {
      boxShadow: transparentSidenav ? "none" : xxl,
      marginBottom: transparentSidenav ? 0 : "inherit",
      left: "0",
      width: sidebarWidth,
      transform: "translateX(0)",
      transition: transitions.create(["width", "background-color"], {
        easing: transitions.easing.sharp,
        duration: transitions.duration.enteringScreen,
      }),
    },
  });

  // styles for the sidenav when miniSidenav={true}
  const drawerCloseStyles = () => ({
    transform: `translateX(${pxToRem(-320)})`,
    transition: transitions.create("transform", {
      easing: transitions.easing.sharp,
      duration: transitions.duration.shorter,
    }),

    [breakpoints.up("xl")]: {
      boxShadow: transparentSidenav ? "none" : xxl,
      marginBottom: transparentSidenav ? 0 : "inherit",
      left: "0",
      width: pxToRem(96),
      overflowX: "hidden",
      transform: "translateX(0)",
      transition: transitions.create(["width", "background-color"], {
        easing: transitions.easing.sharp,
        duration: transitions.duration.shorter,
      }),
    },
  });

  return {
    "& .MuiDrawer-paper": {
      boxShadow: isLightMode 
        ? "0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.06)"
        : xxl,
      border: isLightMode 
        ? "1px solid rgba(203, 213, 225, 0.5)" 
        : "none",
      background: transparentSidenav
        ? transparent.main
        : isLightMode
          ? "linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f7fafc 100%)"
          : linearGradient(
              gradients.sidenav.main,
              gradients.sidenav.state,
              gradients.sidenav.deg
            ),
      backdropFilter: transparentSidenav ? "unset" : "blur(120px)",
      ...(miniSidenav ? drawerCloseStyles() : drawerOpenStyles()),
    },
  };
});
