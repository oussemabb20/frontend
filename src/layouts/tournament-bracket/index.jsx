import React, { useState, useEffect } from "react";
import { Card, Grid } from "@mui/material";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiButton from "components/VuiButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { IoArrowBack, IoTrophy, IoCheckmark, IoClose, IoTime } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import { useVisionUIController } from "context";
import tournamentApiService from "services/tournament-api.service";
export default function TournamentBracket() {
  const [controller] = useVisionUIController();
  const {
    darkMode
  } = controller;
  const navigate = useNavigate();
  const {
    tournamentId
  } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRound, setSelectedRound] = useState("Semifinal");
  const headingColor = "var(--theme-var-651)";
  const bodyColor = "var(--theme-var-652)";
  const surfaceBg = "var(--theme-var-653)";
  const surfaceBorder = "var(--theme-var-654)";
  useEffect(() => {
    loadTournament();
  }, [tournamentId]);
  const loadTournament = async () => {
    try {
      setLoading(true);
      const data = await tournamentApiService.getTournament(tournamentId);
      setTournament(data);
    } catch (error) {
      console.error("Failed to load tournament:", error);
    } finally {
      setLoading(false);
    }
  };
  const getRounds = () => {
    const rounds = new Set();
    if (tournament?.matches) {
      tournament.matches.forEach(match => {
        if (match.round) rounds.add(match.round);
      });
    }
    return Array.from(rounds);
  };
  const getMatchesByRound = round => {
    return tournament?.matches?.filter(match => match.round === round) || [];
  };
  const MatchCard = ({
    match
  }) => {
    const isCompleted = match.status === "completed";
    const winner = match.winner;
    return <Card sx={{
      background: isCompleted ? "linear-gradient(135deg, rgba(0, 208, 132, 0.1) 0%, rgba(0, 184, 118, 0.05) 100%)" : surfaceBg,
      border: isCompleted ? "1px solid rgba(0, 208, 132, 0.5)" : surfaceBorder,
      borderRadius: "12px",
      p: 2,
      mb: 2
    }}>
        <VuiBox display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
          <VuiTypography variant="caption" color="info" fontWeight="bold">
            {match.label}
          </VuiTypography>
          {isCompleted && <IoCheckmark size="16px" color="#00D084" />}
        </VuiBox>

        {/* Players */}
        <VuiBox display="flex" flexDirection="column" gap={1} mb={1.5}>
          {match.players && match.players.length > 0 ? match.players.map((player, idx) => <VuiBox key={idx} display="flex" justifyContent="space-between" alignItems="center" p={1} sx={{
          background: winner === player.id ? "rgba(0, 208, 132, 0.15)" : "rgba(255,255,255,0.05)",
          borderRadius: "8px",
          border: winner === player.id ? "1px solid rgba(0, 208, 132, 0.3)" : "none"
        }}>
                <VuiBox display="flex" alignItems="center" gap={1}>
                  {winner === player.id && <IoCheckmark size="14px" color="#00D084" />}
                  <VuiTypography variant="caption" color={headingColor} fontWeight="bold">
                    {player.username}
                  </VuiTypography>
                </VuiBox>
                <VuiTypography variant="caption" color={winner === player.id ? "success" : bodyColor} fontWeight="bold">
                  {match.scores?.[player.id] || 0}
                </VuiTypography>
              </VuiBox>) : <VuiTypography variant="caption" color={bodyColor} fontStyle="italic">
              Waiting for participants...
            </VuiTypography>}
        </VuiBox>

        {/* Status */}
        <VuiBox p={1} sx={{
        background: isCompleted ? "rgba(0, 208, 132, 0.1)" : "rgba(255, 215, 0, 0.1)",
        borderRadius: "6px",
        textAlign: "center"
      }}>
          <VuiTypography variant="caption" color={isCompleted ? "success" : "warning"} fontWeight="bold">
            {isCompleted ? "✓ Completed" : "⏳ In Progress"}
          </VuiTypography>
        </VuiBox>
      </Card>;
  };
  const rounds = getRounds();
  const matchesInSelectedRound = getMatchesByRound(selectedRound);
  if (loading) {
    return <DashboardLayout>
        <DashboardNavbar />
        <VuiBox display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <VuiTypography color={headingColor}>Loading tournament...</VuiTypography>
        </VuiBox>
        <Footer />
      </DashboardLayout>;
  }
  return <DashboardLayout>
      <DashboardNavbar />
      <VuiBox mb={3}>
        {/* Header */}
        <VuiBox display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <VuiBox display="flex" alignItems="center" gap={2}>
            <VuiButton color="secondary" variant="outlined" size="small" onClick={() => navigate("/battles")} sx={{
            minWidth: "auto",
            p: 1
          }}>
              <IoArrowBack size="18px" />
            </VuiButton>
            <VuiBox>
              <VuiTypography variant="h4" color={headingColor} fontWeight="bold">
                <IoTrophy size="28px" style={{
                display: "inline",
                marginRight: "8px",
                verticalAlign: "middle"
              }} color="#FFD700" />
                {tournament?.name || "Tournament"}
              </VuiTypography>
              <VuiTypography variant="caption" color={bodyColor}>
                {tournament?.status === "completed" ? "Tournament Completed" : "Tournament Bracket"}
              </VuiTypography>
            </VuiBox>
          </VuiBox>
          <VuiButton color="info" variant="outlined" onClick={loadTournament}>
            Refresh
          </VuiButton>
        </VuiBox>

        {/* Tournament Info */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
            background: surfaceBg,
            border: surfaceBorder,
            borderRadius: "12px",
            p: 2,
            textAlign: "center"
          }}>
              <VuiTypography variant="caption" color={bodyColor}>
                Participants
              </VuiTypography>
              <VuiTypography variant="h5" color={headingColor} fontWeight="bold">
                {tournament?.registeredUsers?.length || 0}/{tournament?.maxParticipants || 0}
              </VuiTypography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
            background: surfaceBg,
            border: surfaceBorder,
            borderRadius: "12px",
            p: 2,
            textAlign: "center"
          }}>
              <VuiTypography variant="caption" color={bodyColor}>
                Total Matches
              </VuiTypography>
              <VuiTypography variant="h5" color={headingColor} fontWeight="bold">
                {tournament?.matches?.length || 0}
              </VuiTypography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
            background: surfaceBg,
            border: surfaceBorder,
            borderRadius: "12px",
            p: 2,
            textAlign: "center"
          }}>
              <VuiTypography variant="caption" color={bodyColor}>
                Completed
              </VuiTypography>
              <VuiTypography variant="h5" color={headingColor} fontWeight="bold">
                {tournament?.matches?.filter(m => m.status === "completed").length || 0}
              </VuiTypography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
            background: surfaceBg,
            border: surfaceBorder,
            borderRadius: "12px",
            p: 2,
            textAlign: "center"
          }}>
              <VuiTypography variant="caption" color={bodyColor}>
                Prize Pool
              </VuiTypography>
              <VuiTypography variant="h5" color="warning" fontWeight="bold">
                {tournament?.winnerXp || 0} XP
              </VuiTypography>
            </Card>
          </Grid>
        </Grid>

        {/* Round Selector */}
        <VuiBox display="flex" gap={1} mb={3} sx={{
        overflowX: "auto",
        pb: 1
      }}>
          {rounds.map(round => <VuiButton key={round} color={selectedRound === round ? "info" : "secondary"} variant={selectedRound === round ? "contained" : "outlined"} size="small" onClick={() => setSelectedRound(round)} sx={{
          whiteSpace: "nowrap"
        }}>
              {round}
            </VuiButton>)}
        </VuiBox>

        {/* Matches Grid */}
        <Grid container spacing={2}>
          {matchesInSelectedRound.length > 0 ? matchesInSelectedRound.map(match => <Grid item xs={12} md={6} lg={4} key={match.matchKey || match.key}>
                <MatchCard match={match} />
              </Grid>) : <Grid item xs={12}>
              <Card sx={{
            background: surfaceBg,
            border: surfaceBorder,
            borderRadius: "15px",
            p: 3,
            textAlign: "center"
          }}>
                <VuiTypography color={bodyColor}>No matches in this round yet</VuiTypography>
              </Card>
            </Grid>}
        </Grid>
      </VuiBox>
      <Footer />
    </DashboardLayout>;
}