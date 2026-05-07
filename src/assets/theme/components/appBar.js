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

export default {
  defaultProps: {
    color: "transparent",
  },

  styleOverrides: {
    root: ({ theme }) => {
      const isLightMode = theme.palette.mode === "light";

      return {
        boxShadow: "none",
        backgroundColor: isLightMode ? "rgba(255, 255, 255, 0.82)" : "transparent",
        backdropFilter: isLightMode ? "saturate(200%) blur(24px)" : "none",
        border: `1px solid ${isLightMode ? "rgba(148, 163, 184, 0.18)" : "transparent"}`,
      };
    },
  },
};
