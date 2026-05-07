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

// Vision UI Dashboard React base styles
import boxShadows from "assets/theme/base/boxShadows";
import typography from "assets/theme/base/typography";
import colors from "assets/theme/base/colors";
import borders from "assets/theme/base/borders";
import linearGradient from "assets/theme/functions/linearGradient";

// Vision UI Dashboard React helper functions
import pxToRem from "assets/theme/functions/pxToRem";

const { borderWidth } = borders;
const { lg } = boxShadows;
const { size } = typography;
const { white, borderCol, gradients, transparent } = colors;
const { borderRadius } = borders;

export default {
  defaultProps: {
    disableAutoFocusItem: true,
  },

  styleOverrides: {
    "& .MuiIcon-root": ({ theme }) => ({
      stroke: theme.palette.mode === "dark" ? white.main : theme.palette.dark.main,
    }),
    paper: ({ theme }) => ({
      minWidth: pxToRem(160),
      boxShadow: lg,
      padding: `0 !important`,
      fontSize: size.sm,
      color: theme.palette.mode === "dark" ? white.main : theme.palette.dark.main,
      textAlign: "left",
      border: `${borderWidth[1]} solid ${theme.palette.mode === "dark" ? borderCol.navbar : theme.palette.divider}`,
      borderRadius: borderRadius.md,
      backgroundColor: theme.palette.mode === "dark" ? "transparent" : theme.palette.background.paper,
    }),
    list: ({ theme }) => ({
      background:
        theme.palette.mode === "dark"
          ? linearGradient(gradients.menu.main, gradients.menu.state, gradients.menu.deg)
          : theme.palette.background.paper,
      "& .MuiMenuItem-root": {
        "& .MuiBox-root .MuiTypography-root": {
          color: theme.palette.mode === "dark" ? white.main : theme.palette.dark.main,
        },
        "&:hover": {
          background: transparent.main,
        },
      },
    }),
  },
};
