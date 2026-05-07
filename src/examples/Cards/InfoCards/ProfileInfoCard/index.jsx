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

// prop-types is library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";

// Vision UI Dashboard React components
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import { useVisionUIController } from "context";

// Vision UI Dashboard React base styles
import colors from "assets/theme/base/colors";
import typography from "assets/theme/base/typography";

function ProfileInfoCard({ title, description, info, social }) {
  const [controller] = useVisionUIController();
  const { darkMode } = controller;
  const labels = [];
  const values = [];
  const { size } = typography;

  // Convert this form `objectKey` of the object key in to this `object key`
  Object.keys(info).forEach((el) => {
    if (el.match(/[A-Z\s]+/)) {
      const uppercaseLetter = Array.from(el).find((i) => i.match(/[A-Z]+/));
      const newElement = el.replace(uppercaseLetter, ` ${uppercaseLetter.toLowerCase()}`);

      labels.push(newElement);
    } else {
      labels.push(el);
    }
  });

  // Push the object values into the values array
  Object.values(info).forEach((el) => values.push(el));

  // Render the card info items
  const renderItems = labels.map((label, key) => (
    <VuiBox key={label} display="flex" py={1.2} pr={2} alignItems="center">
      <VuiTypography 
        variant="button" 
        color={darkMode ? "text" : "dark"} 
        fontWeight="medium" 
        textTransform="capitalize"
        sx={{ minWidth: "140px" }}
      >
        {label}:
      </VuiTypography>
      <VuiTypography variant="button" fontWeight="bold" color={darkMode ? "white" : "dark"} sx={{ ml: 1 }}>
        {values[key]}
      </VuiTypography>
    </VuiBox>
  ));

  // Render the card social media icons
  const renderSocial = social.map(({ link, icon, color }) => (
    <VuiBox
      key={color}
      component="a"
      href={link}
      target="_blank"
      rel="noreferrer"
      aria-label={`Visit ${color.charAt(0).toUpperCase() + color.slice(1)} profile`}
      fontSize={size.lg}
      color={darkMode ? "white" : "dark"}
      pr={1.5}
      pl={0.5}
      lineHeight={1}
      sx={{
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          opacity: 0.8,
        },
      }}
    >
      {icon}
    </VuiBox>
  ));

  return (
    <Card
      sx={{
        height: "100%",
        px: 3,
        py: 3,
        background: darkMode
          ? "linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.49) 76.65%)"
          : "linear-gradient(127.09deg, rgba(255, 255, 255, 0.99) 19.41%, rgba(241, 245, 249, 0.96) 76.65%)",
        border: darkMode ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(148, 163, 184, 0.35)",
        backdropFilter: "blur(42px)",
        borderRadius: "20px",
      }}
    >
      <VuiBox display="flex" mb="14px" justifyContent="space-between" alignItems="center">
        <VuiTypography variant="lg" fontWeight="bold" color={darkMode ? "white" : "dark"} textTransform="capitalize">
          {title}
        </VuiTypography>
      </VuiBox>
      <VuiBox>
        <VuiBox mb={2.5} lineHeight={1.6}>
          <VuiTypography variant="button" color={darkMode ? "text" : "dark"} fontWeight="regular" sx={{ lineHeight: 1.8 }}>
            {description}
          </VuiTypography>
        </VuiBox>
        <VuiBox opacity={0.3} mb={2}>
          <Divider />
        </VuiBox>
        <VuiBox>
          {renderItems}
          <VuiBox opacity={0.3} my={2}>
            <Divider />
          </VuiBox>
          <VuiBox display="flex" py={1} pr={2} alignItems="center" color="white">
            <VuiTypography
              variant="button"
              fontWeight="medium"
              color={darkMode ? "text" : "dark"}
              textTransform="capitalize"
              sx={{ minWidth: "140px" }}
            >
              Social:
            </VuiTypography>
            <VuiBox display="flex" ml={1}>
              {renderSocial}
            </VuiBox>
          </VuiBox>
        </VuiBox>
      </VuiBox>
    </Card>
  );
}

// Typechecking props for the ProfileInfoCard
ProfileInfoCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  info: PropTypes.objectOf(PropTypes.string).isRequired,
  social: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default ProfileInfoCard;
