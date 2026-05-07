import { useState, useEffect } from "react";
// @mui material components
// @mui icons
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import Grid from "@mui/material/Grid";
// Vision UI Dashboard React components
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import ProfileInfoCard from "examples/Cards/InfoCards/ProfileInfoCard";
import Footer from "examples/Footer";
// Vision UI Dashboard React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
// Overview page components
import Header from "layouts/profile/components/Header";
import PlatformSettings from "layouts/profile/components/PlatformSettings";
import Welcome from "../profile/components/Welcome/index";
import CarInformations from "./components/CarInformations";
import EditProfileModal from "./components/EditProfileModal";
import { useVisionUIController } from "context";
// Auth service
import { authService } from "../../services/auth.service";
// Progress tracker for level calculation
import { progressTrackerService } from "../../services/progressTracker.service";

function Overview() {
  const [controller] = useVisionUIController();
  const { darkMode } = controller;
  const [user, setUser] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user from localStorage first (for immediate display)
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }

    // Then fetch fresh data from API
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setLoading(false);
          return;
        }

        // Get user ID from /auth/me using apiClient
        const meResponse = await fetch('/api/auth/me', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!meResponse.ok) {
          throw new Error('Failed to fetch user info');
        }

        const meData = await meResponse.json();
        const userId = meData.userId || meData.sub;

        // Fetch full user data
        const userResponse = await fetch(`/api/users/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await userResponse.json();
        
        // Update localStorage and state
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleEditProfile = () => {
    setEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Calculate actual level from totalPoints
  const calculateLevel = (totalXp) => {
    const BASE_LEVEL_XP = 40;
    const LEVEL_MULTIPLIER = 1.3;
    
    let remainingXp = Math.max(0, Math.floor(totalXp));
    let level = 1;
    
    let neededForNext = Math.max(1, Math.round(BASE_LEVEL_XP * Math.pow(LEVEL_MULTIPLIER, level - 1)));
    while (remainingXp >= neededForNext) {
      remainingXp -= neededForNext;
      level += 1;
      neededForNext = Math.max(1, Math.round(BASE_LEVEL_XP * Math.pow(LEVEL_MULTIPLIER, level - 1)));
    }
    
    return level;
  };

  const actualLevel = user ? calculateLevel(user.statistics?.totalPoints || user.statistics?.xp || 0) : 1;

  if (loading && !user) {
    return (
      <DashboardLayout>
        <VuiBox display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <VuiTypography color={darkMode ? "white" : "dark"} variant="h5">
            Loading profile...
          </VuiTypography>
        </VuiBox>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header user={user} onEditProfile={handleEditProfile} />
      <EditProfileModal
        open={editModalOpen}
        onClose={handleCloseModal}
        user={user}
        onUpdate={handleUpdateUser}
      />
      <VuiBox mt={5} mb={3}>
        <Grid
          container
          spacing={3}
          sx={({ breakpoints }) => ({
            [breakpoints.only("xl")]: {
              gridTemplateColumns: "repeat(2, 1fr)",
            },
          })}
        >
          <Grid
            item
            xs={12}
            xl={4}
            xxl={3}
            sx={({ breakpoints }) => ({
              minHeight: "400px",
              [breakpoints.only("xl")]: {
                gridArea: "1 / 1 / 2 / 2",
              },
            })}
          >
            <Welcome user={user} />
          </Grid>
          <Grid
            item
            xs={12}
            xl={5}
            xxl={6}
            sx={({ breakpoints }) => ({
              [breakpoints.only("xl")]: {
                gridArea: "2 / 1 / 3 / 3",
              },
            })}
          >
            <CarInformations user={user} />
          </Grid>
          <Grid
            item
            xs={12}
            xl={3}
            xxl={3}
            sx={({ breakpoints }) => ({
              [breakpoints.only("xl")]: {
                gridArea: "1 / 2 / 2 / 3",
              },
            })}
          >
            <ProfileInfoCard
              title="Profile Information"
              description={user?.profile?.bio || `Hi, I'm ${user?.username || 'User'}! Welcome to ByteBattle. I'm passionate about coding and love solving challenging problems. Let's compete and grow together!`}
              info={{
                "Full Name": user?.profile?.fullName || user?.username || "Not set",
                "Email": user?.email || "Not set",
                "Level": `Level ${actualLevel}`,
                "Total Points": `${user?.statistics?.totalPoints || 0} pts`,
                "Challenges Completed": `${user?.statistics?.challengesCompleted || 0}`,
                "Success Rate": `${user?.statistics?.successRate || 0}%`,
              }}
              social={[
                {
                  link: user?.profile?.socialLinks?.facebook || "https://www.facebook.com/",
                  icon: <FacebookIcon />,
                  color: "facebook",
                },
                {
                  link: user?.profile?.socialLinks?.twitter || "https://twitter.com/",
                  icon: <TwitterIcon />,
                  color: "twitter",
                },
                {
                  link: user?.profile?.socialLinks?.instagram || "https://www.instagram.com/",
                  icon: <InstagramIcon />,
                  color: "instagram",
                },
              ]}
            />
          </Grid>
        </Grid>
      </VuiBox>
      <Grid container spacing={3} mb="30px">
        <Grid item xs={12} height="100%">
          <PlatformSettings />
        </Grid>
      </Grid>

      <Footer />
    </DashboardLayout>
  );
}

export default Overview;
