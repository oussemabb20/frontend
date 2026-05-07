// ByteBattle Dashboard - Main Overview
// @mui material components
import Grid from "@mui/material/Grid";
import { Card, Box, keyframes } from "@mui/material";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

// Vision UI Dashboard React components
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiProgress from "components/VuiProgress";

// Vision UI Dashboard React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MiniStatisticsCard from "examples/Cards/StatisticsCards/MiniStatisticsCard";
import { useVisionUIController } from "context";

// Custom components
import ChallengeCard from "components/ChallengeCard";
import AchievementBadge from "components/AchievementBadge";

// Services
import challengeService from "services/challenge.service";
import { leaderboardService } from "services/leaderboard.service";
import progressTrackerService from "services/progressTracker.service";

// React icons
import { IoTrophy, IoFlame, IoCodeSlash, IoRibbon, IoTime, IoCheckmarkCircle, IoTrendingUp, IoPerson, IoSparkles } from "react-icons/io5";

// Define keyframe animations
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const glow = keyframes`
  0%, 100% { filter: drop-shadow(0 0 8px rgba(67, 24, 255, 0.4)); }
  50% { filter: drop-shadow(0 0 16px rgba(67, 24, 255, 0.8)); }
`;

function Dashboard() {
  const [controller] = useVisionUIController();
  const { darkMode } = controller;
  const user = useSelector((state) => state.user);

  const [userStats, setUserStats] = useState({
    rank: 0,
    totalXP: 0,
    streak: 0,
    challengesSolved: 0,
    accuracy: 0,
    activeBattles: 0,
    level: 1,
  });
  const [recentChallenges, setRecentChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playerProgress, setPlayerProgress] = useState(progressTrackerService.getLevelProgress());

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Get level progress from local storage
        const progress = progressTrackerService.getLevelProgress();
        setPlayerProgress(progress);

        // Get streak from local storage
        const streak = progressTrackerService.getCurrentSolveStreak();

        // Get solved challenges count
        const solvedChallenges = progressTrackerService.getSolvedChallenges();

        // Get user rank from leaderboard
        let rank = 0;
        let totalUsers = 0;
        try {
          const leaderboard = await leaderboardService.getLeaderboard(100);
          totalUsers = leaderboard.length;
          const userIndex = leaderboard.findIndex(
            (u) => u._id === user.id || u.username === user.username
          );
          rank = userIndex >= 0 ? userIndex + 1 : 0;
        } catch (err) {
          console.error("Failed to fetch leaderboard:", err);
        }

        // Calculate accuracy from submissions
        const submissions = progressTrackerService.getSubmissions();
        const successfulSubmissions = submissions.filter((s) => s.success).length;
        const accuracy = submissions.length > 0 
          ? Math.round((successfulSubmissions / submissions.length) * 100)
          : 0;

        setUserStats({
          rank,
          totalXP: progress.totalXp,
          streak,
          challengesSolved: solvedChallenges.length,
          accuracy,
          activeBattles: 0, // TODO: Fetch from battle service when available
          level: progress.level,
        });

        // Fetch recommended challenges
        try {
          const challenges = await challengeService.getChallenges();
          // Get unsolved challenges
          const unsolvedChallenges = challenges.filter(
            (c) => !solvedChallenges.includes(c._id)
          );
          // Take first 2 unsolved challenges
          setRecentChallenges(unsolvedChallenges.slice(0, 2));
        } catch (err) {
          console.error("Failed to fetch challenges:", err);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const panelBg = darkMode
    ? "linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.49) 76.65%)"
    : "linear-gradient(127.09deg, rgba(255, 255, 255, 0.98) 19.41%, rgba(241, 245, 249, 0.95) 76.65%)";
  const titleColor = darkMode ? "white" : "dark";
  const subTextColor = darkMode ? "text" : "dark";
  const miniPanelBg = darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(15, 23, 42, 0.04)";

  // Recent achievements (keep mock for now as there's no achievement service yet)
  const achievements = [
    {
      title: "First Blood",
      description: "Solve your first challenge",
      icon: "trophy",
      unlocked: userStats.challengesSolved > 0,
      rarity: "common",
    },
    {
      title: "Speed Demon",
      description: "Solve 10 challenges in under 5 minutes",
      icon: "ribbon",
      unlocked: userStats.challengesSolved >= 10,
      rarity: "rare",
    },
    {
      title: "Perfectionist",
      description: "Get 100% accuracy on 50 challenges",
      icon: "star",
      unlocked: false,
      progress: userStats.challengesSolved,
      maxProgress: 50,
      rarity: "epic",
    },
  ];

  // Calculate daily goal progress
  const dailyGoalTarget = 3;
  const dailyGoalProgress = Math.min(userStats.challengesSolved % dailyGoalTarget, dailyGoalTarget);
  const dailyGoalPercent = Math.round((dailyGoalProgress / dailyGoalTarget) * 100);

  // Calculate rank percentile
  const rankPercentile = userStats.rank > 0 ? `Top ${Math.max(1, Math.round((userStats.rank / 100) * 100))}%` : "Unranked";

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <VuiBox py={3}>
        {/* Welcome Section - Enhanced */}
        <Card 
          sx={{
            background: darkMode
              ? "linear-gradient(135deg, rgba(67, 24, 255, 0.25) 0%, rgba(0, 117, 255, 0.15) 100%)"
              : "linear-gradient(135deg, rgba(67, 24, 255, 0.08) 0%, rgba(0, 117, 255, 0.05) 100%)",
            border: darkMode ? "1px solid rgba(67, 24, 255, 0.3)" : "1px solid rgba(67, 24, 255, 0.15)",
            borderRadius: "20px",
            padding: "32px",
            mb: 3,
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: "-50%",
              right: "-20%",
              width: "300px",
              height: "300px",
              background: darkMode 
                ? "radial-gradient(circle, rgba(67, 24, 255, 0.15) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(67, 24, 255, 0.08) 0%, transparent 70%)",
              borderRadius: "50%",
              animation: `${float} 6s ease-in-out infinite`,
            },
          }}
        >
          <VuiBox position="relative" zIndex={1}>
            <VuiBox display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
              <VuiBox>
                <VuiTypography 
                  variant="h1" 
                  color={titleColor} 
                  fontWeight="bold"
                  sx={{
                    background: darkMode
                      ? "linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)"
                      : "linear-gradient(135deg, #4318ff 0%, #0075ff 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mb: 1,
                    fontSize: "1.875rem",
                  }}
                >
                  Welcome back, {user?.username || 'CodeWarrior'}! 👋
                </VuiTypography>
                <VuiTypography variant="body2" color={subTextColor} sx={{ maxWidth: "500px" }}>
                  Ready to sharpen your coding skills today? {userStats.streak > 0 ? `You're on a ${userStats.streak} day streak - keep it going!` : "Start your streak today!"}
                </VuiTypography>
              </VuiBox>
              <VuiBox display="flex" gap={2} flexWrap="wrap">
                <Box
                  sx={{
                    background: darkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(67, 24, 255, 0.08)",
                    border: darkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(67, 24, 255, 0.2)",
                    borderRadius: "12px",
                    padding: "12px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 20px rgba(67, 24, 255, 0.3)",
                    },
                  }}
                >
                  <IoSparkles size="20px" color="#4318ff" />
                  <VuiTypography variant="button" color={titleColor} fontWeight="bold">
                    Level {userStats.level}
                  </VuiTypography>
                </Box>
                <Box
                  sx={{
                    background: darkMode ? "rgba(16, 185, 129, 0.15)" : "rgba(16, 185, 129, 0.1)",
                    border: darkMode ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(16, 185, 129, 0.3)",
                    borderRadius: "12px",
                    padding: "12px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 20px rgba(16, 185, 129, 0.3)",
                    },
                  }}
                >
                  <IoPerson size="20px" color="#10b981" />
                  <VuiTypography variant="button" color={titleColor} fontWeight="bold">
                    {userStats.challengesSolved} solved
                  </VuiTypography>
                </Box>
              </VuiBox>
            </VuiBox>
          </VuiBox>
        </Card>

        {/* Stats Cards - Enhanced with animations */}
        <VuiBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} xl={3}>
              <MiniStatisticsCard
                title={{ text: "Global Rank", fontWeight: "regular" }}
                count={userStats.rank > 0 ? `#${userStats.rank}` : "Unranked"}
                percentage={{ color: "success", text: rankPercentile }}
                icon={{ color: "info", component: <IoTrophy size="22px" color="white" /> }}
                sx={{
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 12px 30px rgba(0, 117, 255, 0.3)",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} xl={3}>
              <MiniStatisticsCard
                title={{ text: "Total XP" }}
                count={userStats.totalXP.toLocaleString()}
                percentage={{ color: "success", text: `Level ${userStats.level}` }}
                icon={{ color: "info", component: <IoRibbon size="22px" color="white" /> }}
                sx={{
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 12px 30px rgba(16, 185, 129, 0.3)",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} xl={3}>
              <MiniStatisticsCard
                title={{ text: "Day Streak" }}
                count={userStats.streak}
                percentage={{ color: "warning", text: "Keep it up!" }}
                icon={{ 
                  color: "info", 
                  component: (
                    <Box sx={{ animation: `${pulse} 2s ease-in-out infinite` }}>
                      <IoFlame size="22px" color="white" />
                    </Box>
                  ) 
                }}
                sx={{
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 12px 30px rgba(245, 158, 11, 0.3)",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} xl={3}>
              <MiniStatisticsCard
                title={{ text: "Challenges Solved" }}
                count={userStats.challengesSolved}
                percentage={{ color: "success", text: `${userStats.accuracy}% accuracy` }}
                icon={{ color: "info", component: <IoCodeSlash size="22px" color="white" /> }}
                sx={{
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 12px 30px rgba(67, 24, 255, 0.3)",
                  },
                }}
              />
            </Grid>
          </Grid>
        </VuiBox>
        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid item xs={12} lg={8}>
            <Grid container spacing={3}>
              {/* Active Battles Card - Enhanced */}
              <Grid item xs={12}>
                <Card
                  sx={{
                    background: darkMode
                      ? "linear-gradient(135deg, rgba(255, 69, 0, 0.25) 0%, rgba(255, 140, 0, 0.15) 100%)"
                      : "linear-gradient(135deg, rgba(255, 237, 213, 0.95) 0%, rgba(254, 215, 170, 0.9) 100%)",
                    border: darkMode ? "2px solid rgba(255, 69, 0, 0.5)" : "2px solid rgba(251, 146, 60, 0.4)",
                    borderRadius: "20px",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 12px 40px rgba(255, 69, 0, 0.3)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <VuiBox p={3}>
                    <VuiBox display="flex" alignItems="center" gap={2} mb={2}>
                      <Box sx={{ animation: `${pulse} 1.5s ease-in-out infinite` }}>
                        <IoFlame size="32px" color="#FF4500" />
                      </Box>
                      <VuiTypography variant="h5" color={titleColor} fontWeight="bold">
                        Active Battles ({userStats.activeBattles})
                      </VuiTypography>
                      <Box
                        sx={{
                          marginLeft: "auto",
                          background: "rgba(255, 69, 0, 0.2)",
                          border: "1px solid rgba(255, 69, 0, 0.4)",
                          borderRadius: "20px",
                          padding: "4px 12px",
                        }}
                      >
                        <VuiTypography variant="caption" color="warning" fontWeight="bold">
                          LIVE
                        </VuiTypography>
                      </Box>
                    </VuiBox>
                    <VuiTypography variant="button" color={subTextColor} mb={2} display="block">
                      {userStats.activeBattles > 0 
                        ? `You have ${userStats.activeBattles} ongoing battles. Complete them to earn bonus XP!`
                        : "No active battles. Join a battle to compete with other developers!"}
                    </VuiTypography>
                    <VuiBox display="flex" gap={2} flexWrap="wrap">
                      <VuiBox
                        sx={{
                          flex: 1,
                          minWidth: "200px",
                          background: miniPanelBg,
                          padding: "16px",
                          borderRadius: "12px",
                          border: darkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(148, 163, 184, 0.2)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-3px)",
                            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
                            border: "1px solid rgba(255, 69, 0, 0.3)",
                          },
                        }}
                      >
                        <VuiTypography variant="button" color={titleColor} fontWeight="bold" mb={1}>
                          1v1 vs CodeMaster
                        </VuiTypography>
                        <VuiBox display="flex" alignItems="center" gap={1}>
                          <IoTime size="16px" color="#FF4500" />
                          <VuiTypography variant="caption" color={titleColor} fontWeight="bold">
                            5:23 remaining
                          </VuiTypography>
                        </VuiBox>
                      </VuiBox>
                      <VuiBox
                        sx={{
                          flex: 1,
                          minWidth: "200px",
                          background: miniPanelBg,
                          padding: "16px",
                          borderRadius: "12px",
                          border: darkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(148, 163, 184, 0.2)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-3px)",
                            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
                            border: "1px solid rgba(255, 69, 0, 0.3)",
                          },
                        }}
                      >
                        <VuiTypography variant="button" color={titleColor} fontWeight="bold" mb={1}>
                          Team Battle
                        </VuiTypography>
                        <VuiBox display="flex" alignItems="center" gap={1}>
                          <IoTime size="16px" color="#FF4500" />
                          <VuiTypography variant="caption" color={titleColor} fontWeight="bold">
                            12:45 remaining
                          </VuiTypography>
                        </VuiBox>
                      </VuiBox>
                    </VuiBox>
                  </VuiBox>
                </Card>
              </Grid>

              {/* Skill Progress - Enhanced */}
              <Grid item xs={12}>
                <Card 
                  sx={{ 
                    background: panelBg,
                    borderRadius: "20px",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 12px 40px rgba(0, 0, 0, 0.2)",
                    },
                  }}
                >
                  <VuiBox p={3}>
                    <VuiBox display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                      <VuiTypography variant="h5" color={titleColor} fontWeight="bold">
                        Skill Progress
                      </VuiTypography>
                      <Box
                        sx={{
                          background: darkMode ? "rgba(0, 117, 255, 0.15)" : "rgba(0, 117, 255, 0.1)",
                          border: "1px solid rgba(0, 117, 255, 0.3)",
                          borderRadius: "20px",
                          padding: "4px 12px",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <IoTrendingUp size="14px" color="#0075ff" />
                        <VuiTypography variant="caption" color="info" fontWeight="bold">
                          Overall: 76%
                        </VuiTypography>
                      </Box>
                    </VuiBox>
                    <VuiBox mb={3}>
                      <VuiBox display="flex" justifyContent="space-between" mb={1}>
                        <VuiTypography variant="button" color={titleColor}>Arrays & Strings</VuiTypography>
                        <VuiTypography variant="button" color={titleColor} fontWeight="bold">85%</VuiTypography>
                      </VuiBox>
                      <VuiProgress value={85} color="info" sx={{ height: "8px", borderRadius: "4px" }} aria-label="Algorithms skill progress: 85%" />
                    </VuiBox>
                    <VuiBox mb={3}>
                      <VuiBox display="flex" justifyContent="space-between" mb={1}>
                        <VuiTypography variant="button" color={titleColor}>Trees & Graphs</VuiTypography>
                        <VuiTypography variant="button" color={titleColor} fontWeight="bold">72%</VuiTypography>
                      </VuiBox>
                      <VuiProgress value={72} color="success" sx={{ height: "8px", borderRadius: "4px" }} aria-label="Data Structures skill progress: 72%" />
                    </VuiBox>
                    <VuiBox mb={3}>
                      <VuiBox display="flex" justifyContent="space-between" mb={1}>
                        <VuiTypography variant="button" color={titleColor}>Dynamic Programming</VuiTypography>
                        <VuiTypography variant="button" color={titleColor} fontWeight="bold">58%</VuiTypography>
                      </VuiBox>
                      <VuiProgress value={58} color="warning" sx={{ height: "8px", borderRadius: "4px" }} aria-label="Dynamic Programming skill progress: 58%" />
                    </VuiBox>
                    <VuiBox>
                      <VuiBox display="flex" justifyContent="space-between" mb={1}>
                        <VuiTypography variant="button" color={titleColor}>Algorithms</VuiTypography>
                        <VuiTypography variant="button" color={titleColor} fontWeight="bold">91%</VuiTypography>
                      </VuiBox>
                      <VuiProgress value={91} color="info" sx={{ height: "8px", borderRadius: "4px" }} aria-label="Problem Solving skill progress: 91%" />
                    </VuiBox>
                  </VuiBox>
                </Card>
              </Grid>

              {/* Recommended Challenges - Enhanced */}
              <Grid item xs={12}>
                <VuiBox display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <VuiTypography variant="h5" color={titleColor} fontWeight="bold">
                    Recommended for You
                  </VuiTypography>
                  <Box
                    sx={{
                      background: darkMode ? "rgba(16, 185, 129, 0.15)" : "rgba(16, 185, 129, 0.1)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      borderRadius: "20px",
                      padding: "4px 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <IoSparkles size="14px" color="#10b981" />
                    <VuiTypography variant="caption" color="success" fontWeight="bold">
                      AI-Powered
                    </VuiTypography>
                  </Box>
                </VuiBox>
                <Grid container spacing={3}>
                  {loading ? (
                    <Grid item xs={12}>
                      <VuiTypography variant="button" color={subTextColor}>
                        Loading challenges...
                      </VuiTypography>
                    </Grid>
                  ) : recentChallenges.length > 0 ? (
                    recentChallenges.map((challenge) => (
                      <Grid item xs={12} md={6} key={challenge._id}>
                        <ChallengeCard
                          title={challenge.title}
                          difficulty={challenge.difficulty}
                          points={challenge.points || 100}
                          category={challenge.category || challenge.tags?.[0] || "General"}
                          solvedCount={challenge.totalSubmissions || 0}
                          totalAttempts={challenge.totalSubmissions || 0}
                          description={challenge.description}
                          tags={challenge.tags || []}
                          onStart={() => window.location.href = `/challenges/${challenge._id}`}
                        />
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <VuiTypography variant="button" color={subTextColor}>
                        No challenges available. Great job solving them all!
                      </VuiTypography>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            <Grid container spacing={3}>
              {/* Achievements - Enhanced */}
              <Grid item xs={12}>
                <Card 
                  sx={{ 
                    background: panelBg,
                    borderRadius: "20px",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 12px 40px rgba(0, 0, 0, 0.2)",
                    },
                  }}
                >
                  <VuiBox p={3}>
                    <VuiBox display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                      <VuiTypography variant="h5" color={titleColor} fontWeight="bold">
                        Recent Achievements
                      </VuiTypography>
                      <Box
                        sx={{
                          background: darkMode ? "rgba(245, 158, 11, 0.15)" : "rgba(245, 158, 11, 0.1)",
                          border: "1px solid rgba(245, 158, 11, 0.3)",
                          borderRadius: "20px",
                          padding: "4px 12px",
                        }}
                      >
                        <VuiTypography variant="caption" color="warning" fontWeight="bold">
                          2/5 Unlocked
                        </VuiTypography>
                      </Box>
                    </VuiBox>
                    <Grid container spacing={2}>
                      {achievements.map((achievement, index) => (
                        <Grid item xs={12} key={index}>
                          <AchievementBadge
                            title={achievement.title}
                            description={achievement.description}
                            icon={achievement.icon}
                            unlocked={achievement.unlocked}
                            progress={achievement.progress}
                            maxProgress={achievement.maxProgress}
                            rarity={achievement.rarity}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </VuiBox>
                </Card>
              </Grid>

              {/* Daily Goal - Enhanced */}
              <Grid item xs={12}>
                <Card
                  sx={{
                    background: darkMode
                      ? "linear-gradient(135deg, rgba(0, 117, 255, 0.35) 0%, rgba(0, 198, 255, 0.25) 100%)"
                      : "linear-gradient(135deg, rgba(219, 234, 254, 0.98) 0%, rgba(186, 230, 253, 0.92) 100%)",
                    border: darkMode ? "2px solid rgba(0, 117, 255, 0.5)" : "2px solid rgba(96, 165, 250, 0.5)",
                    borderRadius: "20px",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 12px 40px rgba(0, 117, 255, 0.3)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <VuiBox p={3}>
                    <VuiBox display="flex" alignItems="center" gap={2} mb={2}>
                      <Box sx={{ animation: `${glow} 2s ease-in-out infinite` }}>
                        <IoCheckmarkCircle size="32px" color="#0075FF" />
                      </Box>
                      <VuiTypography variant="h5" color={titleColor} fontWeight="bold">
                        Daily Goal
                      </VuiTypography>
                    </VuiBox>
                    <VuiTypography variant="button" color={subTextColor} mb={2} display="block">
                      Complete {dailyGoalTarget} challenges today
                    </VuiTypography>
                    <VuiBox mb={2}>
                      <VuiBox display="flex" justifyContent="space-between" mb={1}>
                        <VuiTypography variant="caption" color={subTextColor}>Progress</VuiTypography>
                        <VuiTypography variant="caption" color={titleColor} fontWeight="bold">{dailyGoalProgress}/{dailyGoalTarget} completed</VuiTypography>
                      </VuiBox>
                      <VuiProgress value={dailyGoalPercent} color="info" sx={{ height: "10px", borderRadius: "5px" }} aria-label={`Daily goal progress: ${dailyGoalProgress} out of ${dailyGoalTarget} completed, ${dailyGoalPercent}%`} />
                    </VuiBox>
                    <Box
                      sx={{
                        background: darkMode ? "rgba(16, 185, 129, 0.2)" : "rgba(16, 185, 129, 0.15)",
                        border: "1px solid rgba(16, 185, 129, 0.4)",
                        borderRadius: "12px",
                        padding: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <VuiTypography variant="caption" color="success" fontWeight="bold">
                        🎁 Reward: 500 Bonus XP
                      </VuiTypography>
                    </Box>
                  </VuiBox>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </VuiBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
