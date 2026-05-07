/*!

=========================================================
* Vision UI Free React - v1.0.0
                    <Icon
                      sx={({ palette: { dark, white } }) => ({
                        color: light ? white.main : dark.main,
                      })}
                      aria-hidden="true"
                    >
                      account_circle
                    </Icon>
=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";

// react-router components
import { useLocation, Link, useNavigate } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @material-ui core components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Icon from "@mui/material/Icon";
import Badge from "@mui/material/Badge";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";

// Vision UI Dashboard React components
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiAvatar from "components/VuiAvatar";
import VuiButton from "components/VuiButton";

// Vision UI Dashboard React example components
import Breadcrumbs from "examples/Breadcrumbs";
import NotificationItem from "examples/Items/NotificationItem";

// Custom styles for DashboardNavbar
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarMobileMenu,
} from "examples/Navbars/DashboardNavbar/styles";

// Vision UI Dashboard React context
import {
  useVisionUIController,
  setTransparentNavbar,
  setMiniSidenav,
} from "context";

// Auth service
import { authService } from "../../../services/auth.service";
import { logout as logoutUser } from "../../../store/slices/userSlice";
import { clanService } from "../../../services/clan.service";

// Helper: get user initials (max 2 chars)
const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

// Helper: deterministic colour from a string
const stringToColor = (str) => {
  const colors = [
    "#0075FF", "#2CD9FF", "#A855F7", "#01B574",
    "#FF6B6B", "#FFB547", "#E91E8C", "#4FD1C5",
  ];
  let hash = 0;
  for (let i = 0; i < (str || "").length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

function DashboardNavbar({ absolute, light, isMini }) {
  const reduxDispatch = useDispatch();
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useVisionUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, darkMode } = controller;
  const [openMenu, setOpenMenu] = useState(false);
  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const route = useLocation().pathname.split("/").slice(1);
  const navigate = useNavigate();

  // Fetch notifications for current user
  const fetchNotifications = async (userId) => {
    if (!userId) return;
    setLoadingNotifications(true);
    try {
      // Get pending invitations
      const pendingInvitations = await clanService.getPendingInvitations(userId);
      
      // Get all notifications (read + pending) and keep a larger result set for detail display
      const allNotifications = await clanService.selectAllNotifications(userId, {
        limit: 100
      });
      
      // Combine and deduplicate
      const combined = [...pendingInvitations, ...allNotifications];
      const unique = combined.filter((notif, index, self) => 
        index === self.findIndex((n) => n._id === notif._id)
      );
      
      // Sort by date (newest first)
      const sorted = clanService.sortNotificationsByDate(unique);
      setNotifications(sorted);
      
      // Get unread count
      const count = await clanService.countUnreadNotifications(userId);
      setUnreadCount(Number(count) || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    // Function to get and set current user
    const updateUser = () => {
      const user = authService.getCurrentUser();
      setCurrentUser(user);
      if (user?.id || user?._id) {
        const userId = user.id || user._id;
        fetchNotifications(userId);
      }
    };

    // Get current user immediately
    updateUser();

    // Also listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'accessToken') {
        updateUser();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Poll for user updates every 5 seconds
    const interval = setInterval(updateUser, 5000);

    // Poll for notifications every 10 seconds
    const notificationInterval = setInterval(() => {
      if (currentUser?.id || currentUser?._id) {
        const userId = currentUser.id || currentUser._id;
        fetchNotifications(userId);
      }
    }, 10000);

    // Setting the navbar type
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    // A function that sets the transparent state of the navbar.
    function handleTransparentNavbar() {
      setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    }

    /** 
     The event listener that's calling the handleTransparentNavbar function when 
     scrolling the window.
    */
    window.addEventListener("scroll", handleTransparentNavbar);

    // Call the handleTransparentNavbar function to set the state with the initial value.
    handleTransparentNavbar();

    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener("scroll", handleTransparentNavbar);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
      clearInterval(notificationInterval);
    };
  }, [dispatch, fixedNavbar]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const handleOpenMenu = (event) => setOpenMenu(event.currentTarget);

  const cleanupNonInvitationNotifications = async () => {
    const userId = currentUser?.id || currentUser?._id;
    if (!userId) return;

    const toDelete = notifications.filter((notif) => notif.type !== 'clan_invitation');
    if (toDelete.length === 0) return;

    await Promise.allSettled(
      toDelete.map((notification) => {
        const notificationId = notification._id || notification.id;
        if (!notificationId) return Promise.resolve();
        return clanService.deleteNotification(notificationId, userId);
      })
    );

    setNotifications((prev) => prev.filter((notif) => notif.type === 'clan_invitation'));
    const count = await clanService.countUnreadNotifications(userId);
    setUnreadCount(Number(count) || 0);
  };

  const handleCloseMenu = () => {
    setOpenMenu(false);
    cleanupNonInvitationNotifications();
  };

  const handleDeleteAllNotifications = async () => {
    try {
      const userId = currentUser?.id || currentUser?._id;
      if (!userId) {
        throw new Error('Current user ID is required to delete notifications');
      }

      await clanService.deleteAllNotifications(userId);
      setNotifications([]);
      setUnreadCount(0);
      handleCloseMenu();
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      alert(error.response?.data?.message || error.message || 'Failed to delete all notifications');
    }
  };

  const handleOpenProfileMenu = (event) => setOpenProfileMenu(event.currentTarget);
  const handleCloseProfileMenu = () => setOpenProfileMenu(false);

  const handleLogout = async () => {
    await authService.logout();
    reduxDispatch(logoutUser());
    handleCloseProfileMenu();
    navigate('/authentication/sign-in');
  };

  const handleProfile = () => {
    handleCloseProfileMenu();
    navigate('/profile');
  };

  const getPendingNotificationCount = (items) => items.filter((notif) => notif.status === 'pending').length;

  useEffect(() => {
    setUnreadCount(getPendingNotificationCount(notifications));
  }, [notifications]);

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    handleCloseMenu();
    
    if (notification.type === 'clan_invitation' && notification.status === 'pending') {
      // Navigate to clans page to accept/reject invitation
      navigate('/clans');
    } else if (notification.clanId) {
      // Navigate to clan page
      navigate('/clans');
    }
  };

  // Handle accept invitation
  const handleAcceptInvitation = async (notification, event) => {
  event.stopPropagation();
  try {
    // Extraire l'ID qu'il soit string ou objet populé
    const clanId = notification.clanId?._id || notification.clanId;
    const userId = currentUser.id || currentUser._id;

    await clanService.acceptInvitation(notification._id, userId, clanId);

    await fetchNotifications(userId);
    navigate('/clans');
  } catch (error) {
    console.error("Error accepting invitation:", error);
    alert(error.response?.data?.message || "Failed to accept invitation");
  }
};

  // Handle reject invitation
  const handleRejectInvitation = async (notification, event) => {
    event.stopPropagation();
    try {
      await clanService.rejectInvitation(notification._id, currentUser.id || currentUser._id);
      // Refresh notifications
      const userId = currentUser.id || currentUser._id;
      await fetchNotifications(userId);
      alert("Invitation rejected");
    } catch (error) {
      console.error("Error rejecting invitation:", error);
      alert(error.response?.data?.message || "Failed to reject invitation");
    }
  };

  
  // Render notification icon with badge
  const renderNotificationIcon = () => {
    const hasUnread = notifications.some(
      (notif) => notif.status === 'pending' && notif.type !== 'clan_invitation'
    );
    const notificationCount = notifications.length;

    return (
      <IconButton
        aria-label={`Notifications${hasUnread ? ' (new unread)' : ''}`}
        size="small"
        color="inherit"
        sx={navbarIconButton}
        aria-controls="notification-menu"
        aria-haspopup="true"
        aria-expanded={Boolean(openMenu)}
        variant="contained"
        onClick={handleOpenMenu}
      >
        <Badge
          badgeContent={notificationCount > 0 ? notificationCount : null}
          color={hasUnread ? 'error' : 'primary'}
          invisible={notificationCount === 0}
          max={99}
        >
          <Icon sx={{ color: hasUnread ? '#FF4444' : (darkMode ? '#ffffff' : '#0f172a') }} aria-hidden="true">
            notifications
          </Icon>
        </Badge>
      </IconButton>
    );
  };

  // Render notification menu
  const renderMenu = () => (
    <Menu
      anchorEl={openMenu}
      anchorReference={null}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      id="notification-menu"
      aria-label="Notifications"
      open={Boolean(openMenu)}
      onClose={handleCloseMenu}
      sx={{ 
        mt: 2,
        '& .MuiPaper-root': {
          width: '440px',
          minWidth: '340px',
          maxWidth: '95vw',
          maxHeight: '80vh',
          backgroundColor: darkMode ? '#071126' : '#ffffff',
          backgroundImage: darkMode ? 'radial-gradient(circle at 15% -20%, rgba(78, 201, 240, 0.15), transparent 45%)' : 'none',
          border: darkMode ? '1px solid rgba(78, 201, 240, 0.2)' : '1px solid rgba(0, 0, 0, 0.12)',
          borderRadius: '18px',
          overflow: 'hidden',
        }
      }}
    >
      <VuiBox p={2}>
        <VuiTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"}>
          Notifications
        </VuiTypography>
        <VuiTypography variant="caption" color="text">
          {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''} • {notifications.length} total
        </VuiTypography>
      </VuiBox>
      
      <Divider sx={{ my: 0 }} />
      
      <VuiBox sx={{ maxHeight: 'calc(80vh - 180px)', overflowY: 'auto' }}>
        {loadingNotifications ? (
          <VuiBox display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress aria-label="Loading notifications" size={32} sx={{ color: "#0075FF" }} />
          </VuiBox>
        ) : notifications.length === 0 ? (
          <VuiBox py={4} textAlign="center">
            <Icon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }}>notifications_none</Icon>
            <VuiTypography variant="body2" color="text">
              No notifications
            </VuiTypography>
          </VuiBox>
        ) : (
          notifications.map((notification) => (
            <Box key={notification._id}>
              <MenuItem 
                onClick={() => handleNotificationClick(notification)}
                sx={{ 
                  flexDirection: 'column', 
                  alignItems: 'flex-start',
                  whiteSpace: 'normal',
                  py: 2,
                  px: 2,
                  backgroundColor: notification.status === 'pending' && notification.type === 'clan_invitation' 
                    ? (darkMode ? 'rgba(78, 201, 240, 0.1)' : 'rgba(0, 117, 255, 0.05)')
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                  }
                }}
              >
                <VuiBox display="flex" alignItems="center" gap={1.5} width="100%">
                  <VuiBox
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: notification.type === 'clan_invitation' 
                        ? 'rgba(0, 117, 255, 0.15)'
                        : 'rgba(78, 201, 240, 0.15)',
                    }}
                  >
                    <Icon sx={{ color: '#4ec9f0' }}>
                      {notification.type === 'clan_invitation' ? 'group_add' : 'notifications'}
                    </Icon>
                  </VuiBox>
                  <VuiBox flex={1}>
                    <VuiTypography variant="body2" fontWeight="medium" color={darkMode ? "white" : "dark"}>
                      {notification.description}
                    </VuiTypography>
                    {notification.metadata?.clanName && (
                      <VuiTypography variant="caption" color="text">
                        Clan: {notification.metadata.clanName}
                      </VuiTypography>
                    )}
                    {notification.type && (
                      <VuiTypography variant="caption" color="text" sx={{ display: 'block', mt: 0.5 }}>
                        Type: {notification.type.replace('_', ' ')}
                      </VuiTypography>
                    )}
                    {notification.status && (
                      <VuiTypography variant="caption" color="text" sx={{ display: 'block', mt: 0.5 }}>
                        Status: {notification.status}
                      </VuiTypography>
                    )}
                    <VuiTypography variant="caption" color="text" sx={{ display: 'block', mt: 0.5 }}>
                      {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : 'Just now'}
                    </VuiTypography>
                  </VuiBox>
                  <VuiBox display="flex" gap={1} alignItems="center">
                    {notification.status === 'pending' && notification.type === 'clan_invitation' && (
                      <VuiBox display="flex" gap={1}>
                        <VuiButton
                          size="small"
                          onClick={(e) => handleAcceptInvitation(notification, e)}
                          sx={{
                            minWidth: 'auto',
                            padding: '4px 12px',
                            fontSize: '0.75rem',
                            background: 'linear-gradient(135deg, #00c7ff 0%, #0075FF 100%)',
                            color: 'white',
                            '&:hover': {
                              transform: 'translateY(-1px)',
                            }
                          }}
                        >
                          Accept
                        </VuiButton>
                        <VuiButton
                          size="small"
                          variant="outlined"
                          onClick={(e) => handleRejectInvitation(notification, e)}
                          sx={{
                            minWidth: 'auto',
                            padding: '4px 12px',
                            fontSize: '0.75rem',
                            borderColor: 'rgba(255, 68, 68, 0.5)',
                            color: '#FF4444',
                            '&:hover': {
                              borderColor: '#FF4444',
                              backgroundColor: 'rgba(255, 68, 68, 0.1)',
                            }
                          }}
                        >
                          Reject
                        </VuiButton>
                      </VuiBox>
                    )}
                 
                  </VuiBox>
                </VuiBox>
              </MenuItem>
              <Divider sx={{ my: 0 }} />
            </Box>
          ))
        )}
      </VuiBox>
      
      {notifications.length > 0 && (
        <>
          <Divider sx={{ my: 0 }} />
          <VuiBox p={1.5} textAlign="center">
            <VuiButton
              fullWidth
              variant="text"
              size="small"
              onClick={handleDeleteAllNotifications}
              sx={{
                color: '#FF4444',
                '&:hover': {
                  backgroundColor: 'rgba(255, 68, 68, 0.1)',
                }
              }}
            >
              Delete All Notifications
            </VuiButton>
          </VuiBox>
        </>
      )}
    </Menu>
  );

  // Render profile menu
  const renderProfileMenu = () => (
    <Menu
      anchorEl={openProfileMenu}
      anchorReference={null}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      open={Boolean(openProfileMenu)}
      onClose={handleCloseProfileMenu}
      sx={{ 
        mt: 2,
        '& .MuiPaper-root': {
          backgroundColor: darkMode ? '#071126' : '#ffffff',
          border: darkMode ? '1px solid rgba(78, 201, 240, 0.2)' : '1px solid rgba(0, 0, 0, 0.12)',
          borderRadius: '16px',
        },
        '& .MuiMenu-list': {
          backgroundColor: darkMode ? 'transparent' : '#ffffff',
        },
        '& .MuiMenuItem-root, & .MuiMenuItem-root .MuiTypography-root': {
          color: darkMode ? '#ffffff' : '#1f2937',
        }
      }}
    >
      <MenuItem onClick={handleProfile}>
        <Icon sx={{ mr: 1, color: '#4ec9f0' }}>person</Icon>
        <VuiTypography variant="button" color={darkMode ? "white" : "dark"}>
          My Profile
        </VuiTypography>
      </MenuItem>
      <MenuItem onClick={handleLogout}>
        <Icon sx={{ mr: 1, color: '#FF4444' }}>logout</Icon>
        <VuiTypography variant="button" color={darkMode ? "white" : "dark"}>
          Logout
        </VuiTypography>
      </MenuItem>
    </Menu>
  );

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) => navbar(theme, { transparentNavbar, absolute, light })}
    >
      <Toolbar sx={(theme) => navbarContainer(theme)}>
        <VuiBox color="inherit" mb={{ xs: 1, md: 0 }} sx={(theme) => navbarRow(theme, { isMini })}>
          <Breadcrumbs icon="home" title={route[route.length - 1]} route={route} light={light} />
        </VuiBox>
        {isMini ? null : (
          <VuiBox sx={(theme) => navbarRow(theme, { isMini })}>
            <VuiBox color={light ? "white" : "inherit"} display="flex" alignItems="center" gap={1}>
              {currentUser ? (
                // Show user profile when logged in
                <VuiBox
                  display="flex"
                  alignItems="center"
                  role="button"
                  tabIndex={0}
                  aria-label="Open profile menu"
                  aria-haspopup="true"
                  aria-expanded={Boolean(openProfileMenu)}
                  sx={{
                    cursor: 'pointer',
                    px: 1.5,
                    py: 0.75,
                    borderRadius: '12px',
                    transition: 'background 0.2s ease',
                    '&:hover': { background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)' },
                  }}
                  onClick={handleOpenProfileMenu}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleOpenProfileMenu(e); } }}
                >
                  {/* Initials avatar */}
                  <VuiBox
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `linear-gradient(135deg, ${stringToColor(currentUser?.username)} 0%, ${stringToColor(currentUser?.username + 'x')} 100%)`,
                      mr: 1,
                      flexShrink: 0,
                    }}
                  >
                    <VuiTypography variant="button" fontWeight="bold" color="white" sx={{ fontSize: '0.8rem', lineHeight: 1 }}>
                      {getInitials(currentUser?.username)}
                    </VuiTypography>
                  </VuiBox>

                  <VuiBox sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', mr: 0.5, maxWidth: '120px' }}>
                    <VuiTypography
                      variant="button"
                      fontWeight="bold"
                      color={darkMode ? "white" : "dark"}
                      sx={{
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: '0.8rem',
                      }}
                    >
                      {currentUser?.username}
                    </VuiTypography>
                    {currentUser?.role && (
                      <VuiTypography
                        variant="caption"
                        color={darkMode ? "text" : "dark"}
                        sx={{ lineHeight: 1.2, fontSize: '0.65rem', textTransform: 'capitalize', opacity: 0.7 }}
                      >
                        {currentUser.role}
                      </VuiTypography>
                    )}
                  </VuiBox>

                  <Icon
                    sx={{
                      color: darkMode ? 'white !important' : '#334155 !important',
                      ml: 0.25,
                      fontSize: '1.1rem !important',
                      opacity: 0.7,
                    }}
                  >
                    keyboard_arrow_down
                  </Icon>
                </VuiBox>
              ) : (
                // Show sign in button when not logged in
                <Link to="/authentication/sign-in">
                  <IconButton sx={navbarIconButton} size="small" aria-label="Sign in to your account">
                    <Icon
                      sx={({ palette: { dark, white } }) => ({
                        color: light ? white.main : dark.main,
                      })}
                      aria-hidden="true"
                    >
                      account_circle
                    </Icon>
                    <VuiTypography
                      variant="button"
                      fontWeight="medium"
                      color={light ? "white" : "dark"}
                    >
                      Sign in
                    </VuiTypography>
                  </IconButton>
                </Link>
              )}
              {currentUser && renderNotificationIcon()}
              {renderProfileMenu()}
              <IconButton
                size="small"
                color="inherit"
                sx={navbarMobileMenu}
                onClick={handleMiniSidenav}
                aria-label={miniSidenav ? "Open navigation menu" : "Close navigation menu"}
              >
                <Icon sx={{ color: darkMode ? "#ffffff" : "#0f172a" }} aria-hidden="true">{miniSidenav ? "menu_open" : "menu"}</Icon>
              </IconButton>
              {currentUser && renderMenu()}
            </VuiBox>
          </VuiBox>
        )}
      </Toolbar>
    </AppBar>
  );
}

// Setting default values for the props of DashboardNavbar
DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

// Typechecking props for the DashboardNavbar
DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;