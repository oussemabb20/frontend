import React, { useState, useEffect } from "react";
import { Grid, Card, Dialog, DialogContent, DialogTitle, keyframes, Box } from "@mui/material";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiButton from "components/VuiButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { IoGameController, IoFlash, IoPeople, IoTime, IoTrophy, IoClose, IoPeopleCircle, IoCopy, IoCheckmark, IoSparkles } from "react-icons/io5";
import battleService from "services/battle.service";
import tournamentService from "services/tournament.service";
import { useNavigate } from "react-router-dom";
import { useVisionUIController } from "context";

// Define animations
const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const glow = keyframes`
  0%, 100% { filter: drop-shadow(0 0 8px rgba(0, 117, 255, 0.4)); }
  50% { filter: drop-shadow(0 0 16px rgba(0, 117, 255, 0.8)); }
`;

const TOURNAMENT_DRAFT_STORAGE_KEY = "admin_tournaments_draft";
const TOURNAMENT_REGISTRATION_STORAGE_KEY = "tournament_registrations";

function Battles() {
  const [controller] = useVisionUIController();
  const { darkMode } = controller;
  const [activeTab, setActiveTab] = useState("1v1");
  const [searchingOpponent, setSearchingOpponent] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [activeBattles, setActiveBattles] = useState([]);
  const [lastBattle, setLastBattle] = useState(null);
  const [matchFound, setMatchFound] = useState(false);
  const [currentBattle, setCurrentBattle] = useState(null);
  const [error, setError] = useState(null);
  const [teamLeague, setTeamLeague] = useState([]);
  const [showCreateFriendBattle, setShowCreateFriendBattle] = useState(false);
  const [showJoinFriendBattle, setShowJoinFriendBattle] = useState(false);
  const [friendBattleId, setFriendBattleId] = useState("");
  const [joinBattleId, setJoinBattleId] = useState("");
  const [copied, setCopied] = useState(false);
  const [showTeamBattleModal, setShowTeamBattleModal] = useState(false);
  const [teamSize, setTeamSize] = useState("2v2");
  const [teamBattleType, setTeamBattleType] = useState("random"); // "random" or "friend"
  const [queuePlayers, setQueuePlayers] = useState([]); // Players in the queue
  const [requiredPlayers, setRequiredPlayers] = useState(4); // Required players for team battle (2v2 = 4, 3v3 = 6, 4v4 = 8)
  const [upcomingTournaments, setUpcomingTournaments] = useState([]);
  const [tournamentFeedback, setTournamentFeedback] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize battle service
    const token = localStorage.getItem('accessToken');
    battleService.initializeSocket(token);

    // Set user info
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user._id && user.username) {
      battleService.setCurrentUser(user._id, user.username);
    }

    // Load active battles
    loadActiveBattles();
    loadBattleHistory();
    loadTeamLeague();

    const refreshInterval = globalThis.setInterval(() => {
      loadBattleHistory();
      loadTeamLeague();
    }, 5000);

    const onFocus = () => {
      loadBattleHistory();
      loadUpcomingTournaments();
    };
    globalThis.addEventListener('focus', onFocus);

    // Setup event listeners
    console.log('🎧 Setting up battle event listeners...');
    const unsubscribeMatchFound = battleService.onMatchFound(handleMatchFound);
    const unsubscribeCountdown = battleService.onCountdown(handleCountdown);
    const unsubscribeBattleStarted = battleService.onBattleStarted(handleBattleStarted);
    const unsubscribeQueueUpdate = battleService.onQueueUpdate(handleQueueUpdate);
    console.log('✅ Battle event listeners registered');

    loadUpcomingTournaments();

    return () => {
      console.log('🧹 Cleaning up battle event listeners...');
      globalThis.clearInterval(refreshInterval);
      globalThis.removeEventListener('focus', onFocus);
      unsubscribeMatchFound();
      unsubscribeCountdown();
      unsubscribeBattleStarted();
      unsubscribeQueueUpdate();
    };
  }, []);

  const loadActiveBattles = async () => {
    try {
      const response = await battleService.getActiveBattles();
      if (response.success) {
        setActiveBattles(response.battles || []);
      }
    } catch (error) {
      console.error('Error loading active battles:', error);
    }
  };

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

      if (response?.success === false) {
        console.error('Battle history API error:', response?.message || 'unknown error');
      }

      setLastBattle(historyRows[0] || null);
    } catch (error) {
      console.error('Error loading battle history:', error);
    }
  };

  const loadTeamLeague = async () => {
    try {
      const response = await battleService.getTeamLeague();
      const standings = Array.isArray(response?.standings)
        ? response.standings
        : Array.isArray(response)
          ? response
          : [];

      setTeamLeague(standings);
    } catch (leagueError) {
      console.error('Error loading team league:', leagueError);
      setTeamLeague([]);
    }
  };

  const handleFindOpponent = async (mode = "1v1", size = null) => {
    try {
      setError(null);
      setSearchingOpponent(true);
      setActiveTab(mode); // Set active tab to track battle mode
      setQueuePlayers([]); // Reset queue players
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const skillLevel = user.profile?.level || 1;

      await battleService.joinQueue(mode, skillLevel, size);
    } catch (error) {
      console.error('Error joining queue:', error);
      setError(error.message);
      setSearchingOpponent(false);
    }
  };

  const handleCancelSearch = async () => {
    try {
      await battleService.leaveQueue();
      setSearchingOpponent(false);
      setQueuePlayers([]); // Reset queue players
    } catch (error) {
      console.error('Error leaving queue:', error);
    }
  };

  const handleMatchFound = (data) => {
    console.log('🎯 Match found event received:', data);
    console.log('Battle data:', data.battle);
    setSearchingOpponent(false);
    setMatchFound(true);
    setCurrentBattle(data.battle);
    console.log('Current battle set to:', data.battle._id);
  };

  const handleCountdown = (data) => {
    console.log('⏱️ Countdown event received:', data.count);
    setMatchFound(false); // Close match found modal
    setCountdown(data.count);
  };

  const handleBattleStarted = (data) => {
    console.log('🚀 Battle started event received:', data);
    setCountdown(null);
    setMatchFound(false);
    
    // Navigate to battle room - use battleId from the event data
    const battleId = data.battle?._id || currentBattle?._id;
    if (battleId) {
      console.log('🎮 Navigating to battle room:', battleId);
      navigate(`/battle/${battleId}`);
    } else {
      console.error('❌ No battle ID to navigate to', { data, currentBattle });
    }
  };

  const handleQueueUpdate = (data) => {
    console.log('👥 Queue update received:', data);
    setQueuePlayers(data.playersInQueue || []);
    setRequiredPlayers(data.requiredPlayers || 4);
  };

  const getBattleTeamPlayers = (battle, teamSide) =>
    (battle?.players || []).filter((player) => player.team === teamSide);

  const handleJoinBattle = (battle) => {
    navigate(`/battle/${battle._id}`);
  };

  const handleCreateFriendBattle = async (mode = '1v1', size = null) => {
    try {
      setError(null);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const skillLevel = user.profile?.level || 1;
      
      // Create a private battle
      const response = await battleService.createPrivateBattle(skillLevel, mode, size);
      if (response.success && response.battleId) {
        setFriendBattleId(response.battleId);
        setShowCreateFriendBattle(true);
        setShowTeamBattleModal(false);
        
        // Join the battle room via WebSocket to ensure proper socket mapping
        await battleService.joinBattleRoom(response.battleId);
      }
    } catch (error) {
      console.error('Error creating friend battle:', error);
      setError(error.message || 'Failed to create battle');
    }
  };

  const handleJoinFriendBattle = async () => {
    try {
      setError(null);
      if (!joinBattleId.trim()) {
        setError('Please enter a battle ID');
        return;
      }
      
      // Join via WebSocket - this will trigger match_found event
      await battleService.joinPrivateBattle(joinBattleId);
      setShowJoinFriendBattle(false);
      setJoinBattleId("");
      
      // The match_found, countdown, and battle_started events will handle navigation
    } catch (error) {
      console.error('Error joining friend battle:', error);
      setError(error.message || 'Failed to join battle');
    }
  };

  const handleCopyBattleId = () => {
    navigator.clipboard.writeText(friendBattleId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTeamBattleStart = () => {
    if (teamBattleType === "random") {
      // Join matchmaking queue with team size
      handleFindOpponent("team", teamSize);
      setShowTeamBattleModal(false);
    } else {
      // Create private team battle
      handleCreateFriendBattle("team", teamSize);
    }
  };

  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch (parseError) {
      console.error('Error parsing user from storage:', parseError);
      return {};
    }
  };

  const getTournamentRegistrations = () => {
    try {
      const raw = localStorage.getItem(TOURNAMENT_REGISTRATION_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (parseError) {
      console.error('Error parsing tournament registrations:', parseError);
      return {};
    }
  };

  const formatTournamentStart = (startAt) => {
    if (!startAt) return 'TBA';
    const startTime = new Date(startAt).getTime();
    if (Number.isNaN(startTime)) return 'TBA';

    const diffMs = startTime - Date.now();
    if (diffMs <= 0) return 'Started';

    const totalMinutes = Math.floor(diffMs / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const loadUpcomingTournaments = async () => {
    try {
      console.log('🏆 Loading tournaments from API...');
      const tournaments = await tournamentService.getUpcomingTournaments();
      console.log('🏆 Fetched tournaments:', tournaments);
      
      const currentUser = getCurrentUser();
      const currentUserId = String(currentUser?._id || currentUser?.id || '');

      const normalized = (Array.isArray(tournaments) ? tournaments : [])
        .map((tournament) => {
          const tournamentId = String(tournament._id || '');
          const registrations = Array.isArray(tournament.registeredPlayers) ? tournament.registeredPlayers : [];
          const maxParticipants = Number(tournament.maxParticipants || 16);
          const participantsCount = registrations.length;
          const isFull = participantsCount >= maxParticipants;
          const hasStarted = tournament.startAt ? new Date(tournament.startAt).getTime() <= Date.now() : false;
          const isRegistered = registrations.some(
            (entry) => String(entry.userId || '') === currentUserId,
          );

          return {
            id: tournamentId,
            name: tournament.name || 'Tournament',
            startTime: formatTournamentStart(tournament.startAt),
            participants: participantsCount,
            maxParticipants,
            prize: `${Number(tournament.winnerXp || 1000)} XP`,
            isRegistered,
            canRegister: !isFull && !hasStarted && tournament.status === 'draft',
            hasStarted,
          };
        })
        .sort((a, b) => {
          const aTournament = (Array.isArray(tournaments) ? tournaments : []).find((item) => String(item._id) === String(a.id));
          const bTournament = (Array.isArray(tournaments) ? tournaments : []).find((item) => String(item._id) === String(b.id));
          const aTime = new Date(aTournament?.startAt || 0).getTime();
          const bTime = new Date(bTournament?.startAt || 0).getTime();
          return aTime - bTime;
        });

      console.log('🏆 Normalized tournaments:', normalized);
      setUpcomingTournaments(normalized);
    } catch (loadError) {
      console.error('Failed to load upcoming tournaments:', loadError);
      setUpcomingTournaments([]);
    }
  };

  const handleRegisterTournament = async (tournamentId) => {
    const currentUser = getCurrentUser();
    const userId = String(currentUser?._id || currentUser?.id || '');
    const username = String(currentUser?.username || '').trim();

    if (!userId || !username) {
      setTournamentFeedback('Please sign in before registering for a tournament.');
      return;
    }

    try {
      await tournamentService.registerForTournament(tournamentId, userId, username);
      setTournamentFeedback('You are registered for the tournament!');
      loadUpcomingTournaments();
    } catch (registerError) {
      console.error('Failed to register tournament:', registerError);
      setTournamentFeedback(registerError.message || 'Registration failed. Please try again.');
    }
  };

  const headingColor = darkMode ? "white" : "dark";
  const bodyColor = darkMode ? "text" : "dark";
  const surfaceBg = darkMode
    ? "linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.49) 76.65%)"
    : "linear-gradient(127.09deg, rgba(255, 255, 255, 0.98) 19.41%, rgba(241, 245, 249, 0.95) 76.65%)";
  const surfaceBorder = darkMode ? "1px solid rgba(255, 255, 255, 0.125)" : "1px solid rgba(148, 163, 184, 0.35)";
  const dialogBg = darkMode
    ? "linear-gradient(127.09deg, rgba(6, 11, 40, 0.98) 19.41%, rgba(10, 14, 35, 0.95) 76.65%)"
    : "linear-gradient(127.09deg, rgba(255, 255, 255, 0.99) 19.41%, rgba(241, 245, 249, 0.98) 76.65%)";

  const BattleModeCard = ({ icon, title, description, players, onStart, gradient = "linear-gradient(135deg, #0075FF, #00C6FF)" }) => (
    <Card
      sx={{
        background: surfaceBg,
        border: surfaceBorder,
        borderRadius: "24px",
        height: "100%",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: gradient,
          opacity: 0,
          transition: "opacity 0.3s ease",
        },
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0px 16px 40px rgba(0, 117, 255, 0.35)",
          border: "1px solid rgba(0, 117, 255, 0.6)",
          "&::before": {
            opacity: 1,
          },
          "& .battle-icon-wrapper": {
            transform: "scale(1.1)",
            boxShadow: `0 8px 24px ${gradient.includes("#0075FF") ? "rgba(0, 117, 255, 0.4)" : "rgba(67, 24, 255, 0.4)"}`,
          },
        },
        "&:focus-within": {
          outline: "2px solid #0075FF",
          outlineOffset: "2px",
        }
      }}
      role="article"
      aria-label={`${title} battle mode`}
    >
      <VuiBox p={3} textAlign="center">
        <VuiBox
          className="battle-icon-wrapper"
          sx={{
            width: "88px",
            height: "88px",
            margin: "0 auto 20px",
            borderRadius: "50%",
            background: gradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s ease",
            animation: `${float} 4s ease-in-out infinite`,
            animationPlayState: "paused",
            "&:hover": {
              animationPlayState: "running",
            },
          }}
          aria-hidden="true"
        >
          {icon}
        </VuiBox>
        <VuiTypography variant="h4" color={headingColor} fontWeight="bold" mb={1}>
          {title}
        </VuiTypography>
        <VuiTypography variant="button" color={bodyColor} mb={2} display="block" sx={{ minHeight: "40px" }}>
          {description}
        </VuiTypography>
        <VuiBox 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          gap={1} 
          mb={3}
          sx={{
            background: darkMode ? "rgba(0, 117, 255, 0.1)" : "rgba(0, 117, 255, 0.05)",
            borderRadius: "20px",
            padding: "6px 16px",
            display: "inline-flex",
          }}
        >
          <IoPeople size="16px" color="#0075FF" aria-hidden="true" />
          <VuiTypography variant="caption" color={headingColor} fontWeight="bold">
            {players}
          </VuiTypography>
        </VuiBox>
        <VuiButton
          color="info"
          fullWidth
          onClick={onStart}
          aria-label={`Start ${title} battle`}
          sx={{
            background: gradient,
            "&:hover": {
              background: gradient.includes("#0075FF") 
                ? "linear-gradient(135deg, #0060DD, #00A8DD)" 
                : gradient,
              transform: "translateY(-2px)",
              boxShadow: "0 6px 20px rgba(0, 117, 255, 0.4)",
            },
            "&:focus": {
              outline: "2px solid #FFFFFF",
              outlineOffset: "2px",
            },
            transition: "all 0.3s ease",
            padding: "12px",
            fontWeight: "bold",
            fontSize: "1rem",
          }}
        >
          Start Battle
        </VuiButton>
      </VuiBox>
    </Card>
  );

  const ActiveBattleCard = ({ battle }) => (
    <Card
      sx={{
        background: "linear-gradient(127.09deg, rgba(255, 69, 0, 0.2) 19.41%, rgba(255, 140, 0, 0.1) 76.65%)",
        border: "2px solid #FF4500",
        borderRadius: "15px",
        marginBottom: "16px",
      }}
    >
      <VuiBox p={3}>
        <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <VuiBox>
            <VuiTypography variant="h5" color={headingColor} fontWeight="bold">
              {battle.mode} Battle
            </VuiTypography>
            <VuiTypography variant="caption" color={bodyColor}>
              Status: {battle.status}
            </VuiTypography>
          </VuiBox>
          <VuiBox textAlign="right">
            <VuiBox display="flex" alignItems="center" gap={1} justifyContent="flex-end">
              <IoTime size="20px" color="#FF4500" />
              <VuiTypography variant="h6" color={headingColor} fontWeight="bold">
                {battle.status === 'active' ? 'In Progress' : 'Starting Soon'}
              </VuiTypography>
            </VuiBox>
          </VuiBox>
        </VuiBox>

        <VuiBox mt={2}>
          <VuiButton 
            color="info" 
            fullWidth
            onClick={() => handleJoinBattle(battle)}
          >
            {battle.status === 'active' ? 'Continue Battle' : 'Join Battle'}
          </VuiButton>
        </VuiBox>
      </VuiBox>
    </Card>
  );

  const formatHistoryDate = (value) => {
    if (!value) return 'Unknown time';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Unknown time';
    return date.toLocaleString();
  };

  const LastBattleCard = ({ battle }) => {
    const playerA = battle?.playerA?.username || 'Unknown';
    const playerB = battle?.playerB?.username || 'Unknown';
    const winner = battle?.winner?.username || 'No winner';
    const rewardXp = Number(battle?.winnerRewardXp || 0);
    const isTeamBattle = battle?.mode === 'team' || Boolean(battle?.teamSize);
    const teamPlayers = Array.isArray(battle?.players) ? battle.players : [];

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
              {battle?.mode || 'Battle'} Result
            </VuiTypography>
            <VuiTypography variant="caption" color={bodyColor}>
              {formatHistoryDate(battle?.endTime || battle?.startTime)}
            </VuiTypography>
          </VuiBox>

          <VuiTypography variant="button" color={bodyColor} display="block" mb={0.8}>
            {isTeamBattle
              ? `${battle?.teamSize || 'Team'} battle • Winning team ${battle?.winnerTeam || 'n/a'}`
              : `Players: ${playerA} vs ${playerB}`}
          </VuiTypography>
          <VuiTypography variant="button" color="warning" display="block" mb={0.8}>
            {isTeamBattle && battle?.winnerTeam ? `Winning Team: ${battle.winnerTeam}` : `Winner: ${winner}`}
          </VuiTypography>
          <VuiTypography variant="button" color="info" display="block">
            Rewarded XP: +{rewardXp}
          </VuiTypography>
          {isTeamBattle && teamPlayers.length > 0 && (
            <VuiBox mt={2}>
              {['A', 'B'].map((teamSide) => (
                <VuiTypography key={teamSide} variant="caption" color={bodyColor} display="block" mb={0.5}>
                  Team {teamSide}: {teamPlayers.filter((player) => player.team === teamSide).map((player) => player.username).join(', ') || 'No players'}
                </VuiTypography>
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
        {/* Header */}
        <VuiBox mb={3} component="header">
          <VuiTypography variant="h3" color={headingColor} fontWeight="bold" display="flex" alignItems="center" gap={2} component="h1">
            <IoGameController size="36px" color="#FF4500" aria-hidden="true" />
            Battle Arena
          </VuiTypography>
          <VuiTypography variant="body2" color={bodyColor}>
            Challenge other developers in real-time coding battles
          </VuiTypography>
        </VuiBox>

        {/* Error Display */}
        {error && (
          <VuiBox mb={3} role="alert" aria-live="polite">
            <Card sx={{ background: "rgba(255, 0, 0, 0.1)", border: "1px solid #FF0000" }}>
              <VuiBox p={2}>
                <VuiTypography variant="body2" color="error">
                  {error}
                </VuiTypography>
              </VuiBox>
            </Card>
          </VuiBox>
        )}

        {/* Active Battles */}
        {activeBattles.length > 0 && (
          <VuiBox mb={3}>
            <VuiTypography variant="h2" color={headingColor} fontWeight="bold" mb={2} sx={{ fontSize: "1.25rem" }}>
              Active Battles
            </VuiTypography>
            <Grid container spacing={3}>
              {activeBattles.map((battle) => (
                <Grid item xs={12} md={6} key={battle._id}>
                  <ActiveBattleCard battle={battle} />
                </Grid>
              ))}
            </Grid>
          </VuiBox>
        )}

        {/* Last Battle */}
        <VuiBox mb={3}>
          <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb={2} gap={2} flexWrap="wrap">
            <VuiTypography variant="h2" color={headingColor} fontWeight="bold" sx={{ fontSize: "1.25rem" }}>
              Last Battle
            </VuiTypography>
            <VuiButton color="info" onClick={() => navigate('/battles/history')}>
              View Full History
            </VuiButton>
          </VuiBox>

          {!lastBattle ? (
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
            <LastBattleCard battle={lastBattle} />
          )}
        </VuiBox>

        {/* Team League */}
        <VuiBox mb={3}>
          <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb={2} gap={2} flexWrap="wrap">
            <VuiTypography variant="h5" color={headingColor} fontWeight="bold">
              Team League
            </VuiTypography>
            <VuiTypography variant="caption" color={bodyColor}>
              Win/loss standings by team size bracket
            </VuiTypography>
          </VuiBox>

          <Card sx={{ background: surfaceBg, border: surfaceBorder, borderRadius: '15px' }}>
            <VuiBox p={2.5}>
              {teamLeague.length === 0 ? (
                <VuiTypography variant="button" color={bodyColor}>
                  No team league results yet.
                </VuiTypography>
              ) : (
                <Grid container spacing={2}>
                  {teamLeague.map((entry) => (
                    <Grid item xs={12} md={6} key={entry.teamKey}>
                      <VuiBox
                        sx={{
                          background: entry.teamSide === 'A'
                            ? 'linear-gradient(135deg, rgba(0, 117, 255, 0.12), rgba(0, 117, 255, 0.05))'
                            : 'linear-gradient(135deg, rgba(255, 69, 0, 0.12), rgba(255, 69, 0, 0.05))',
                          border: entry.teamSide === 'A'
                            ? '1px solid rgba(0, 117, 255, 0.24)'
                            : '1px solid rgba(255, 69, 0, 0.24)',
                          borderRadius: '12px',
                          p: 2,
                        }}
                      >
                        <VuiTypography variant="button" color={headingColor} fontWeight="bold" display="block" mb={0.5}>
                          {entry.teamLabel}
                        </VuiTypography>
                        <VuiTypography variant="caption" color={bodyColor} display="block" mb={0.5}>
                          {entry.matchesPlayed} matches • {entry.wins} wins • {entry.losses} losses
                        </VuiTypography>
                        <VuiTypography variant="button" color="info" fontWeight="bold">
                          {entry.points} pts
                        </VuiTypography>
                      </VuiBox>
                    </Grid>
                  ))}
                </Grid>
              )}
            </VuiBox>
          </Card>
        </VuiBox>

        {/* Battle Modes */}
        <VuiBox mb={3}>
          <VuiBox display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <VuiTypography variant="h5" color={headingColor} fontWeight="bold">
              Choose Battle Mode
            </VuiTypography>
            <Box
              sx={{
                background: darkMode ? "rgba(255, 69, 0, 0.15)" : "rgba(255, 69, 0, 0.1)",
                border: "1px solid rgba(255, 69, 0, 0.3)",
                borderRadius: "20px",
                padding: "4px 12px",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <IoFlash size="14px" color="#FF4500" />
              <VuiTypography variant="caption" color="warning" fontWeight="bold">
                Live
              </VuiTypography>
            </Box>
          </VuiBox>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <BattleModeCard
                icon={<IoGameController size="40px" color="white" />}
                title="1v1 Duel"
                description="Face off against a single opponent in a timed coding challenge"
                players="2 Players"
                onStart={() => handleFindOpponent("1v1")}
                gradient="linear-gradient(135deg, #0075FF, #00C6FF)"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <BattleModeCard
                icon={<IoPeopleCircle size="40px" color="white" />}
                title="Battle with Friend"
                description="Create a private battle and invite your friend with a battle ID"
                players="2 Players"
                onStart={() => setShowJoinFriendBattle(true)}
                gradient="linear-gradient(135deg, #10b981, #34d399)"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <BattleModeCard
                icon={<IoPeople size="40px" color="white" />}
                title="Team Battle"
                description="Team up with others to compete against another team"
                players="4-8 Players"
                onStart={() => setShowTeamBattleModal(true)}
                gradient="linear-gradient(135deg, #4318ff, #7c3aed)"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <BattleModeCard
                icon={<IoTrophy size="40px" color="white" />}
                title="Tournament"
                description="Compete in elimination rounds to become the champion"
                players="Up to 128 Players"
                onStart={() => handleFindOpponent("tournament")}
                gradient="linear-gradient(135deg, #FF4500, #ff8c00)"
              />
            </Grid>
          </Grid>
        </VuiBox>

        {/* Searching Opponent Modal */}
        <Dialog
          open={searchingOpponent}
          onClose={handleCancelSearch}
          maxWidth="sm"
          fullWidth
          aria-labelledby="searching-dialog-title"
          aria-describedby="searching-dialog-description"
          PaperProps={{
            sx: {
              background: dialogBg,
              border: "2px solid #0075FF",
            }
          }}
        >
          <DialogTitle id="searching-dialog-title">
            <VuiBox display="flex" justifyContent="space-between" alignItems="center">
              <VuiTypography variant="h4" color={headingColor} fontWeight="bold">
                {activeTab === "team" ? "Finding Team Battle..." : "Finding Opponent..."}
              </VuiTypography>
              <VuiButton
                color="secondary"
                onClick={handleCancelSearch}
                aria-label="Cancel search"
                sx={{ minWidth: "auto", padding: "8px" }}
              >
                <IoClose size="20px" />
              </VuiButton>
            </VuiBox>
          </DialogTitle>
          <DialogContent>
            <VuiBox textAlign="center" py={2} id="searching-dialog-description">
              <IoFlash size="60px" color="#0075FF" style={{ animation: "pulse 1s infinite" }} aria-hidden="true" />
              <VuiTypography variant="button" color="text" mt={2} display="block">
                {activeTab === "team" 
                  ? "Matching you with team players..." 
                  : "Matching you with a worthy adversary..."}
              </VuiTypography>

              {/* Display queue players for team battles */}
              {activeTab === "team" && queuePlayers.length > 0 && (
                <VuiBox mt={3}>
                  <VuiTypography variant="button" color={headingColor} mb={2} display="block">
                    Players in Queue ({queuePlayers.length}/{requiredPlayers})
                  </VuiTypography>
                  <VuiBox 
                    sx={{ 
                      maxHeight: "200px", 
                      overflowY: "auto",
                      display: "flex",
                      flexDirection: "column",
                      gap: 1
                    }}
                  >
                    {queuePlayers.map((player, index) => (
                      <VuiBox
                        key={player.userId}
                        sx={{
                          background: "rgba(0, 117, 255, 0.1)",
                          border: "1px solid rgba(0, 117, 255, 0.3)",
                          borderRadius: "10px",
                          padding: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          animation: "slideIn 0.3s ease-out",
                          animationDelay: `${index * 0.1}s`,
                          animationFillMode: "backwards",
                          "@keyframes slideIn": {
                            from: {
                              opacity: 0,
                              transform: "translateX(-20px)"
                            },
                            to: {
                              opacity: 1,
                              transform: "translateX(0)"
                            }
                          }
                        }}
                      >
                        <VuiBox
                          sx={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #0075FF, #00C6FF)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0
                          }}
                        >
                          <IoPeople size="20px" color="white" />
                        </VuiBox>
                        <VuiTypography variant="button" color={headingColor} fontWeight="bold">
                          {player.username}
                        </VuiTypography>
                      </VuiBox>
                    ))}
                  </VuiBox>
                </VuiBox>
              )}
            </VuiBox>
          </DialogContent>
        </Dialog>

        {/* Match Found Modal */}
        <Dialog
          open={matchFound}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: dialogBg,
              border: "2px solid #00FF00",
            }
          }}
        >
          <DialogContent>
            <VuiBox textAlign="center" py={2}>
              <VuiTypography variant="h4" color="success" fontWeight="bold" mb={2}>
                Match Found!
              </VuiTypography>
              {currentBattle && (
                currentBattle.mode === "team" ? (
                  <VuiBox
                    sx={{
                      background: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "12px",
                      p: 2,
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
                      flexDirection: { xs: "column", md: "row" },
                    }}
                  >
                    <VuiBox sx={{ flex: 1, textAlign: { xs: "center", md: "left" } }}>
                      <VuiTypography variant="button" color="warning" fontWeight="bold" display="block" mb={0.5}>
                        Team B
                      </VuiTypography>
                      <VuiTypography variant="caption" color={bodyColor}>
                        {getBattleTeamPlayers(currentBattle, "B").map((player) => player.username).join(", ") || "No players"}
                      </VuiTypography>
                    </VuiBox>

                    <VuiTypography variant="h6" color={headingColor} fontWeight="bold">
                      Team B vs Team A
                    </VuiTypography>

                    <VuiBox sx={{ flex: 1, textAlign: { xs: "center", md: "right" } }}>
                      <VuiTypography variant="button" color="info" fontWeight="bold" display="block" mb={0.5}>
                        Team A
                      </VuiTypography>
                      <VuiTypography variant="caption" color={bodyColor}>
                        {getBattleTeamPlayers(currentBattle, "A").map((player) => player.username).join(", ") || "No players"}
                      </VuiTypography>
                    </VuiBox>
                  </VuiBox>
                ) : (
                  <VuiTypography variant="h6" color={headingColor} mb={2}>
                    vs {currentBattle.opponent}
                  </VuiTypography>
                )
              )}
              <VuiTypography variant="button" color="text">
                Preparing battle room...
              </VuiTypography>
            </VuiBox>
          </DialogContent>
        </Dialog>

        {/* Countdown Modal */}
        <Dialog
          open={countdown !== null}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: dialogBg,
              border: "2px solid #00FF00",
            }
          }}
        >
          <DialogContent>
            <VuiBox textAlign="center" py={4}>
              <VuiTypography variant="h1" color="success" fontWeight="bold" mb={2}>
                {countdown}
              </VuiTypography>
              <VuiTypography variant="h5" color={headingColor} fontWeight="bold">
                Battle Starting...
              </VuiTypography>
            </VuiBox>
          </DialogContent>
        </Dialog>

        {/* Join/Create Friend Battle Modal */}
        <Dialog
          open={showJoinFriendBattle}
          onClose={() => {
            setShowJoinFriendBattle(false);
            setJoinBattleId("");
            setError(null);
          }}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: dialogBg,
              border: "2px solid #0075FF",
              borderRadius: "20px",
            }
          }}
        >
          <DialogTitle>
            <VuiBox display="flex" justifyContent="space-between" alignItems="center">
              <VuiTypography variant="h4" color={headingColor} fontWeight="bold">
                Battle with Friend
              </VuiTypography>
              <VuiButton
                color="secondary"
                onClick={() => {
                  setShowJoinFriendBattle(false);
                  setJoinBattleId("");
                  setError(null);
                }}
                sx={{ minWidth: "auto", padding: "8px" }}
              >
                <IoClose size="20px" />
              </VuiButton>
            </VuiBox>
          </DialogTitle>
          <DialogContent>
            <VuiBox py={2}>
              {/* Create Battle Button */}
              <VuiBox mb={3}>
                <VuiTypography variant="button" color={headingColor} mb={2} display="block">
                  Create a new battle:
                </VuiTypography>
                <VuiButton
                  color="info"
                  fullWidth
                  onClick={() => handleCreateFriendBattle()}
                  aria-label="Create a new private battle and get battle ID"
                  sx={{
                    background: "linear-gradient(135deg, #0075FF, #00C6FF)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #0060DD, #00A8DD)",
                    },
                    "&:focus": {
                      outline: "2px solid #FFFFFF",
                      outlineOffset: "2px",
                    }
                  }}
                >
                  Create Battle & Get ID
                </VuiButton>
              </VuiBox>

              {/* Divider */}
              <VuiBox display="flex" alignItems="center" my={3}>
                <VuiBox flex={1} height="1px" sx={{ background: "rgba(255, 255, 255, 0.2)" }} />
                <VuiTypography variant="caption" color="text" mx={2}>
                  OR
                </VuiTypography>
                <VuiBox flex={1} height="1px" sx={{ background: "rgba(255, 255, 255, 0.2)" }} />
              </VuiBox>

              {/* Join Battle Input */}
              <VuiBox>
                <VuiTypography variant="button" color={headingColor} mb={2} display="block">
                  Join an existing battle:
                </VuiTypography>
                <VuiBox
                  component="input"
                  type="text"
                  placeholder="Enter Battle ID"
                  value={joinBattleId}
                  onChange={(e) => setJoinBattleId(e.target.value)}
                  aria-label="Battle ID input"
                  aria-required="true"
                  aria-invalid={error ? "true" : "false"}
                  sx={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    background: "rgba(255, 255, 255, 0.05)",
                    color: "white",
                    fontSize: "14px",
                    marginBottom: "16px",
                    "&:focus": {
                      outline: "2px solid #0075FF",
                      outlineOffset: "2px",
                      border: "1px solid #0075FF",
                    }
                  }}
                />
                <VuiButton
                  color="success"
                  fullWidth
                  onClick={handleJoinFriendBattle}
                  disabled={!joinBattleId.trim()}
                  aria-label="Join battle with entered ID"
                  aria-disabled={!joinBattleId.trim()}
                  sx={{
                    "&:focus": {
                      outline: "2px solid #FFFFFF",
                      outlineOffset: "2px",
                    }
                  }}
                >
                  Join Battle
                </VuiButton>
              </VuiBox>

              {error && (
                <VuiBox mt={2} p={2} sx={{ background: "rgba(255, 0, 0, 0.1)", borderRadius: "10px" }}>
                  <VuiTypography variant="caption" color="error">
                    {error}
                  </VuiTypography>
                </VuiBox>
              )}
            </VuiBox>
          </DialogContent>
        </Dialog>

        {/* Battle Created Modal */}
        <Dialog
          open={showCreateFriendBattle}
          onClose={() => {
            setShowCreateFriendBattle(false);
            setFriendBattleId("");
            setCopied(false);
          }}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: dialogBg,
              border: "2px solid #00FF00",
              borderRadius: "20px",
            }
          }}
        >
          <DialogTitle>
            <VuiBox display="flex" justifyContent="space-between" alignItems="center">
              <VuiTypography variant="h4" color="success" fontWeight="bold">
                Battle Created!
              </VuiTypography>
              <VuiButton
                color="secondary"
                onClick={() => {
                  setShowCreateFriendBattle(false);
                  setFriendBattleId("");
                  setCopied(false);
                }}
                sx={{ minWidth: "auto", padding: "8px" }}
              >
                <IoClose size="20px" />
              </VuiButton>
            </VuiBox>
          </DialogTitle>
          <DialogContent>
            <VuiBox py={2} textAlign="center">
              <IoPeopleCircle size="64px" color="#00FF00" style={{ marginBottom: "16px" }} />
              <VuiTypography variant="body2" color="text" mb={3}>
                Share this Battle ID with your friend:
              </VuiTypography>
              
              {/* Battle ID Display */}
              <VuiBox
                p={2}
                mb={3}
                sx={{
                  background: "rgba(0, 117, 255, 0.1)",
                  border: "2px solid #0075FF",
                  borderRadius: "10px",
                }}
              >
                <VuiTypography variant="h5" color="info" fontWeight="bold" sx={{ fontFamily: "monospace" }}>
                  {friendBattleId}
                </VuiTypography>
              </VuiBox>

              {/* Copy Button */}
              <VuiButton
                color={copied ? "success" : "info"}
                fullWidth
                onClick={handleCopyBattleId}
                sx={{ mb: 2 }}
              >
                {copied ? (
                  <>
                    <IoCheckmark size="20px" style={{ marginRight: "8px" }} />
                    Copied!
                  </>
                ) : (
                  <>
                    <IoCopy size="20px" style={{ marginRight: "8px" }} />
                    Copy Battle ID
                  </>
                )}
              </VuiButton>

              {/* Enter Battle Button */}
              <VuiButton
                color="success"
                fullWidth
                onClick={() => {
                  setShowCreateFriendBattle(false);
                  navigate(`/battle/${friendBattleId}`);
                }}
              >
                Enter Battle Room
              </VuiButton>

              <VuiTypography variant="caption" color="text" mt={2} display="block">
                You'll automatically enter when your friend joins...
              </VuiTypography>
            </VuiBox>
          </DialogContent>
        </Dialog>

        {/* Team Battle Configuration Modal */}
        <Dialog
          open={showTeamBattleModal}
          onClose={() => {
            setShowTeamBattleModal(false);
            setError(null);
          }}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: dialogBg,
              border: "2px solid #0075FF",
              borderRadius: "20px",
            }
          }}
        >
          <DialogTitle>
            <VuiBox display="flex" justifyContent="space-between" alignItems="center">
              <VuiTypography variant="h4" color={headingColor} fontWeight="bold">
                Team Battle Setup
              </VuiTypography>
              <VuiButton
                color="secondary"
                onClick={() => {
                  setShowTeamBattleModal(false);
                  setError(null);
                }}
                sx={{ minWidth: "auto", padding: "8px" }}
              >
                <IoClose size="20px" />
              </VuiButton>
            </VuiBox>
          </DialogTitle>
          <DialogContent>
            <VuiBox py={2}>
              {/* Team Size Selection */}
              <VuiBox mb={3}>
                <VuiTypography variant="button" color={headingColor} mb={2} display="block">
                  Select Team Size:
                </VuiTypography>
                <Grid container spacing={2}>
                  {["2v2", "3v3", "4v4"].map((size) => (
                    <Grid item xs={4} key={size}>
                      <VuiButton
                        color={teamSize === size ? "info" : "secondary"}
                        fullWidth
                        onClick={() => setTeamSize(size)}
                        sx={{
                          background: teamSize === size 
                            ? "linear-gradient(135deg, #0075FF, #00C6FF)" 
                            : "rgba(255, 255, 255, 0.1)",
                          border: teamSize === size ? "2px solid #0075FF" : "1px solid rgba(255, 255, 255, 0.2)",
                          "&:hover": {
                            background: teamSize === size 
                              ? "linear-gradient(135deg, #0060DD, #00A8DD)" 
                              : "rgba(255, 255, 255, 0.15)",
                          },
                        }}
                      >
                        {size}
                      </VuiButton>
                    </Grid>
                  ))}
                </Grid>
                <VuiTypography variant="caption" color="text" mt={1} display="block">
                  {teamSize === "2v2" && "2 players per team (4 total)"}
                  {teamSize === "3v3" && "3 players per team (6 total)"}
                  {teamSize === "4v4" && "4 players per team (8 total)"}
                </VuiTypography>
              </VuiBox>

              {/* Battle Type Selection */}
              <VuiBox mb={3}>
                <VuiTypography variant="button" color="white" mb={2} display="block">
                  Battle Type:
                </VuiTypography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <VuiButton
                      color={teamBattleType === "random" ? "success" : "secondary"}
                      fullWidth
                      onClick={() => setTeamBattleType("random")}
                      sx={{
                        background: teamBattleType === "random" 
                          ? "linear-gradient(135deg, #00C853, #00E676)" 
                          : "rgba(255, 255, 255, 0.1)",
                        border: teamBattleType === "random" ? "2px solid #00C853" : "1px solid rgba(255, 255, 255, 0.2)",
                        "&:hover": {
                          background: teamBattleType === "random" 
                            ? "linear-gradient(135deg, #00A843, #00C866)" 
                            : "rgba(255, 255, 255, 0.15)",
                        },
                      }}
                    >
                      <IoFlash size="20px" style={{ marginRight: "8px" }} />
                      Random
                    </VuiButton>
                  </Grid>
                  <Grid item xs={6}>
                    <VuiButton
                      color={teamBattleType === "friend" ? "warning" : "secondary"}
                      fullWidth
                      onClick={() => setTeamBattleType("friend")}
                      sx={{
                        background: teamBattleType === "friend" 
                          ? "linear-gradient(135deg, #FF9800, #FFB74D)" 
                          : "rgba(255, 255, 255, 0.1)",
                        border: teamBattleType === "friend" ? "2px solid #FF9800" : "1px solid rgba(255, 255, 255, 0.2)",
                        "&:hover": {
                          background: teamBattleType === "friend" 
                            ? "linear-gradient(135deg, #E68900, #FFA73D)" 
                            : "rgba(255, 255, 255, 0.15)",
                        },
                      }}
                    >
                      <IoPeopleCircle size="20px" style={{ marginRight: "8px" }} />
                      Friends
                    </VuiButton>
                  </Grid>
                </Grid>
                <VuiTypography variant="caption" color="text" mt={1} display="block">
                  {teamBattleType === "random" 
                    ? "Match with random players in matchmaking queue" 
                    : "Create a private battle and share the ID with friends"}
                </VuiTypography>
              </VuiBox>

              {/* Start Button */}
              <VuiButton
                color="info"
                fullWidth
                onClick={handleTeamBattleStart}
                sx={{
                  background: "linear-gradient(135deg, #0075FF, #00C6FF)",
                  padding: "12px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  "&:hover": {
                    background: "linear-gradient(135deg, #0060DD, #00A8DD)",
                  },
                }}
              >
                {teamBattleType === "random" ? "Find Team Battle" : "Create Team Battle"}
              </VuiButton>

              {error && (
                <VuiBox mt={2} p={2} sx={{ background: "rgba(255, 0, 0, 0.1)", borderRadius: "10px" }}>
                  <VuiTypography variant="caption" color="error">
                    {error}
                  </VuiTypography>
                </VuiBox>
              )}
            </VuiBox>
          </DialogContent>
        </Dialog>

        {/* Upcoming Tournaments */}
        {upcomingTournaments.length > 0 && (
          <VuiBox>
            <VuiTypography variant="h5" color={headingColor} fontWeight="bold" mb={2}>
              Upcoming Tournaments
            </VuiTypography>
            {tournamentFeedback && (
              <VuiBox mb={2}>
                <VuiTypography variant="caption" color="info" fontWeight="bold">
                  {tournamentFeedback}
                </VuiTypography>
              </VuiBox>
            )}
            <Grid container spacing={3}>
              {upcomingTournaments.map((battle) => (
                <Grid item xs={12} md={6} key={battle.id}>
                  <Card
                    sx={{
                      background: "linear-gradient(127.09deg, rgba(255, 215, 0, 0.2) 19.41%, rgba(255, 165, 0, 0.1) 76.65%)",
                      border: "2px solid #FFD700",
                      borderRadius: "15px",
                    }}
                  >
                    <VuiBox p={3}>
                      <VuiBox display="flex" alignItems="center" gap={2} mb={2}>
                        <IoTrophy size="32px" color="#FFD700" />
                        <VuiBox>
                          <VuiTypography variant="h5" color={headingColor} fontWeight="bold">
                            {battle.name}
                          </VuiTypography>
                          <VuiTypography variant="caption" color={bodyColor}>
                            Starts in {battle.startTime}
                          </VuiTypography>
                        </VuiBox>
                      </VuiBox>
                      <VuiBox display="flex" justifyContent="space-between" mb={2}>
                        <VuiBox>
                          <VuiTypography variant="caption" color={bodyColor}>
                            Participants
                          </VuiTypography>
                          <VuiTypography variant="h6" color={headingColor} fontWeight="bold">
                            {battle.participants}/{battle.maxParticipants}
                          </VuiTypography>
                        </VuiBox>
                        <VuiBox textAlign="right">
                          <VuiTypography variant="caption" color={bodyColor}>
                            Prize Pool
                          </VuiTypography>
                          <VuiTypography variant="h6" color="warning" fontWeight="bold">
                            {battle.prize}
                          </VuiTypography>
                        </VuiBox>
                      </VuiBox>
                      <VuiButton
                        color={battle.isRegistered ? "success" : "warning"}
                        fullWidth
                        disabled={!battle.canRegister || battle.isRegistered}
                        onClick={() => handleRegisterTournament(battle.id)}
                      >
                        {battle.isRegistered
                          ? "Registered"
                          : battle.hasStarted
                            ? "Registration Closed"
                            : battle.participants >= battle.maxParticipants
                              ? "Tournament Full"
                              : "Register Now"}
                      </VuiButton>
                    </VuiBox>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </VuiBox>
        )}
      </VuiBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Battles;