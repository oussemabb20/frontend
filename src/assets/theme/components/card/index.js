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

// Vision UI Dashboard React Base Styles
import colors from "assets/theme/base/colors";
import linearGradient from "assets/theme/functions/linearGradient";
import borders from "assets/theme/base/borders";
import boxShadows from "assets/theme/base/boxShadows";

// Vision UI Dashboard React Helper Function
import rgba from "assets/theme/functions/rgba";

const { black, gradients, grey, white } = colors;
const { card } = gradients;
const { borderWidth, borderRadius } = borders;
const { xxl } = boxShadows;

export default {
  styleOverrides: {
    root: ({ theme }) => {
      const isLightMode = theme.palette.mode === "light";

      return {
        display: "flex",
        flexDirection: "column",
        background: isLightMode
          ? linearGradient("rgba(255, 255, 255, 0.98)", "rgba(241, 245, 249, 0.94)", "127.09deg")
          : linearGradient(card.main, card.state, card.deg),
        backdropFilter: "blur(120px)",
        position: "relative",
        minWidth: 0,
        padding: "22px",
        wordWrap: "break-word",
        backgroundClip: "border-box",
        border: `${borderWidth[0]} solid ${isLightMode ? rgba(grey[300], 0.55) : rgba(black.main, 0.125)}`,
        borderRadius: borderRadius.xl,
        boxShadow: isLightMode ? "0 20px 45px rgba(15, 23, 42, 0.08)" : xxl,
      };
    },
  },
};
