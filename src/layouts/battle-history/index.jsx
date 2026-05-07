import React, { useEffect, useState } from "react";
import { Grid, Card } from "@mui/material";
import { IoArrowBack, IoGameController } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiButton from "components/VuiButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import battleService from "services/battle.service";
import { useVisionUIController } from "context";

function BattleHistory() {
  const [controller] = useVisionUIController();
  const { darkMode } = controller;
  const [battleHistory, setBattleHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const headingColor = darkMode ? "white" : "dark";
  const bodyColor = darkMode ? "text" : "dark";
  const surfaceBg = darkMode
    ? "linear-gradient(127.09deg, rgba(15, 30, 60, 0.8) 19.41%, rgba(9, 15, 35, 0.7) 76.65%)"
    : "linear-gradient(127.09deg, rgba(255, 255, 255, 0.98) 19.41%, rgba(241, 245, 249, 0.95) 76.65%)";
  const surfaceBorder = darkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid rgba(148, 163, 184, 0.35)";

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    battleService.initializeSocket(token || undefined);

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user._id && user.username) {
      battleService.setCurrentUser(user._id, user.username);
    }

    loadBattleHistory();

    const refreshInterval = globalThis.setInterval(() => {
      loadBattleHistory();
    }, 5000);

    const onFocus = () => {
      loadBattleHistory();
    };
    globalThis.addEventListener("focus", onFocus);

    return () => {
      globalThis.clearInterval(refreshInterval);
      globalThis.removeEventListener("focus", onFocus);
    };
  }, []);

  const loadBattleHistory = async () => {
    try {
      const response = await battleService.getBattleHistory();

      const historyRows = Array.isArray(response)
        ? response
        : Array.isArray(response?.battles)
          ? response.battles
          : Array.isArray(response?.history)
            ? response.history
            : [];

      setBattleHistory(historyRows);
    } catch (error) {
      console.error("Error loading battle history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatHistoryDate = (value) => {
    if (!value) return "Unknown time";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Unknown time";
    return date.toLocaleString();
  };

  const HistoryBattleCard = ({ battle }) => {
    const playerA = battle?.playerA?.username || "Unknown";
    const playerB = battle?.playerB?.username || "Unknown";
    const winner = battle?.winner?.username || "No winner";
    const rewardXp = Number(battle?.winnerRewardXp || 0);
    const players = Array.isArray(battle?.players) ? battle.players : [];
    const teamPlayers = (teamSide) => players.filter((player) => player.team === teamSide);
    const isTeamBattle = battle?.mode === 'team' || Boolean(battle?.teamSize);

    return (
      <Card
        sx={{
          background: surfaceBg,
          border: surfaceBorder,
          borderRadius: "15px",
          marginBottom: "14px",
        }}
      >
        <VuiBox p={2.4}>
          <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb={1.2}>
            <VuiTypography variant="h6" color={headingColor} fontWeight="bold">
              {battle?.mode || "Battle"} History
            </VuiTypography>
            <VuiTypography variant="caption" color={bodyColor}>
              {formatHistoryDate(battle?.endTime || battle?.startTime)}
            </VuiTypography>
          </VuiBox>

          <VuiTypography variant="button" color={bodyColor} display="block" mb={0.8}>
            {isTeamBattle
              ? `Team ${battle?.winnerTeam || 'battle'} • ${battle?.teamSize || 'team mode'}`
              : `Players: ${playerA} vs ${playerB}`}
          </VuiTypography>
          <VuiTypography variant="button" color="warning" display="block" mb={0.8}>
            {battle?.winnerTeam ? `Winning Team: ${battle.winnerTeam}` : `Winner: ${winner}`}
          </VuiTypography>
          {battle?.firstSolverUsername && (
            <VuiTypography variant="button" color={bodyColor} display="block" mb={0.8}>
              First solver: {battle.firstSolverUsername}
            </VuiTypography>
          )}
          <VuiTypography variant="button" color="info" display="block">
            Rewarded XP: +{rewardXp}
          </VuiTypography>
          {isTeamBattle && players.length > 0 && (
            <VuiBox mt={2}>
              {['A', 'B'].map((teamSide) => (
                <VuiBox
                  key={teamSide}
                  sx={{
                    background: teamSide === 'A' ? 'rgba(0, 117, 255, 0.08)' : 'rgba(255, 69, 0, 0.08)',
                    border: teamSide === 'A' ? '1px solid rgba(0, 117, 255, 0.18)' : '1px solid rgba(255, 69, 0, 0.18)',
                    borderRadius: '10px',
                    p: 1.5,
                    mb: 1,
                  }}
                >
                  <VuiTypography variant="caption" color={bodyColor} fontWeight="bold" display="block" mb={0.5}>
                    Team {teamSide}
                  </VuiTypography>
                  <VuiTypography variant="caption" color={bodyColor} display="block">
                    {teamPlayers(teamSide).map((player) => player.username).join(', ') || 'No players'}
                  </VuiTypography>
                </VuiBox>
              ))}
            </VuiBox>
          )}
        </VuiBox>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <VuiBox py={3}>
        <VuiBox mb={3} display="flex" justifyContent="space-between" alignItems="center" gap={2} flexWrap="wrap">
          <VuiTypography variant="h3" color={headingColor} fontWeight="bold" display="flex" alignItems="center" gap={2}>
            <IoGameController size="36px" color="#FF4500" />
            Battle History
          </VuiTypography>
          <VuiButton color="info" onClick={() => navigate("/battles")}> 
            <IoArrowBack size="16px" style={{ marginRight: "8px" }} />
            Back To Battles
          </VuiButton>
        </VuiBox>

        {loading ? (
          <Card
            sx={{
              background: surfaceBg,
              border: surfaceBorder,
              borderRadius: "15px",
            }}
          >
            <VuiBox p={2.5}>
              <VuiTypography variant="button" color={bodyColor}>
                Loading battle history...
              </VuiTypography>
            </VuiBox>
          </Card>
        ) : battleHistory.length === 0 ? (
          <Card
            sx={{
              background: surfaceBg,
              border: surfaceBorder,
              borderRadius: "15px",
            }}
          >
            <VuiBox p={2.5}>
              <VuiTypography variant="button" color={bodyColor}>
                No finished battles yet.
              </VuiTypography>
            </VuiBox>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {battleHistory.map((battle) => (
              <Grid item xs={12} md={6} key={battle._id}>
                <HistoryBattleCard battle={battle} />
              </Grid>
            ))}
          </Grid>
        )}
      </VuiBox>
      <Footer />
    </DashboardLayout>
  );
}

export default BattleHistory;
