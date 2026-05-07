import React, { useState, useEffect } from "react";
import { Card, Dialog, DialogContent, Backdrop, CircularProgress } from "@mui/material";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiButton from "components/VuiButton";
import { IoPlay, IoPeople, IoTime, IoCheckmark } from "react-icons/io5";
import { useVisionUIController } from "context";
export default function TournamentWaitingRoom({
  tournament,
  onStartMatch,
  onCancel,
  currentUser,
  opponent = null,
  userReady = false,
  opponentReady = false,
  waitingTimeSeconds = 0
}) {
  const [controller] = useVisionUIController();
  const {
    darkMode
  } = controller;
  const [countdown, setCountdown] = useState(waitingTimeSeconds);
  const [isAutoStarting, setIsAutoStarting] = useState(false);
  const headingColor = "var(--theme-var-124)";
  const bodyColor = "var(--theme-var-125)";
  const surfaceBg = "var(--theme-var-126)";
  const surfaceBorder = "var(--theme-var-127)";

  // Handle countdown for auto-start after waiting time
  useEffect(() => {
    if (!isAutoStarting || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsAutoStarting(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isAutoStarting, countdown, onStartMatch]);

  // Start countdown when both players are ready
  useEffect(() => {
    if (userReady && opponentReady && waitingTimeSeconds > 0 && !isAutoStarting) {
      setCountdown(waitingTimeSeconds);
      setIsAutoStarting(true);
    }
  }, [userReady, opponentReady, waitingTimeSeconds, isAutoStarting]);
  const PlayerCard = ({
    player,
    isReady,
    label = "Player"
  }) => <Card sx={{
    background: surfaceBg,
    border: surfaceBorder,
    borderRadius: "12px",
    p: 2,
    textAlign: "center",
    position: "relative",
    borderLeft: isReady ? "4px solid #4FD1C7" : "4px solid rgba(255,255,255,0.2)",
    transition: "all 0.3s ease",
    ...(isReady && {
      boxShadow: "0 0 16px rgba(79, 209, 199, 0.3)"
    })
  }}>
      <VuiBox display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
        <VuiTypography variant="caption" color={bodyColor} fontWeight="bold">
          {label}
        </VuiTypography>
        {isReady && <IoCheckmark size="16px" color="#4FD1C7" />}
      </VuiBox>
      <VuiTypography variant="h6" color={headingColor} fontWeight="bold" mb={0.5}>
        {player?.username || "Loading..."}
      </VuiTypography>
      <VuiTypography variant="caption" color={bodyColor}>
        {isReady ? "Ready ✓" : "Not Ready"}
      </VuiTypography>
    </Card>;
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
        <VuiBox display="flex" alignItems="center" justifyContent="center" gap={2} mb={3}>
          <IoPeople size="32px" color="#FFD700" />
          <VuiBox>
            <VuiTypography variant="h5" color={headingColor} fontWeight="bold">
              Match Waiting Room
            </VuiTypography>
            <VuiTypography variant="caption" color={bodyColor}>
              {tournament?.name || "Tournament"}
            </VuiTypography>
          </VuiBox>
        </VuiBox>

        {/* Round Info */}
        {tournament?.currentMatch && <Card sx={{
        background: "var(--theme-var-128)",
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

        {/* Players Status */}
        <VuiBox display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={3}>
          <PlayerCard player={currentUser} isReady={userReady} label="You" />
          <PlayerCard player={opponent} isReady={opponentReady} label="Opponent" />
        </VuiBox>

        {/* Status Message */}
        <Card sx={{
        background: "var(--theme-var-129)",
        border: surfaceBorder,
        borderRadius: "10px",
        p: 2,
        mb: 3,
        textAlign: "center"
      }}>
          {!userReady && <VuiBox display="flex" alignItems="center" justifyContent="center" gap={1}>
              <IoTime size="18px" color="#FFD700" />
              <VuiTypography variant="caption" color={bodyColor} fontWeight="bold">
                Press "Start" when you're ready to begin
              </VuiTypography>
            </VuiBox>}

          {userReady && !opponentReady && <VuiBox display="flex" alignItems="center" justifyContent="center" gap={1}>
              <CircularProgress size={16} sx={{
            color: "#0075FF"
          }} />
              <VuiTypography variant="caption" color="info" fontWeight="bold">
                Waiting for opponent...
              </VuiTypography>
            </VuiBox>}

          {userReady && opponentReady && waitingTimeSeconds > 0 && <VuiBox display="flex" alignItems="center" justifyContent="center" gap={2}>
              <VuiTypography variant="caption" color="success" fontWeight="bold">
                ✓ Both ready! Match starting in
              </VuiTypography>
              <VuiTypography variant="h5" color="success" fontWeight="bold" sx={{
            animation: "pulse 1s infinite",
            "@keyframes pulse": {
              "0%, 100%": {
                opacity: 1
              },
              "50%": {
                opacity: 0.6
              }
            }
          }}>
                {countdown}s
              </VuiTypography>
            </VuiBox>}

          {userReady && opponentReady && waitingTimeSeconds === 0 && <VuiTypography variant="caption" color="success" fontWeight="bold">
              ✓ Both players ready! Match starting...
            </VuiTypography>}
        </Card>

        {/* Action Buttons */}
        <VuiBox display="flex" gap={2}>
          {!userReady ? <>
              <VuiButton color="success" fullWidth onClick={onStartMatch} sx={{
            background: "linear-gradient(135deg, #00D084, #00B876)",
            "&:hover": {
              background: "linear-gradient(135deg, #00E894, #00C788)"
            }
          }}>
                <IoPlay size="18px" style={{
              marginRight: "8px"
            }} />
                I'm Ready - Start Match
              </VuiButton>
              <VuiButton color="secondary" variant="outlined" onClick={onCancel}>
                Cancel
              </VuiButton>
            </> : <VuiButton fullWidth disabled={true} sx={{
          color: "#4FD1C7",
          background: "rgba(79, 209, 199, 0.1)",
          border: "1px solid rgba(79, 209, 199, 0.3)"
        }}>
              <IoCheckmark size="18px" style={{
            marginRight: "8px"
          }} />
              You're Ready - Waiting for opponent
            </VuiButton>}
        </VuiBox>

        {/* Waiting Time Info */}
        {waitingTimeSeconds > 0 && <VuiBox mt={2} p={1.5} sx={{
        background: "rgba(255, 215, 0, 0.1)",
        borderRadius: "8px"
      }}>
            <VuiTypography variant="caption" color={bodyColor} textAlign="center" display="block">
              If opponent doesn't arrive, match will start automatically in {waitingTimeSeconds} seconds
            </VuiTypography>
          </VuiBox>}
      </DialogContent>
    </Dialog>;
}