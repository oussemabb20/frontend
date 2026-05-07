import React from "react";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiButton from "components/VuiButton";
import { useVisionUIController } from "context";
import { Card } from "@mui/material";
import { IoCheckmarkCircle, IoCodeSlash, IoFlame, IoTrophy, IoTicket } from "react-icons/io5";

const ChallengeCard = ({ 
  title, 
  difficulty, 
  points, 
  category, 
  solvedCount,
  totalAttempts,
  activeTickets,
  description,
  tags = [],
  isSolved = false,
  onStart
}) => {
  const [controller] = useVisionUIController();
  const { darkMode } = controller;

  const cardBackground = darkMode
    ? "linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.49) 76.65%)"
    : "linear-gradient(127.09deg, rgba(255, 255, 255, 0.98) 19.41%, rgba(241, 245, 249, 0.95) 76.65%)";
  const cardBorder = darkMode ? "1px solid rgba(255, 255, 255, 0.125)" : "1px solid rgba(148, 163, 184, 0.35)";
  const titleColor = darkMode ? "white" : "dark";
  const bodyColor = darkMode ? "text" : "dark";

  const getDifficultyGradient = (diff) => {
    const normalized = (diff || "").toLowerCase();
    if (normalized === "easy") return "linear-gradient(135deg, #0a0, #060)";
    if (normalized === "medium") return "linear-gradient(135deg, #fa0, #f60)";
    return "linear-gradient(135deg, #f00, #a00)";
  };

  const getDifficultyTextColor = (diff) => {
    return "white";
  };

  return (
    <Card
      sx={{
        background: cardBackground,
        backdropFilter: "saturate(200%) blur(50px)",
        boxShadow: "0px 2px 5.5px rgba(0, 0, 0, 0.02)",
        border: cardBorder,
        borderRadius: "20px",
        height: "100%",
        transition: "transform 0.3s, box-shadow 0.3s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0px 5px 15px rgba(0, 117, 255, 0.3)",
        }
      }}
    >
      <VuiBox p={3}>
        {/* Header */}
        <VuiBox display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <VuiBox>
            <VuiTypography variant="h5" color={titleColor} fontWeight="bold" mb={1}>
              {title}
            </VuiTypography>
            <VuiBox display="flex" alignItems="center" gap={1.2} flexWrap="wrap">
              <VuiTypography variant="caption" color={bodyColor}>
                {category}
              </VuiTypography>
              {isSolved && (
                <VuiBox
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    px: "9px",
                    py: "3px",
                    borderRadius: "999px",
                    background: "linear-gradient(135deg, rgba(0, 255, 153, 0.25), rgba(0, 184, 110, 0.2))",
                    border: "1px solid rgba(0, 255, 153, 0.35)",
                  }}
                >
                  <IoCheckmarkCircle size="13px" color="#00ff99" />
                  <VuiTypography variant="caption" sx={{ color: "#00ff99", fontWeight: 700 }}>
                    Solved
                  </VuiTypography>
                </VuiBox>
              )}
            </VuiBox>
          </VuiBox>
          <VuiBox
            sx={{
              background: getDifficultyGradient(difficulty),
              padding: "4px 12px",
              borderRadius: "8px",
            }}
          >
            <VuiTypography
              variant="caption"
              fontWeight="bold"
              sx={{
                color: `${getDifficultyTextColor(difficulty)} !important`,
                fontWeight: 700,
              }}
            >
              {difficulty}
            </VuiTypography>
          </VuiBox>
        </VuiBox>

        {/* Description */}
        <VuiBox mb={2}>
          <VuiTypography variant="button" color={bodyColor} fontWeight="regular">
            {description}
          </VuiTypography>
        </VuiBox>

        {/* Tags */}
        {tags.length > 0 && (
          <VuiBox display="flex" gap={1} flexWrap="wrap" mb={2}>
            {tags.map((tag) => (
              <VuiBox
                key={`${title}-${tag}`}
                sx={{
                  background: "rgba(0, 117, 255, 0.15)",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  border: "1px solid rgba(0, 117, 255, 0.3)",
                }}
              >
                <VuiTypography variant="caption" color="info" fontWeight="medium">
                  {tag}
                </VuiTypography>
              </VuiBox>
            ))}
          </VuiBox>
        )}

        {/* Stats */}
        <VuiBox display="flex" gap={3} mb={3}>
          <VuiBox display="flex" alignItems="center" gap={1}>
            <IoTrophy size="18px" color="#FFD700" />
            <VuiTypography variant="button" color={titleColor} fontWeight="medium">
              {points} XP
            </VuiTypography>
          </VuiBox>
          <VuiBox display="flex" alignItems="center" gap={1}>
            <IoFlame size="18px" color="#FF4500" />
            <VuiTypography variant="button" color={bodyColor}>
              {solvedCount}/{totalAttempts} solved
            </VuiTypography>
          </VuiBox>
          {typeof activeTickets === "number" && (
            <VuiBox display="flex" alignItems="center" gap={1}>
              <IoTicket size="18px" color="#00C6FF" />
              <VuiTypography variant="button" color={bodyColor}>
                {activeTickets} active tickets
              </VuiTypography>
            </VuiBox>
          )}
        </VuiBox>

        {/* Action Button */}
        <VuiButton 
          color="info" 
          fullWidth 
          onClick={onStart}
          sx={{ 
            background: "linear-gradient(135deg, #0075FF, #00C6FF)",
            "&:hover": {
              background: "linear-gradient(135deg, #0060DD, #00A8DD)",
            }
          }}
        >
          <IoCodeSlash size="18px" style={{ marginRight: "8px" }} />
          {isSolved ? "Review Challenge" : "Start Challenge"}
        </VuiButton>
      </VuiBox>
    </Card>
  );
};

export default ChallengeCard;
