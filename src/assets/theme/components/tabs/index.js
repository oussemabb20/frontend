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
import colors from "assets/theme/base/colors";
import borders from "assets/theme/base/borders";

// Vision UI Dashboard React helper functions
import pxToRem from "assets/theme/functions/pxToRem";

const { grey, info } = colors;
const { borderRadius } = borders;

export default {
  styleOverrides: {
    root: ({ theme }) => ({
      position: "relative",
      backgroundColor: theme.palette.mode === "dark" ? "rgba(9, 14, 46, 0.72)" : grey[100],
      borderRadius: borderRadius.md,
      minHeight: "unset",
      padding: pxToRem(4),
      border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "transparent"}`,
    }),

    flexContainer: {
      height: "100%",
      position: "relative",
      zIndex: 10,
    },

    fixed: {
      overflow: "unset !important",
      overflowX: "unset !important",
    },

    vertical: {
      "& .MuiTabs-indicator": {
        width: "100%",
      },
    },

    indicator: {
      height: "100%",
      borderRadius: borderRadius.lg,
      backgroundColor: info.main,
      transition: "all 500ms ease",
    },
  },
};
