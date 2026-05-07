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

import { styled } from "@mui/material/styles";

export default styled("div")(({ theme, ownerState }) => {
  const { palette, functions, borders } = theme;
  const { error, success, disabled } = ownerState;

  const { inputColors, grey, white } = palette;
  const isLightMode = palette.mode === "light";
  const { pxToRem } = functions;
  const { borderRadius, borderWidth } = borders;

  // border color value
  let borderColorValue = inputColors.borderColor.main;

  if (error) {
    borderColorValue = inputColors.error;
  } else if (success) {
    borderColorValue = inputColors.success;
  }

  return {
    display: "flex",
    alignItems: "center",
    backgroundColor: disabled ? grey[600] : inputColors.backgroundColor,
    border: `${borderWidth[1]} solid`,
    borderRadius: borderRadius.lg,
    borderColor: borderColorValue,
    "& .MuiIcon-root": {
      color: grey[500],
    },

    "& .MuiInputBase-input": {
      color: isLightMode ? grey[700] : white.main,
      height: "100%",
      paddingX: pxToRem(20),
      backgroundColor: disabled ? grey[600] : isLightMode ? white.main : inputColors.backgroundColor,
    },
    "& .MuiInputBase-root": {
      border: `unset`,
      borderRadius: borderRadius.lg,
      borderTopLeftRadius: "0px",
      borderBottomLeftRadius: "0px",
      backgroundColor: `${disabled ? grey[600] : isLightMode ? white.main : inputColors.backgroundColor} !important`,
      "& ::placeholder": {
        color: `${isLightMode ? grey[500] : white.main} !important`,
      },
    },
  };
});
