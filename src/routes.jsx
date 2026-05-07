// ByteBattle Routes Configuration

// ByteBattle layouts
import Dashboard from "layouts/dashboard";
import AdminDashboard from "layouts/admin-dashboard";
import AdminUsers from "layouts/admin-users";
import AdminChallenges from "layouts/admin-challenges";
import AdminTournaments from "layouts/admin-tournaments";
import Challenges from "layouts/challenges";
import ChallengeDetail from "layouts/challenge-detail";
import Leaderboard from "layouts/leaderboard";
import Battles from "layouts/battles";
import BattleHistory from "layouts/battle-history";
import BattleRoom from "layouts/battle-room";
import Chat from "layouts/chat";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import ForgotPassword from "layouts/authentication/forgot-password";
import OAuthCallback from "layouts/authentication/oauth-callback";
import Clans from "layouts/clans";
import AdminClans from "layouts/admin-clans";

// React icons
import { IoHome, IoCodeSlash, IoTrophy, IoGameController, IoPerson, IoRocketSharp, IoPeople, IoChatbubbles, IoTime, IoTicket } from "react-icons/io5";
import { IoIosDocument } from "react-icons/io";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    route: "/dashboard",
    icon: <IoHome size="15px" color="inherit" />,
    component: Dashboard,
    authRequired: true,
    noCollapse: true,
  },
  { type: "title", title: "Admin", key: "admin-pages", requiredRole: "admin" },
  {
    type: "collapse",
    name: "Admin Dashboard",
    key: "admin-dashboard",
    route: "/admin/dashboard",
    icon: <IoHome size="15px" color="inherit" />,
    component: AdminDashboard,
    authRequired: true,
    noCollapse: true,
    requiredRole: "admin",
  },
  {
    type: "collapse",
    name: "Manage Users",
    key: "admin-users",
    route: "/admin/users",
    icon: <IoPeople size="15px" color="inherit" />,
    component: AdminUsers,
    authRequired: true,
    noCollapse: true,
    requiredRole: "admin",
  },
  {
  type: "collapse",
  name: "Manage Teams",
  key: "admin-clans",
  route: "/admin/clans",
  icon: <IoPeople size="15px" color="inherit" />,
  component: AdminClans,
  authRequired: true,
  noCollapse: true,
  requiredRole: "admin",
},
  {
    type: "collapse",
    name: "Challenge Tickets",
    key: "admin-challenges",
    route: "/admin/challenges",
    icon: <IoTicket size="15px" color="inherit" />,
    component: AdminChallenges,
    authRequired: true,
    noCollapse: true,
    requiredRole: "admin",
  },
  {
    type: "collapse",
    name: "Tournaments",
    key: "admin-tournaments",
    route: "/admin/tournaments",
    icon: <IoTrophy size="15px" color="inherit" />,
    component: AdminTournaments,
    authRequired: true,
    noCollapse: true,
    requiredRole: "admin",
  },
  {
    type: "collapse",
    name: "Challenges",
    key: "challenges",
    route: "/challenges",
    icon: <IoCodeSlash size="15px" color="inherit" />,
    component: Challenges,
    authRequired: true,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Teams",  // ✅ Add Clans menu item
    key: "Teams",
    route: "/clans",
    icon: <IoPeople size="15px" color="inherit" />,  // Using IoPeople icon
    component: Clans,
    authRequired: true,
    noCollapse: true,
  },
  {
    name: "Challenge Detail",
    key: "challenge-detail",
    route: "/challenges/:challengeId",
    component: ChallengeDetail,
    authRequired: true,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Battles",
    key: "battles",
    route: "/battles",
    icon: <IoGameController size="15px" color="inherit" />,
    component: Battles,
    authRequired: true,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Battle History",
    key: "battle-history",
    route: "/battles/history",
    icon: <IoTime size="15px" color="inherit" />,
    component: BattleHistory,
    authRequired: true,
    noCollapse: true,
    hidden: true,
  },
  {
    name: "Battle Room",
    key: "battle-room",
    route: "/battle/:battleId",
    component: BattleRoom,
    authRequired: true,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Chat",
    key: "chat",
    route: "/chat",
    icon: <IoChatbubbles size="15px" color="inherit" />,
    component: Chat,
    authRequired: true,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Leaderboard",
    key: "leaderboard",
    route: "/leaderboard",
    icon: <IoTrophy size="15px" color="inherit" />,
    component: Leaderboard,
    authRequired: true,
    noCollapse: true,
  },
  { type: "title", title: "Account", key: "account-pages" },
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    route: "/profile",
    icon: <IoPerson size="15px" color="inherit" />,
    component: Profile,
    authRequired: true,
    noCollapse: true,
  },
  {
    name: "Sign In",
    key: "sign-in",
    route: "/authentication/sign-in",
    component: SignIn,
    noCollapse: true,
  },
  {
    name: "Sign Up",
    key: "sign-up",
    route: "/authentication/sign-up",
    component: SignUp,
    noCollapse: true,
  },
  {
    name: "Forgot Password",
    key: "forgot-password",
    route: "/authentication/forgot-password",
    component: ForgotPassword,
    noCollapse: true,
  },
  {
    name: "OAuth Callback",
    key: "oauth-callback",
    route: "/auth/callback",
    component: OAuthCallback,
    noCollapse: true,
  },
];

export default routes;
