import React, { useEffect, useMemo, useState } from "react";
import { Grid } from "@mui/material";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiButton from "components/VuiButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import LeaderboardCard from "components/LeaderboardCard";
import { Card, Tabs, Tab } from "@mui/material";
import { IoTrophy, IoFlame, IoTime, IoPeople } from "react-icons/io5";
import { leaderboardService } from "services/leaderboard.service";
import { authService } from "services/auth.service";
import progressTrackerService from "services/progressTracker.service";
import apiClient from "services/api";
import { useVisionUIController } from "context";

function Leaderboard() {
  const [controller] = useVisionUIController();
  const { darkMode } = controller;
  const [selectedTab, setSelectedTab] = useState(0);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError("");
      try {
        let users = await leaderboardService.getLeaderboard(100);
        const currentUser = authService.getCurrentUser();
        const currentUserId = currentUser?.id || currentUser?._id;

        if (currentUser && currentUserId) {
          const localXp = progressTrackerService.getLevelProgress().totalXp;
          const serverCurrentUser = users.find((user) => {
            const userId = user._id || user.id;
            return userId === currentUserId || user.username === currentUser.username || user.email === currentUser.email;
          });

          const serverXp = Number(serverCurrentUser?.statistics?.xp ?? serverCurrentUser?.statistics?.totalPoints ?? 0);
          const serverStreak = Number(serverCurrentUser?.statistics?.currentStreak ?? 0);
          const localStreak = progressTrackerService.getCurrentSolveStreak();

          if (localXp > serverXp || localStreak > serverStreak) {
            const delta = localXp - serverXp;
            const streakDelta = localStreak - serverStreak;
            try {
              await apiClient.patch(`/users/${currentUserId}/stats`, {
                ...(delta > 0 ? { xp: delta, totalPoints: delta } : {}),
                ...(streakDelta > 0 ? { currentStreak: streakDelta } : {}),
              });

              // Re-fetch after migration so UI uses canonical backend values.
              users = await leaderboardService.getLeaderboard(100);
            } catch (syncErr) {
              console.warn("Failed to backfill local XP to backend:", syncErr);
            }
          }
        }

        const mapped = users.map((user, index) => {
          const userId = user._id || user.id;
          const xp = user.statistics?.xp ?? user.statistics?.totalPoints ?? 0;

          return {
            rank: index + 1,
            username: user.username,
            avatar: user.profile?.avatar || user.providerAvatar || "",
            score: Number(xp || 0),
            solvedChallenges: Number(user.statistics?.challengesCompleted || 0),
            streak: Number(user.statistics?.currentStreak || 0),
            isCurrentUser:
              !!currentUser &&
              (userId === currentUserId || user.username === currentUser.username || user.email === currentUser.email),
          };
        });

        setLeaderboardData(mapped);
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
        setError("Failed to load leaderboard.");
      } finally {
        setLoading(false);
      }
    };

    void fetchLeaderboard();
  }, []);

  const currentUserEntry = useMemo(
    () => leaderboardData.find((user) => user.isCurrentUser),
    [leaderboardData],
  );

  const getCurrentData = () => {
    // Backend currently exposes a global leaderboard endpoint.
    // Keep all tabs mapped to real data until weekly/monthly endpoints are added.
    switch (selectedTab) {
      case 0:
        return leaderboardData;
      case 1:
        return leaderboardData;
      case 2:
        return leaderboardData;
      default:
        return leaderboardData;
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const headingColor = darkMode ? "white" : "dark";
  const bodyColor = darkMode ? "text" : "dark";
  const panelBg = darkMode
    ? "linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.49) 76.65%)"
    : "linear-gradient(127.09deg, rgba(255, 255, 255, 0.98) 19.41%, rgba(241, 245, 249, 0.95) 76.65%)";
  const panelBorder = darkMode ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(148, 163, 184, 0.35)";
  const listData = getCurrentData();
  const activeTabLabel = selectedTab === 0 ? "all-time" : selectedTab === 1 ? "weekly" : "monthly";

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <VuiBox py={3}>
        {/* Header */}
        <VuiBox mb={3} display="flex" justifyContent="space-between" alignItems="center">
          <VuiBox>
            <VuiTypography variant="h1" color={headingColor} fontWeight="bold" display="flex" alignItems="center" gap={2} sx={{ fontSize: "1.875rem" }}>
              <IoTrophy size="36px" color="#FFD700" />
              Global Leaderboard
            </VuiTypography>
            <VuiTypography variant="body2" color={bodyColor}>
              Compete with developers worldwide
            </VuiTypography>
          </VuiBox>
          <VuiBox
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: "999px",
              background: darkMode ? "rgba(0, 117, 255, 0.16)" : "rgba(0, 117, 255, 0.08)",
              border: darkMode ? "1px solid rgba(126, 165, 230, 0.3)" : "1px solid rgba(59, 130, 246, 0.25)",
            }}
          >
            <IoPeople size="16px" color="#0075FF" />
            <VuiTypography variant="caption" color={headingColor} fontWeight="bold">
              {leaderboardData.length} players
            </VuiTypography>
          </VuiBox>
        </VuiBox>

        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Card
                  sx={{
                    background: "linear-gradient(127.09deg, rgba(255, 215, 0, 0.3) 19.41%, rgba(255, 165, 0, 0.2) 76.65%)",
                    border: "2px solid #FFD700",
                    borderRadius: "16px",
                    boxShadow: "0 10px 30px rgba(234, 179, 8, 0.14)",
                    height: "100%",
                  }}
                >
                  <VuiBox p={2.5} textAlign="center">
                    <IoTrophy size="32px" color="#FFD700" />
                    <VuiTypography variant="h3" color={headingColor} fontWeight="bold" mt={1}>
                      {currentUserEntry ? `#${currentUserEntry.rank}` : "-"}
                    </VuiTypography>
                    <VuiTypography variant="button" color={bodyColor}>
                      Your Rank
                    </VuiTypography>
                  </VuiBox>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card
                  sx={{
                    background: "linear-gradient(127.09deg, rgba(0, 117, 255, 0.3) 19.41%, rgba(0, 198, 255, 0.2) 76.65%)",
                    border: "2px solid #0075FF",
                    borderRadius: "16px",
                    boxShadow: "0 10px 30px rgba(0, 117, 255, 0.14)",
                    height: "100%",
                  }}
                >
                  <VuiBox p={2.5} textAlign="center">
                    <IoTrophy size="32px" color="#0075FF" />
                    <VuiTypography variant="h3" color={headingColor} fontWeight="bold" mt={1}>
                      {currentUserEntry ? currentUserEntry.score.toLocaleString() : "0"}
                    </VuiTypography>
                    <VuiTypography variant="button" color={bodyColor}>
                      Total XP
                    </VuiTypography>
                  </VuiBox>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card
                  sx={{
                    background: "linear-gradient(127.09deg, rgba(255, 69, 0, 0.3) 19.41%, rgba(255, 140, 0, 0.2) 76.65%)",
                    border: "2px solid #FF4500",
                    borderRadius: "16px",
                    boxShadow: "0 10px 30px rgba(249, 115, 22, 0.14)",
                    height: "100%",
                  }}
                >
                  <VuiBox p={2.5} textAlign="center">
                    <IoFlame size="32px" color="#FF4500" />
                    <VuiTypography variant="h3" color={headingColor} fontWeight="bold" mt={1}>
                      {currentUserEntry ? currentUserEntry.streak : 0}
                    </VuiTypography>
                    <VuiTypography variant="button" color={bodyColor}>
                      Day Streak
                    </VuiTypography>
                  </VuiBox>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Leaderboard */}
          <Grid item xs={12}>
            <Card
              sx={{
                background: panelBg,
                border: panelBorder,
                borderRadius: "18px",
                boxShadow: darkMode ? "0 20px 40px rgba(2, 6, 23, 0.45)" : "0 20px 40px rgba(15, 23, 42, 0.08)",
              }}
            >
              <VuiBox p={3}>
                {/* Tabs */}
                <Tabs
                  value={selectedTab}
                  onChange={handleTabChange}
                  variant="scrollable"
                  allowScrollButtonsMobile
                  sx={{
                    marginBottom: "24px",
                    background: darkMode ? "rgba(8, 20, 48, 0.9) !important" : "rgba(240, 249, 255, 0.95) !important",
                    border: darkMode ? "1px solid rgba(126, 165, 230, 0.28)" : "1px solid rgba(148, 163, 184, 0.35)",
                    borderRadius: "12px",
                    padding: "4px",
                    "& .MuiTab-root": {
                      color: darkMode ? "rgba(195, 219, 255, 0.84) !important" : "#334155 !important",
                      fontWeight: "bold",
                      minHeight: "40px",
                      minWidth: "140px",
                      borderRadius: "8px",
                      transition: "all 200ms ease",
                    },
                    "& .MuiTab-root:hover": {
                      backgroundColor: darkMode ? "rgba(0, 117, 255, 0.12)" : "rgba(14, 165, 233, 0.14)",
                    },
                    "& .MuiTab-root .MuiSvgIcon-root, & .MuiTab-root svg": {
                      color: darkMode ? "rgba(195, 219, 255, 0.84) !important" : "#334155 !important",
                    },
                    "& .Mui-selected": {
                      color: "#ffffff !important",
                      background: darkMode
                        ? "linear-gradient(135deg, rgba(0,117,255,0.9), rgba(0,170,255,0.75))"
                        : "linear-gradient(135deg, rgba(14, 165, 233, 0.95), rgba(37, 99, 235, 0.95))",
                    },
                    "& .Mui-selected .MuiSvgIcon-root, & .Mui-selected svg": {
                      color: "#ffffff !important",
                    },
                    "& .MuiTabs-indicator": {
                      display: "none",
                    },
                  }}
                >
                  <Tab label="All Time" icon={<IoTime size="18px" />} iconPosition="start" />
                  <Tab label="This Week" icon={<IoTime size="18px" />} iconPosition="start" />
                  <Tab label="This Month" icon={<IoTime size="18px" />} iconPosition="start" />
                </Tabs>

                <VuiBox
                  mb={2}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  <VuiTypography variant="button" color={headingColor} fontWeight="bold">
                    {activeTabLabel} ranking
                  </VuiTypography>
                  <VuiTypography variant="caption" color={bodyColor}>
                    Sorted by total XP
                  </VuiTypography>
                </VuiBox>

                {/* Leaderboard List */}
                <VuiBox>
                  {loading && (
                    <VuiTypography variant="button" color="text">
                      Loading leaderboard...
                    </VuiTypography>
                  )}

                  {error && (
                    <VuiTypography variant="button" color="error">
                      {error}
                    </VuiTypography>
                  )}

                  {listData.map((user) => (
                    <LeaderboardCard
                      key={`${user.rank}-${user.username}`}
                      rank={user.rank}
                      username={user.username}
                      avatar={user.avatar}
                      score={user.score}
                      solvedChallenges={user.solvedChallenges}
                      streak={user.streak}
                      isCurrentUser={user.isCurrentUser}
                    />
                  ))}

                  {!loading && !error && listData.length === 0 && (
                    <VuiTypography variant="button" color="text">
                      No users in leaderboard yet.
                    </VuiTypography>
                  )}
                </VuiBox>

                {/* Load More */}
                <VuiBox textAlign="center" mt={3}>
                  <VuiButton color="info" variant="outlined">
                    Load More
                  </VuiButton>
                </VuiBox>
              </VuiBox>
            </Card>
          </Grid>
        </Grid>
      </VuiBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Leaderboard;
