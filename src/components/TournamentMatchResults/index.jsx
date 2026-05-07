import React from "react";
import { Card, Grid, Dialog, DialogContent } from "@mui/material";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiButton from "components/VuiButton";
import { IoTrophy, IoArrowForward, IoCheckmark, IoClose } from "react-icons/io5";
import { useVisionUIController } from "context";
export default function TournamentMatchResults({
  tournament,
  matchResult,
  onNextRound,
  onBackToTournament,
  currentUser
}) {
  const [controller] = useVisionUIController();
  const {
    darkMode
  } = controller;
  const headingColor = "var(--theme-var-98)";
  const bodyColor = "var(--theme-var-99)";
  const surfaceBg = "var(--theme-var-100)";
  const surfaceBorder = "var(--theme-var-101)";
  const isWinner = matchResult?.winner === currentUser?._id || matchResult?.winner === currentUser?.id;
  const opponent = matchResult?.opponent || {};
  const winnerId = matchResult?.winner;
  return <Dialog open={true} maxWidth="sm" fullWidth PaperProps={{
    sx: {
      background: surfaceBg,
      border: surfaceBorder,
      borderRadius: "20px"
    }
  }}>
      <DialogContent sx={{
      p: 4
    }}>
        {/* Header */}
        <VuiBox textAlign="center" mb={3}>
          {isWinner ? <>
              <IoTrophy size="48px" color="#FFD700" style={{
            display: "inline-block",
            marginBottom: "16px"
          }} />
              <VuiTypography variant="h4" color={headingColor} fontWeight="bold" mb={1}>
                🎉 You Won!
              </VuiTypography>
            </> : <>
              <IoClose size="48px" color="#FF6B6B" style={{
            display: "inline-block",
            marginBottom: "16px"
          }} />
              <VuiTypography variant="h4" color={headingColor} fontWeight="bold" mb={1}>
                Better luck next time
              </VuiTypography>
            </>}
          <VuiTypography variant="caption" color={bodyColor}>
            {tournament?.name || "Tournament"}
          </VuiTypography>
        </VuiBox>

        {/* Round Info */}
        {tournament?.currentMatch && <Card sx={{
        background: "var(--theme-var-102)",
        border: "1px solid rgba(0, 117, 255, 0.3)",
        borderRadius: "10px",
        p: 2,
        mb: 3,
        textAlign: "center"
      }}>
            <VuiTypography variant="caption" color="info" fontWeight="bold">
              {tournament.currentMatch.round}
            </VuiTypography>
            <VuiTypography variant="h6" color={headingColor} fontWeight="bold">
              {tournament.currentMatch.label}
            </VuiTypography>
          </Card>}

        {/* Match Results */}
        <Grid container spacing={2} mb={3}>
          {/* You */}
          <Grid item xs={12} sm={6}>
            <Card sx={{
            background: isWinner ? "linear-gradient(135deg, rgba(0, 208, 132, 0.2) 0%, rgba(0, 184, 118, 0.1) 100%)" : surfaceBg,
            border: isWinner ? "2px solid #00D084" : surfaceBorder,
            borderRadius: "12px",
            p: 2,
            textAlign: "center"
          }}>
              <VuiBox display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
                <VuiTypography variant="h6" color={headingColor} fontWeight="bold">
                  You
                </VuiTypography>
                {isWinner && <IoCheckmark size="20px" color="#00D084" />}
              </VuiBox>
              <VuiTypography variant="h5" color={isWinner ? "success" : headingColor} fontWeight="bold" mb={1}>
                {matchResult?.yourScore || 0}
              </VuiTypography>
              <VuiTypography variant="caption" color={bodyColor}>
                Points
              </VuiTypography>
            </Card>
          </Grid>

          {/* Opponent */}
          <Grid item xs={12} sm={6}>
            <Card sx={{
            background: !isWinner && winnerId === opponent?.id ? "linear-gradient(135deg, rgba(0, 208, 132, 0.2) 0%, rgba(0, 184, 118, 0.1) 100%)" : surfaceBg,
            border: !isWinner && winnerId === opponent?.id ? "2px solid #00D084" : surfaceBorder,
            borderRadius: "12px",
            p: 2,
            textAlign: "center"
          }}>
              <VuiBox display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
                <VuiTypography variant="h6" color={headingColor} fontWeight="bold">
                  {opponent?.username || "Opponent"}
                </VuiTypography>
                {!isWinner && winnerId === opponent?.id && <IoCheckmark size="20px" color="#00D084" />}
              </VuiBox>
              <VuiTypography variant="h5" color={!isWinner && winnerId === opponent?.id ? "success" : headingColor} fontWeight="bold" mb={1}>
                {matchResult?.opponentScore || 0}
              </VuiTypography>
              <VuiTypography variant="caption" color={bodyColor}>
                Points
              </VuiTypography>
            </Card>
          </Grid>
        </Grid>

        {/* Match Details */}
        <Card sx={{
        background: "var(--theme-var-103)",
        border: surfaceBorder,
        borderRadius: "10px",
        p: 2,
        mb: 3
      }}>
          <VuiBox display="flex" justifyContent="space-between" mb={1}>
            <VuiTypography variant="caption" color={bodyColor}>
              Duration
            </VuiTypography>
            <VuiTypography variant="caption" color={headingColor} fontWeight="bold">
              {matchResult?.duration || "N/A"}
            </VuiTypography>
          </VuiBox>
          <VuiBox display="flex" justifyContent="space-between">
            <VuiTypography variant="caption" color={bodyColor}>
              Completed At
            </VuiTypography>
            <VuiTypography variant="caption" color={headingColor} fontWeight="bold">
              {matchResult?.completedAt ? new Date(matchResult.completedAt).toLocaleTimeString() : "N/A"}
            </VuiTypography>
          </VuiBox>
        </Card>

        {/* Wait for Opponent */}
        {matchResult?.opponentPending && <Card sx={{
        background: "rgba(255, 215, 0, 0.1)",
        border: "1px solid rgba(255, 215, 0, 0.3)",
        borderRadius: "10px",
        p: 2,
        mb: 3,
        textAlign: "center"
      }}>
            <VuiTypography variant="caption" color="warning" fontWeight="bold">
              ⏳ Waiting for opponent to complete their match before next round...
            </VuiTypography>
          </Card>}

        {/* Other Matches Info */}
        {matchResult?.otherMatches && matchResult.otherMatches.length > 0 && <Card sx={{
        background: "var(--theme-var-104)",
        border: surfaceBorder,
        borderRadius: "10px",
        p: 2,
        mb: 3
      }}>
            <VuiTypography variant="caption" color={bodyColor} fontWeight="bold" mb={1} display="block">
              Round Updates
            </VuiTypography>
            {matchResult.otherMatches.map((match, idx) => <VuiBox key={idx} display="flex" justifyContent="space-between" mb={0.5}>
                <VuiTypography variant="caption" color={bodyColor}>
                  {match.label}:
                </VuiTypography>
                <VuiTypography variant="caption" fontWeight="bold" color={match.status === 'completed' ? 'success' : headingColor}>
                  {match.status === 'completed' ? `${match.winner} won` : 'In progress'}
                </VuiTypography>
              </VuiBox>)}
          </Card>}

        {/* Action Buttons */}
        <VuiBox display="flex" gap={2}>
          <VuiButton color="secondary" variant="outlined" fullWidth onClick={onBackToTournament}>
            Back to Tournament
          </VuiButton>
          {!matchResult?.opponentPending && <VuiButton color="success" fullWidth onClick={onNextRound} sx={{
          background: "linear-gradient(135deg, #0075FF, #00C6FF)",
          "&:hover": {
            background: "linear-gradient(135deg, #0060DD, #00B8FF)"
          }
        }}>
              Next Round
              <IoArrowForward size="18px" style={{
            marginLeft: "8px"
          }} />
            </VuiButton>}
        </VuiBox>
      </DialogContent>
    </Dialog>;
}