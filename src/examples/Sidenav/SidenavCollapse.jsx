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

import { useLocation, NavLink } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import Collapse from "@mui/material/Collapse";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Icon from "@mui/material/Icon";
import Link from "@mui/material/Link";
import { keyframes } from "@mui/material";

// Vision UI Dashboard React components
import VuiBox from "components/VuiBox";

// Custom styles for the SidenavCollapse
import {
  collapseItem,
  collapseIconBox,
  collapseIcon,
  collapseText,
} from "examples/Sidenav/styles/sidenavCollapse";

// Vision UI Dashboard React context
import { useVisionUIController } from "context";

// Define animation for active indicator
const slideIn = keyframes`
  from {
    transform: translateX(-10px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

function SidenavCollapse({ color, icon, name, children, active, noCollapse, open, href, route, ...rest }) {
  const [controller] = useVisionUIController();
  const { miniSidenav, transparentSidenav, darkMode } = controller;

  // Determine if this is an external link or internal route
  const isExternal = !!href;
  const linkProps = isExternal
    ? {
        component: "a",
        href: href,
        target: "_blank",
        rel: "noreferrer",
      }
    : {
        component: NavLink,
        to: route,
      };

  return (
    <ListItem 
      {...linkProps}
      button
      sx={{ 
        position: "relative",
        mb: 0.5,
        textDecoration: "none",
      }}
      aria-label={name}
    >
      {/* Active indicator bar */}
      {active && (
        <VuiBox
          sx={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            width: "4px",
            height: "60%",
            background: darkMode
              ? "linear-gradient(180deg, #4318ff 0%, #0075ff 100%)"
              : "linear-gradient(180deg, #4318ff 0%, #7c3aed 100%)",
            borderRadius: "0 4px 4px 0",
            animation: `${slideIn} 0.3s ease-out`,
            boxShadow: darkMode 
              ? "0 0 12px rgba(67, 24, 255, 0.6)" 
              : "0 0 8px rgba(67, 24, 255, 0.4)",
            zIndex: 1,
          }}
          aria-hidden="true"
        />
      )}
      <VuiBox 
        {...rest} 
        sx={(theme) => collapseItem(theme, { 
          active, 
          transparentSidenav,
          darkMode,
        })}
      >
        <ListItemIcon
          sx={(theme) => collapseIconBox(theme, { 
            active, 
            transparentSidenav, 
            color,
            darkMode,
          })}
        >
          {typeof icon === "string" ? (
            <Icon sx={(theme) => collapseIcon(theme, { active })} aria-hidden="true">{icon}</Icon>
          ) : (
            <span aria-hidden="true">{icon}</span>
          )}
        </ListItemIcon>

        <ListItemText
          primary={name}
          sx={(theme) => collapseText(theme, { 
            miniSidenav, 
            transparentSidenav, 
            active,
            darkMode,
          })}
        />
      </VuiBox>
    </ListItem>
  );
}

// Setting default values for the props of SidenavCollapse
SidenavCollapse.defaultProps = {
  color: "info",
  active: false,
  noCollapse: false,
  children: false,
  open: false,
  href: null,
  route: null,
};

// Typechecking props for the SidenavCollapse
SidenavCollapse.propTypes = {
  color: PropTypes.oneOf(["info", "success", "warning", "error", "dark"]),
  icon: PropTypes.node.isRequired,
  name: PropTypes.string.isRequired,
  children: PropTypes.node,
  active: PropTypes.bool,
  noCollapse: PropTypes.bool,
  open: PropTypes.bool,
  href: PropTypes.string,
  route: PropTypes.string,
};

export default SidenavCollapse;
