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
import bgAdmin from "assets/images/body-background.png";

const { info, dark } = colors;
export default {
  html: {
    scrollBehavior: "smooth",
    background: dark.body,
  },
  body: {
    background: `url(${bgAdmin})`,
    backgroundSize: "cover",
  },
  "*, *::before, *::after": {
    margin: 0,
    padding: 0,
  },
  "a, a:link, a:visited": {
    textDecoration: "none !important",
  },
  "a.link, .link, a.link:link, .link:link, a.link:visited, .link:visited": {
    color: `${dark.main} !important`,
    transition: "color 150ms ease-in !important",
  },
  "a.link:hover, .link:hover, a.link:focus, .link:focus": {
    color: `${info.main} !important`,
  },
  "html[data-theme='light']": {
    background: "#ffffff",
  },
  "body[data-theme='light'], html[data-theme='light'] body": {
    background: "#ffffff", // Pure white background
    backgroundAttachment: "fixed",
    color: "#0f172a",
  },
  "body[data-theme='light'] a.link, body[data-theme='light'] .link, body[data-theme='light'] a.link:link, body[data-theme='light'] .link:link, body[data-theme='light'] a.link:visited, body[data-theme='light'] .link:visited": {
    color: "#0f172a !important",
  },
  "body[data-theme='light'] a.link:hover, body[data-theme='light'] .link:hover, body[data-theme='light'] a.link:focus, body[data-theme='light'] .link:focus": {
    color: `${info.main} !important`,
  },
};
