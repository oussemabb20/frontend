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

import AppBar from "@mui/material/AppBar";
// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
// Vision UI Dashboard React base styles
import breakpoints from "assets/theme/base/breakpoints";
import VuiAvatar from "components/VuiAvatar";
// Vision UI Dashboard React components
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiButton from "components/VuiButton";
// Vision UI Dashboard React icons
import { IoCube } from "react-icons/io5";
import { IoDocument } from "react-icons/io5";
import { IoPersonCircle } from "react-icons/io5";
// Vision UI Dashboard React example components
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useEffect, useState } from "react";
import { useVisionUIController } from "context";

function Header({ user, onEditProfile }) {
  const [controller] = useVisionUIController();
  const { darkMode } = controller;
  const [tabsOrientation, setTabsOrientation] = useState("horizontal");
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    // A function that sets the orientation state of the tabs.
    function handleTabsOrientation() {
      return window.innerWidth < breakpoints.values.lg
        ? setTabsOrientation("vertical")
        : setTabsOrientation("horizontal");
    }

    /** 
     The event listener that's calling the handleTabsOrientation function when resizing the window.
    */
    window.addEventListener("resize", handleTabsOrientation);

    // Call the handleTabsOrientation function to set the state with the initial value.
    handleTabsOrientation();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleTabsOrientation);
  }, [tabsOrientation]);

  const handleSetTabValue = (event, newValue) => {
    if (newValue === 2) {
      // Edit Profile clicked
      if (onEditProfile) onEditProfile();
    } else {
      setTabValue(newValue);
    }
  };

  return (
    <VuiBox position="relative">
      <DashboardNavbar light />
      <Card
        sx={{
          px: 3,
          py: 1,
          mt: 2,
          background: darkMode
            ? "linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.49) 76.65%)"
            : "linear-gradient(127.09deg, rgba(255, 255, 255, 0.98) 19.41%, rgba(241, 245, 249, 0.95) 76.65%)",
          border: darkMode ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(148, 163, 184, 0.25)",
        }}
      >
        <Grid
          container
          alignItems="center"
          justifyContent="center"
          sx={({ breakpoints }) => ({
            [breakpoints.up("xs")]: {
              gap: "0px",
            },
            [breakpoints.up("xl")]: {
              gap: "0px",
            },
          })}
        >
          <Grid
            item
            xs={12}
            md={1.7}
            lg={1.5}
            xl={1.2}
            xxl={0.8}
            display="flex"
            sx={({ breakpoints }) => ({
              [breakpoints.only("sm")]: {
                justifyContent: "center",
                alignItems: "center",
              },
            })}
          >
            <VuiAvatar
              src={user?.profile?.avatar || user?.providerAvatar || ""}
              alt="profile-image"
              variant="rounded"
              size="xl"
              shadow="sm"
            />
          </Grid>
          <Grid item xs={12} md={4.3} lg={4} xl={3.8} xxl={7}>
            <VuiBox
              height="100%"
              mt={0.5}
              lineHeight={1}
              display="flex"
              flexDirection="column"
              sx={({ breakpoints }) => ({
                [breakpoints.only("sm")]: {
                  justifyContent: "center",
                  alignItems: "center",
                },
              })}
            >
              <VuiTypography component="h1" variant="lg" color={darkMode ? "white" : "dark"} fontWeight="bold">
                {user?.username || 'User'}
              </VuiTypography>
              <VuiTypography variant="button" color={darkMode ? "text" : "dark"} fontWeight="regular">
                {user?.email || 'user@example.com'}
              </VuiTypography>
            </VuiBox>
          </Grid>
          <Grid item xs={12} md={6} lg={6.5} xl={6} xxl={4} sx={{ ml: "auto" }}>
            <AppBar
              position="static"
              sx={{
                background: "transparent !important",
                boxShadow: "none !important",
                border: "none !important",
                backdropFilter: "none !important",
              }}
            >
              <Tabs
                orientation={tabsOrientation}
                value={tabValue}
                onChange={handleSetTabValue}
                aria-label="Profile navigation"
                sx={{
                  background: "transparent",
                  display: "flex",
                  justifyContent: "flex-end",
                  minHeight: "unset",
                  gap: 1,
                  "& .MuiTabs-indicator": {
                    display: "none",
                  },
                  "& .MuiTab-root": {
                    minHeight: "40px",
                    borderRadius: "10px",
                    fontWeight: 700,
                    textTransform: "none",
                    border: darkMode
                      ? "1px solid rgba(255, 255, 255, 0.08)"
                      : "1px solid rgba(148, 163, 184, 0.45)",
                    color: darkMode ? "#ffffff" : "#1e293b",
                    background: darkMode
                      ? "linear-gradient(135deg, rgba(67, 24, 255, 0.95), rgba(124, 58, 237, 0.92))"
                      : "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95))",
                    boxShadow: darkMode
                      ? "0 6px 16px rgba(67, 24, 255, 0.28)"
                      : "0 2px 6px rgba(15, 23, 42, 0.08)",
                  },
                  "& .MuiTab-root.Mui-selected": {
                    color: darkMode ? "#ffffff" : "#0f172a",
                    borderColor: darkMode ? "rgba(255, 255, 255, 0.14)" : "rgba(67, 24, 255, 0.38)",
                    background: darkMode
                      ? "linear-gradient(135deg, rgba(67, 24, 255, 1), rgba(124, 58, 237, 0.95))"
                      : "linear-gradient(135deg, rgba(224, 231, 255, 0.95), rgba(199, 210, 254, 0.95))",
                  },
                }}
              >
                <Tab label="OVERVIEW" icon={<IoCube color={darkMode ? "white" : "#0f172a"} size="16px" />} />
                <Tab label="TEAMS" icon={<IoDocument color={darkMode ? "white" : "#0f172a"} size="16px" />} />
                <Tab label="EDIT PROFILE" icon={<IoPersonCircle color={darkMode ? "white" : "#0f172a"} size="16px" />} />
              </Tabs>
            </AppBar>
          </Grid>
        </Grid>
      </Card>
    </VuiBox>
  );
}

export default Header;
