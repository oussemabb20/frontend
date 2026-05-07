import React from "react";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import { useVisionUIController } from "context";
import { Card } from "@mui/material";
import { IoTrophy, IoFlame, IoRibbon } from "react-icons/io5";

const LeaderboardCard = ({ rank, username, avatar, score, solvedChallenges, streak, isCurrentUser }) => {
  const [controller] = useVisionUIController();
  const { darkMode } = controller;

  const getRankColor = (position) => {
    switch (position) {
      case 1: return "#FFD700"; // Gold
      case 2: return "#C0C0C0"; // Silver
      case 3: return "#CD7F32"; // Bronze
      default: return "#0075FF";
    }
  };

  const getRankIcon = (position) => {
    if (position <= 3) {
      return <IoTrophy size="24px" color={getRankColor(position)} />;
    }
    return null;
  };

  const showAvatarImage = Boolean(avatar);

  return (
    <Card
      sx={{
        background: isCurrentUser 
          ? darkMode
            ? "linear-gradient(127.09deg, rgba(0, 117, 255, 0.3) 19.41%, rgba(0, 198, 255, 0.2) 76.65%)"
            : "linear-gradient(127.09deg, rgba(219, 234, 254, 0.95) 19.41%, rgba(186, 230, 253, 0.9) 76.65%)"
          : darkMode
            ? "linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.49) 76.65%)"
            : "linear-gradient(127.09deg, rgba(255, 255, 255, 0.98) 19.41%, rgba(241, 245, 249, 0.95) 76.65%)",
        backdropFilter: "saturate(200%) blur(50px)",
        border: isCurrentUser
          ? "2px solid #0075FF"
          : darkMode
            ? "1px solid rgba(255, 255, 255, 0.125)"
            : "1px solid rgba(148, 163, 184, 0.35)",
        borderRadius: "16px",
        marginBottom: "12px",
        transition: "all 0.3s",
        overflow: "hidden",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0px 12px 24px rgba(0, 117, 255, 0.2)",
        }
      }}
    >
      <VuiBox
        p={2}
        display="flex"
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        flexDirection={{ xs: "column", md: "row" }}
        gap={{ xs: 2, md: 1 }}
      >
        {/* Rank & User Info */}
        <VuiBox display="flex" alignItems="center" gap={2} flex={1}>
          {/* Rank */}
          <VuiBox 
            display="flex" 
            alignItems="center" 
            justifyContent="center"
            sx={{
              minWidth: "58px",
              minHeight: "58px",
              borderRadius: "14px",
              background: darkMode ? "rgba(30, 41, 59, 0.75)" : "rgba(226, 232, 240, 0.7)",
            }}
          >
            <VuiBox textAlign="center" lineHeight={1}>
              {getRankIcon(rank) || (
                <VuiTypography variant="h4" color={darkMode ? "white" : "dark"} fontWeight="bold">
                  #{rank}
                </VuiTypography>
              )}
              {rank <= 3 && (
                <VuiTypography variant="caption" color={darkMode ? "text" : "dark"}>
                  #{rank}
                </VuiTypography>
              )}
            </VuiBox>
          </VuiBox>

          {/* Avatar */}
          <VuiBox
            sx={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #0075FF, #00C6FF)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "20px",
              color: "white",
              overflow: "hidden",
            }}
          >
            {showAvatarImage ? (
              <img
                src={avatar}
                alt={username}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              username?.charAt(0).toUpperCase()
            )}
          </VuiBox>

          {/* Username */}
          <VuiBox>
            <VuiTypography variant="button" color={darkMode ? "white" : "dark"} fontWeight="bold" sx={{ fontSize: "1rem" }}>
              {username}
              {isCurrentUser && (
                <VuiTypography 
                  component="span" 
                  variant="caption" 
                  color="info" 
                  fontWeight="bold"
                  sx={{ ml: 1 }}
                >
                  (You)
                </VuiTypography>
              )}
            </VuiTypography>
            <VuiTypography variant="caption" color={darkMode ? "text" : "dark"}>
              {solvedChallenges} challenges solved
            </VuiTypography>
          </VuiBox>
        </VuiBox>

        {/* Stats */}
        <VuiBox display="flex" gap={2} alignItems="center" width={{ xs: "100%", md: "auto" }} justifyContent="space-between">
          {/* Streak */}
          <VuiBox display="flex" alignItems="center" gap={1}>
            <IoFlame size="20px" color="#FF4500" />
            <VuiBox>
              <VuiTypography variant="button" color={darkMode ? "white" : "dark"} fontWeight="bold">
                {streak}
              </VuiTypography>
              <VuiTypography variant="caption" color={darkMode ? "text" : "dark"} display="block">
                day streak
              </VuiTypography>
            </VuiBox>
          </VuiBox>

          {/* Score */}
          <VuiBox 
            display="flex" 
            alignItems="center" 
            gap={1}
            sx={{
              background: darkMode ? "rgba(0, 117, 255, 0.2)" : "rgba(0, 117, 255, 0.12)",
              padding: "8px 16px",
              borderRadius: "10px",
              minWidth: "100px",
            }}
          >
            <IoRibbon size="20px" color="#0075FF" />
            <VuiBox>
              <VuiTypography variant="h5" color={darkMode ? "white" : "dark"} fontWeight="bold">
                {score.toLocaleString()}
              </VuiTypography>
              <VuiTypography variant="caption" color={darkMode ? "text" : "dark"}>
                XP
              </VuiTypography>
            </VuiBox>
          </VuiBox>
        </VuiBox>
      </VuiBox>
    </Card>
  );
};

export default LeaderboardCard;
