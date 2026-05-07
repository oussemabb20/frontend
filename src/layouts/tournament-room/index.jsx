import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Chip, Grid, LinearProgress } from "@mui/material";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiButton from "components/VuiButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import tournamentApiService from "services/tournament-api.service";
import { IoArrowBack, IoCheckmarkCircle, IoCloseCircle, IoGameController, IoHourglass, IoPlay, IoRefresh, IoTime, IoTrophy } from "react-icons/io5";
import { useVisionUIController } from "context";
const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch (error) {
    console.error("Error parsing user from storage:", error);
    return {};
  }
};
const getCurrentUserId = () => {
  const user = getCurrentUser();
  return String(user?._id || user?.id || "");
};
const getCurrentUsername = () => {
  const user = getCurrentUser();
  return String(user?.username || user?.email || "").trim();
};
const formatClock = dateValue => {
  if (!dateValue) return "TBA";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "TBA";
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};
const formatDuration = (dateValue, now) => {
  if (!dateValue) return "";
  const targetTime = new Date(dateValue).getTime();
  if (Number.isNaN(targetTime)) return "";
  const diff = Math.max(0, targetTime - now);
  const totalSeconds = Math.ceil(diff / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const restMinutes = minutes % 60;
    return `${hours}h ${restMinutes}m`;
  }
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
};
const statusColor = status => {
  if (["completed", "bye"].includes(status)) return "#01B574";
  if (status === "forfeited") return "#f53c2b";
  if (status === "active") return "#0075FF";
  if (status === "ready") return "#ffb547";
  return "#a0aec0";
};
function TournamentRoom() {
  const {
    tournamentId
  } = useParams();
  const navigate = useNavigate();
  const [controller] = useVisionUIController();
  const {
    darkMode
  } = controller;
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());
  const userId = getCurrentUserId();
  const username = getCurrentUsername();
  const tournament = state?.tournament;
  const currentMatch = state?.currentMatch;
  const currentBattleId = state?.battleId || currentMatch?.battleId;
  const matchPlayers = currentMatch?.players || [];
  const readyUsers = currentMatch?.readyUsers || [];
  const isReady = readyUsers.some(readyUserId => String(readyUserId) === userId);
  const opponent = matchPlayers.find(player => String(player.userId) !== userId);
  const waitUntil = state?.waitUntil || currentMatch?.availableAt;
  const readyDeadlineAt = state?.readyDeadlineAt || currentMatch?.readyDeadlineAt;
  const waitingForRound = waitUntil && new Date(waitUntil).getTime() > now;
  const waitingForOpponent = currentMatch && matchPlayers.length < 2;
  const readyProgress = matchPlayers.length > 0 ? Math.min(100, readyUsers.length / matchPlayers.length * 100) : 0;
  const surfaceBg = "var(--theme-var-659)";
  const surfaceBorder = "var(--theme-var-660)";
  const headingColor = "var(--theme-var-661)";
  const bodyColor = "var(--theme-var-662)";
  const loadTournamentState = useCallback(async () => {
    if (!tournamentId || !userId) {
      setError("Unable to load your tournament state.");
      setLoading(false);
      return;
    }
    try {
      const nextState = await tournamentApiService.getTournamentState(tournamentId, userId);
      setState(nextState);
      setError("");
      const nextBattleId = nextState?.battleId || nextState?.currentMatch?.battleId;
      if (nextBattleId) {
        navigate(`/battle/${nextBattleId}`);
      }
    } catch (loadError) {
      console.error("Failed to load tournament state:", loadError);
      setError(loadError?.response?.data?.message || loadError?.message || "Failed to load tournament.");
    } finally {
      setLoading(false);
    }
  }, [navigate, tournamentId, userId]);
  useEffect(() => {
    loadTournamentState();
    const refreshId = globalThis.setInterval(loadTournamentState, 5000);
    const tickId = globalThis.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      globalThis.clearInterval(refreshId);
      globalThis.clearInterval(tickId);
    };
  }, [loadTournamentState]);
  const rounds = useMemo(() => {
    const grouped = new Map();
    const matches = Array.isArray(tournament?.matches) ? tournament.matches : [];
    matches.slice().sort((a, b) => Number(a.roundIndex || 0) - Number(b.roundIndex || 0) || Number(a.matchIndex || 0) - Number(b.matchIndex || 0)).forEach(match => {
      const roundKey = `${match.roundIndex}-${match.round || "Round"}`;
      if (!grouped.has(roundKey)) {
        grouped.set(roundKey, {
          title: match.round || "Round",
          matches: []
        });
      }
      grouped.get(roundKey).matches.push(match);
    });
    return Array.from(grouped.values());
  }, [tournament]);
  const handleStartMatch = async () => {
    if (currentBattleId) {
      navigate(`/battle/${currentBattleId}`);
      return;
    }
    if (!tournamentId || !userId || !username) {
      setError("Unable to start without a signed-in player.");
      return;
    }
    try {
      setStarting(true);
      const freshState = await tournamentApiService.getTournamentState(tournamentId, userId);
      if (freshState?.battleId || freshState?.currentMatch?.battleId) {
        const battleId = freshState?.battleId || freshState?.currentMatch?.battleId;
        navigate(`/battle/${battleId}`);
        return;
      }
      if (Array.isArray(freshState?.currentMatch?.readyUsers) && freshState.currentMatch.readyUsers.some(readyUserId => String(readyUserId) === userId)) {
        setState(freshState);
        return;
      }
      const nextState = await tournamentApiService.markReady(tournamentId, {
        userId,
        username
      });
      setState(nextState);
      const nextBattleId = nextState?.battleId || nextState?.currentMatch?.battleId;
      if (nextBattleId) {
        navigate(`/battle/${nextBattleId}`);
      }
    } catch (startError) {
      console.error("Failed to start tournament match:", startError);
      if (startError?.response?.status === 404) {
        try {
          const refreshedState = await tournamentApiService.getTournamentState(tournamentId, userId);
          setState(refreshedState);
          const battleId = refreshedState?.battleId || refreshedState?.currentMatch?.battleId;
          if (battleId) {
            navigate(`/battle/${battleId}`);
            return;
          }
        } catch (refreshError) {
          console.error("Failed to refresh tournament state after 404:", refreshError);
        }
        setError("Match is still syncing. Refresh the room in a moment.");
        return;
      }
      setError(startError?.response?.data?.message || startError?.message || "Could not start the match.");
    } finally {
      setStarting(false);
    }
  };
  const getStartButton = () => {
    if (currentBattleId) {
      return {
        label: "Enter Match",
        disabled: false,
        color: "success",
        icon: <IoGameController size="18px" style={{
          marginRight: "8px"
        }} />
      };
    }
    if (!currentMatch) {
      return {
        label: state?.isEliminated ? "Eliminated" : "Waiting",
        disabled: true,
        color: "secondary",
        icon: <IoHourglass size="18px" style={{
          marginRight: "8px"
        }} />
      };
    }
    if (waitingForOpponent) {
      return {
        label: "Waiting For Opponent",
        disabled: true,
        color: "secondary",
        icon: <IoHourglass size="18px" style={{
          marginRight: "8px"
        }} />
      };
    }
    if (waitingForRound) {
      return {
        label: `Next Round In ${formatDuration(waitUntil, now)}`,
        disabled: true,
        color: "secondary",
        icon: <IoTime size="18px" style={{
          marginRight: "8px"
        }} />
      };
    }
    if (isReady) {
      return {
        label: "Ready - Waiting",
        disabled: true,
        color: "info",
        icon: <IoCheckmarkCircle size="18px" style={{
          marginRight: "8px"
        }} />
      };
    }
    if (currentMatch.status === "active") {
      return {
        label: "Match Active",
        disabled: true,
        color: "secondary",
        icon: <IoHourglass size="18px" style={{
          marginRight: "8px"
        }} />
      };
    }
    return {
      label: starting ? "Starting..." : "Start Match",
      disabled: starting,
      color: "success",
      icon: <IoPlay size="18px" style={{
        marginRight: "8px"
      }} />
    };
  };
  const startButton = getStartButton();
  if (loading) {
    return <DashboardLayout>
        <DashboardNavbar />
        <VuiBox py={3} display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <VuiTypography variant="h4" color={headingColor}>
            Loading tournament...
          </VuiTypography>
        </VuiBox>
        <Footer />
      </DashboardLayout>;
  }
  return <DashboardLayout>
      <DashboardNavbar />
      <VuiBox py={3}>
        <VuiBox mb={3} display="flex" justifyContent="space-between" alignItems={{
        xs: "flex-start",
        md: "center"
      }} flexDirection={{
        xs: "column",
        md: "row"
      }} gap={2}>
          <VuiBox>
            <VuiBox display="flex" alignItems="center" gap={2} mb={1}>
              <VuiButton color="info" variant="outlined" onClick={() => navigate("/battles")} sx={{
              minWidth: "auto",
              padding: "10px 14px"
            }}>
                <IoArrowBack size="20px" />
              </VuiButton>
              <IoTrophy size="32px" color="#FFD700" />
              <VuiTypography variant="h3" color={headingColor} fontWeight="bold">
                {tournament?.name || "Tournament"}
              </VuiTypography>
            </VuiBox>
            <VuiTypography variant="button" color={bodyColor}>
              {tournament?.status || "draft"} · {formatClock(tournament?.startAt)}
            </VuiTypography>
          </VuiBox>
          <VuiButton color="info" onClick={loadTournamentState}>
            <IoRefresh size="18px" style={{
            marginRight: "8px"
          }} />
            Refresh
          </VuiButton>
        </VuiBox>

        {error && <VuiBox mb={3} p={2} sx={{
        background: "rgba(245, 60, 43, 0.12)",
        border: "1px solid rgba(245, 60, 43, 0.35)",
        borderRadius: "12px"
      }}>
            <VuiTypography variant="caption" color="error" fontWeight="bold">
              {error}
            </VuiTypography>
          </VuiBox>}

        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={3}>
            <Card sx={{
            background: surfaceBg,
            border: surfaceBorder,
            borderRadius: "15px"
          }}>
              <VuiBox p={2}>
                <VuiTypography variant="caption" color={bodyColor}>Participants</VuiTypography>
                <VuiTypography variant="h5" color={headingColor} fontWeight="bold">
                  {(tournament?.registeredUsers || []).length}/{tournament?.maxParticipants || 0}
                </VuiTypography>
              </VuiBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{
            background: surfaceBg,
            border: surfaceBorder,
            borderRadius: "15px"
          }}>
              <VuiBox p={2}>
                <VuiTypography variant="caption" color={bodyColor}>Match Length</VuiTypography>
                <VuiTypography variant="h5" color={headingColor} fontWeight="bold">
                  {tournament?.matchDurationMinutes || 0}m
                </VuiTypography>
              </VuiBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{
            background: surfaceBg,
            border: surfaceBorder,
            borderRadius: "15px"
          }}>
              <VuiBox p={2}>
                <VuiTypography variant="caption" color={bodyColor}>No-show Wait</VuiTypography>
                <VuiTypography variant="h5" color={headingColor} fontWeight="bold">
                  {tournament?.noShowWaitMinutes || 0}m
                </VuiTypography>
              </VuiBox>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{
            background: surfaceBg,
            border: surfaceBorder,
            borderRadius: "15px"
          }}>
              <VuiBox p={2}>
                <VuiTypography variant="caption" color={bodyColor}>Prize</VuiTypography>
                <VuiTypography variant="h5" color="warning" fontWeight="bold">
                  {tournament?.winnerXp || 0} XP
                </VuiTypography>
              </VuiBox>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={4}>
            <Card sx={{
            background: surfaceBg,
            border: surfaceBorder,
            borderRadius: "15px",
            height: "100%"
          }}>
              <VuiBox p={3}>
                <VuiTypography variant="h5" color={headingColor} fontWeight="bold" mb={2}>
                  Your Match
                </VuiTypography>

                {currentMatch ? <VuiBox>
                    <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <VuiBox>
                        <VuiTypography variant="caption" color={bodyColor}>{currentMatch.round}</VuiTypography>
                        <VuiTypography variant="h6" color={headingColor} fontWeight="bold">
                          {currentMatch.label}
                        </VuiTypography>
                      </VuiBox>
                      <Chip label={currentMatch.status} size="small" sx={{
                    color: "white",
                    backgroundColor: statusColor(currentMatch.status),
                    textTransform: "capitalize"
                  }} />
                    </VuiBox>

                    <VuiBox mb={2}>
                      <VuiTypography variant="caption" color={bodyColor}>Challenge</VuiTypography>
                      <VuiTypography variant="button" color={headingColor} fontWeight="bold" display="block">
                        {currentMatch.challengeTitle || "Assigned challenge"}
                      </VuiTypography>
                    </VuiBox>

                    <VuiBox mb={2}>
                      <VuiTypography variant="caption" color={bodyColor}>Opponent</VuiTypography>
                      <VuiTypography variant="button" color={headingColor} fontWeight="bold" display="block">
                        {opponent?.username || "TBD"}
                      </VuiTypography>
                    </VuiBox>

                    <VuiBox mb={2}>
                      <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <VuiTypography variant="caption" color={bodyColor}>Ready</VuiTypography>
                        <VuiTypography variant="caption" color={headingColor} fontWeight="bold">
                          {readyUsers.length}/{matchPlayers.length || 2}
                        </VuiTypography>
                      </VuiBox>
                      <LinearProgress variant="determinate" value={readyProgress} sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "var(--theme-var-663)",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: "#01B574"
                    }
                  }} />
                    </VuiBox>

                    {readyDeadlineAt && isReady && <VuiBox mb={2} p={1.5} sx={{
                  background: "rgba(255,181,71,0.12)",
                  borderRadius: "10px"
                }}>
                        <VuiTypography variant="caption" color="warning" fontWeight="bold">
                          No-show decision in {formatDuration(readyDeadlineAt, now)}
                        </VuiTypography>
                      </VuiBox>}

                    <VuiButton color={startButton.color} fullWidth disabled={startButton.disabled} onClick={handleStartMatch}>
                      {startButton.icon}
                      {startButton.label}
                    </VuiButton>
                  </VuiBox> : <VuiBox textAlign="center" py={3}>
                    {state?.isEliminated ? <IoCloseCircle size="48px" color="#f53c2b" /> : <IoHourglass size="48px" color="#ffb547" />}
                    <VuiTypography variant="h6" color={headingColor} fontWeight="bold" mt={2}>
                      {state?.isEliminated ? "Eliminated" : "Waiting"}
                    </VuiTypography>
                    <VuiTypography variant="button" color={bodyColor}>
                      {tournament?.status === "completed" ? "Tournament completed." : "Bracket is updating."}
                    </VuiTypography>
                  </VuiBox>}
              </VuiBox>
            </Card>
          </Grid>

          <Grid item xs={12} lg={8}>
            <Card sx={{
            background: surfaceBg,
            border: surfaceBorder,
            borderRadius: "15px"
          }}>
              <VuiBox p={3}>
                <VuiTypography variant="h5" color={headingColor} fontWeight="bold" mb={2}>
                  Bracket
                </VuiTypography>

                {rounds.length === 0 ? <VuiTypography variant="button" color={bodyColor}>
                    Bracket will appear when the tournament starts.
                  </VuiTypography> : <Grid container spacing={2}>
                    {rounds.map(round => <Grid item xs={12} md={6} key={round.title}>
                        <VuiBox mb={1}>
                          <VuiTypography variant="button" color="warning" fontWeight="bold">
                            {round.title}
                          </VuiTypography>
                        </VuiBox>
                        <VuiBox display="flex" flexDirection="column" gap={1.5}>
                          {round.matches.map(match => {
                      const playerNames = (match.players || []).map(player => player.username).join(" vs ");
                      const isCurrent = match.matchKey === currentMatch?.matchKey;
                      return <VuiBox key={match.matchKey} p={1.5} sx={{
                        borderRadius: "12px",
                        border: isCurrent ? "1px solid #0075FF" : surfaceBorder,
                        background: isCurrent ? "rgba(0,117,255,0.14)" : "var(--theme-var-664)"
                      }}>
                                <VuiBox display="flex" justifyContent="space-between" alignItems="center" gap={1} mb={0.5}>
                                  <VuiTypography variant="caption" color={headingColor} fontWeight="bold">
                                    {match.label}
                                  </VuiTypography>
                                  <VuiTypography variant="caption" sx={{
                            color: statusColor(match.status),
                            textTransform: "capitalize"
                          }}>
                                    {match.status}
                                  </VuiTypography>
                                </VuiBox>
                                <VuiTypography variant="caption" color={bodyColor} display="block">
                                  {playerNames || "TBD"}
                                </VuiTypography>
                                {match.winnerUsername && <VuiBox display="flex" alignItems="center" gap={0.5} mt={0.5}>
                                    <IoCheckmarkCircle size="14px" color="#01B574" />
                                    <VuiTypography variant="caption" color="success" fontWeight="bold">
                                      {match.winnerUsername}
                                    </VuiTypography>
                                  </VuiBox>}
                              </VuiBox>;
                    })}
                        </VuiBox>
                      </Grid>)}
                  </Grid>}
              </VuiBox>
            </Card>
          </Grid>
        </Grid>
      </VuiBox>
      <Footer />
    </DashboardLayout>;
}
export default TournamentRoom;