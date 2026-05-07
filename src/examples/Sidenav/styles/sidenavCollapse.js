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

function collapseItem(theme, ownerState) {
  const { palette, transitions, breakpoints, boxShadows, borders, functions } = theme;
  const { active, transparentSidenav, darkMode } = ownerState;

  const { transparent, white, sidenav } = palette;
  const isLightMode = palette.mode === "light";
  const { xxl } = boxShadows;
  const { borderRadius } = borders;
  const { pxToRem } = functions;

  return {
    background: active
      ? isLightMode
        ? "linear-gradient(135deg, rgba(67, 24, 255, 0.15) 0%, rgba(124, 58, 237, 0.1) 100%)"
        : sidenav.button
      : transparent.main,
    color: isLightMode ? (active ? "#4318ff" : palette.dark.main) : white.main,
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: `${pxToRem(10.8)} ${pxToRem(12.8)} ${pxToRem(10.8)} 0`,
    margin: `0 ${pxToRem(16)} 0 0`,
    borderRadius: borderRadius.lg,
    cursor: "pointer",
    userSelect: "none",
    whiteSpace: "nowrap",
    boxShadow: active && transparentSidenav ? (isLightMode ? "0 4px 12px rgba(67, 24, 255, 0.15)" : xxl) : "none",
    transition: transitions.create(["background", "color", "box-shadow", "transform"], {
      easing: transitions.easing.easeInOut,
      duration: transitions.duration.shorter,
    }),
    border: active && isLightMode ? "1px solid rgba(67, 24, 255, 0.3)" : "none",
    paddingLeft: "0 !important",
    "&:hover": {
      background: active 
        ? isLightMode
          ? "linear-gradient(135deg, rgba(67, 24, 255, 0.2) 0%, rgba(124, 58, 237, 0.15) 100%)"
          : sidenav.button
        : isLightMode 
          ? "rgba(67, 24, 255, 0.05)" 
          : "rgba(255, 255, 255, 0.05)",
      transform: "translateX(4px)",
      boxShadow: isLightMode 
        ? "0 4px 12px rgba(67, 24, 255, 0.12)" 
        : "0 4px 12px rgba(0, 0, 0, 0.3)",
    },
    [breakpoints.up("xl")]: {
      boxShadow: () => {
        if (active) {
          return transparentSidenav ? (isLightMode ? "0 4px 12px rgba(67, 24, 255, 0.15)" : xxl) : "none";
        }

        return "none";
      },
      transition: transitions.create(["box-shadow", "background", "color", "transform"], {
        easing: transitions.easing.easeInOut,
        duration: transitions.duration.shorter,
      }),
    },
  };
}

function collapseIconBox(theme, ownerState) {
  const { palette, transitions, breakpoints, boxShadows, borders, functions } = theme;
  const { active, color } = ownerState;

  const { white, info, gradients, transparent, sidenav } = palette;
  const isLightMode = palette.mode === "light";
  const { md } = boxShadows;
  const { borderRadius } = borders;
  const { pxToRem } = functions;

  return {
    background: (active) => {
      if (active) {
        return isLightMode ? palette[color].main : (color === "default" ? white.button : sidenav.button);
      }
      return isLightMode ? "rgba(67, 24, 255, 0.1)" : sidenav.button;
    },
    minWidth: pxToRem(32),
    minHeight: pxToRem(32),
    borderRadius: borderRadius.button,
    display: "grid",
    placeItems: "center",
    boxShadow: isLightMode && !active ? "0 2px 4px rgba(0, 0, 0, 0.08)" : md,
    transition: transitions.create(["background", "box-shadow", "color"], {
      easing: transitions.easing.easeInOut,
      duration: transitions.duration.standard,
    }),

    [breakpoints.up("xl")]: {
      background: () => {
        let background;

        if (!active) {
          background = isLightMode ? "rgba(67, 24, 255, 0.1)" : sidenav.button;
        } else if (color === "default") {
          background = isLightMode ? info.main : info.main;
        } else if (color === "warning") {
          background = isLightMode ? palette[color].main : gradients.warning.main;
        } else {
          background = palette[color].main;
        }

        return background;
      },
    },

    backgroundColor: active
      ? palette[color].main
      : isLightMode
        ? "rgba(67, 24, 255, 0.1)"
        : transparent.main,
    "& svg, svg g": {
      fill: active 
        ? white.main 
        : isLightMode 
          ? palette[color].main 
          : palette[color].main,
    },
  };
}

const collapseIcon = ({ palette: { white, dark, mode, text } }, { active }) => ({
  color: active ? white.main : mode === "light" ? dark.main : text.main,
});

function collapseText(theme, ownerState) {
  const { typography, transitions, breakpoints, functions, palette } = theme;
  const { miniSidenav, active } = ownerState;
  const isLightMode = palette.mode === "light";

  const { size, fontWeightMedium, fontWeightRegular } = typography;
  const { pxToRem } = functions;

  return {
    marginLeft: pxToRem(12.8),

    [breakpoints.up("xl")]: {
      opacity: miniSidenav || miniSidenav ? 0 : 1,
      maxWidth: miniSidenav || miniSidenav ? 0 : "100%",
      marginLeft: miniSidenav || miniSidenav ? 0 : pxToRem(12.8),
      transition: transitions.create(["opacity", "margin"], {
        easing: transitions.easing.easeInOut,
        duration: transitions.duration.standard,
      }),
    },

    "& span": {
      color: active 
        ? isLightMode 
          ? "#ffffff" 
          : "#ffffff"
        : isLightMode 
          ? "#1a202c" 
          : palette.text.main,
      fontWeight: active ? fontWeightMedium : fontWeightRegular,
      fontSize: size.sm,
      lineHeight: 0,
      letterSpacing: active ? "0.5px" : "0px",
    },
  };
}

export { collapseItem, collapseIconBox, collapseIcon, collapseText };
