// src/layouts/clans/index.jsx
import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  Modal,
  TextField,
  styled,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
} from "@mui/material";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiButton from "components/VuiButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { useVisionUIController } from "context";
import { IoPersonAdd, IoClose, IoPeople, IoExit, IoTrash, IoSearch, IoGameController, IoCopy, IoCheckmark } from "react-icons/io5";
import { clanService } from "../../services/clan.service";
import { authService } from "../../services/auth.service";
import apiClient from "../../services/api";
import { useNavigate } from "react-router-dom";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 450,
  bgcolor: "#071126",
  backgroundImage: "radial-gradient(circle at 15% -20%, rgba(78, 201, 240, 0.35), transparent 45%), radial-gradient(circle at 100% 10%, rgba(255, 149, 0, 0.26), transparent 40%), linear-gradient(150deg, rgba(7, 17, 38, 0.98) 0%, rgba(10, 20, 46, 0.97) 100%)",
  border: "1px solid rgba(78, 201, 240, 0.35)",
  borderRadius: "20px",
  boxShadow: "0 22px 70px rgba(0, 0, 0, 0.75)",
  p: 4,
};

const inputStyle = {
  "& .MuiInputBase-root": { borderRadius: "12px", color: "white" },
  "& .MuiOutlinedInput-root": { background: "rgba(8, 20, 48, 0.72) !important", color: "#e9f2ff !important" },
  "& .MuiInputBase-input": { color: "#e9f2ff !important", fontSize: "0.95rem" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(126, 163, 216, 0.35)" },
  "& .MuiInputLabel-root": { color: "rgba(173, 197, 234, 0.82)" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#4ec9f0" },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(78, 201, 240, 0.62)" },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#4ec9f0" },
  marginBottom: 2,
};

const UserSlotCard = styled(Card)(({ theme, isOccupied }) => {
  const darkMode = theme.palette.mode === "dark";
  return {
    background: isOccupied
      ? "linear-gradient(135deg, rgba(0, 117, 255, 0.2), rgba(67, 24, 255, 0.15))"
      : darkMode
      ? "linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.49) 76.65%)"
      : "linear-gradient(127.09deg, rgba(255, 255, 255, 0.98) 19.41%, rgba(241, 245, 249, 0.95) 76.65%)",
    backdropFilter: "blur(42px)",
    border: isOccupied
      ? "1px solid rgba(0, 117, 255, 0.4)"
      : darkMode
      ? "1px solid rgba(255, 255, 255, 0.05)"
      : "1px solid rgba(148, 163, 184, 0.25)",
    borderRadius: "20px",
    padding: "20px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
    height: "180px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    "&:hover": {
      transform: "translateY(-5px)",
      borderColor: "rgba(78, 201, 240, 0.6)",
      boxShadow: "0px 10px 30px rgba(0, 117, 255, 0.3)",
    },
  };
});

function Clans() {
  const [controller] = useVisionUIController();
  const { darkMode } = controller;
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const userId = currentUser?.id || currentUser?._id;
  const currentUserName = currentUser?.username || currentUser?.email?.split('@')[0] || "User";

  const [clan, setClan] = useState(null);
  const [membersDetails, setMembersDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [error, setError] = useState(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [openFindTeamModal, setOpenFindTeamModal] = useState(false);
  const [openBattleModal, setOpenBattleModal] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
  const [inviteUsername, setInviteUsername] = useState("");
  const [clanName, setClanName] = useState("");
  const [findClanId, setFindClanId] = useState("");
  const [foundClan, setFoundClan] = useState(null);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [battleId, setBattleId] = useState("");
  const [joiningBattle, setJoiningBattle] = useState(false);
  const [availableBattles, setAvailableBattles] = useState([]);
  const [loadingBattles, setLoadingBattles] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [copied, setCopied] = useState(false);

  const pageTitleColor = darkMode ? "white" : "dark";
  const pageTextColor = darkMode ? "text" : "dark";

  // ── Fetch user details by ID ──────────────────────────────────────────────
  const fetchUserDetails = async (id) => {
    try {
      const response = await apiClient.get(`/users/${id}`);
      const user = response.data;
      return user?.username || user?.email?.split('@')[0] || `Player ${id.slice(-6)}`;
    } catch (err) {
      return `Player ${id.slice(-6)}`;
    }
  };

  // ── Copy Clan ID ──────────────────────────────────────────────────────────
  const handleCopyClanId = async () => {
    if (!clan?._id) return;
    try {
      await navigator.clipboard.writeText(clan._id);
      setCopied(true);
      setSnackbar({ open: true, message: "Clan ID copied to clipboard!", severity: "success" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setSnackbar({ open: true, message: "Failed to copy Clan ID", severity: "error" });
    }
  };

  // ── Fetch available battles ───────────────────────────────────────────────
  const fetchAvailableBattles = async (currentClan) => {
    if (!currentClan) return;
    setLoadingBattles(true);
    try {
      const response = await apiClient.get('/battles/available', { params: { clanId: currentClan._id } });
      setAvailableBattles(response.data || []);
    } catch {
      setAvailableBattles([]);
    } finally {
      setLoadingBattles(false);
    }
  };

  // ── Fetch all members names ───────────────────────────────────────────────
  const fetchAllMembersDetails = async (userIds) => {
    if (!userIds || userIds.length === 0) return {};
    setLoadingMembers(true);
    const results = await Promise.all(userIds.map(async (id) => ({ id, name: await fetchUserDetails(id) })));
    const details = {};
    results.forEach(({ id, name }) => { details[id] = name; });
    setMembersDetails(details);
    setLoadingMembers(false);
    return details;
  };

  // ── Load user's clan on mount ─────────────────────────────────────────────
  const loadUserClan = async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const userClan = await clanService.getClanByUser(userId);
      if (userClan) {
        const fullClan = await clanService.getClanById(userClan._id);
        setClan(fullClan);
        if (fullClan.users?.length > 0) await fetchAllMembersDetails(fullClan.users);
        await fetchAvailableBattles(fullClan);
      } else {
        setClan(null);
      }
    } catch (err) {
      console.error("Error loading clan:", err);
      setError("Failed to load clan information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUserClan(); }, [userId]);

  // ── Create clan ───────────────────────────────────────────────────────────
  const handleCreateClan = async () => {
    if (!clanName.trim()) { setSubmitError("Please enter a clan name"); return; }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const newClan = await clanService.createClan({ name: clanName.trim(), userId });
      setClan(newClan);
      setMembersDetails({ [userId]: currentUserName });
      setOpenCreateModal(false);
      setClanName("");
      setSnackbar({ open: true, message: `Clan "${newClan.name}" created successfully!`, severity: "success" });
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Failed to create clan");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Find clan by ID ───────────────────────────────────────────────────────
  const handleFindClan = async () => {
    if (!findClanId.trim()) { setSubmitError("Please enter a clan ID"); return; }
    setSearching(true);
    setSubmitError(null);
    setFoundClan(null);
    try {
      const clanData = await clanService.getClanById(findClanId.trim());
      const memberNames = {};
      for (const id of (clanData.users || [])) {
        memberNames[id] = await fetchUserDetails(id);
      }
      setFoundClan({ ...clanData, memberNames });
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Clan not found. Please check the ID and try again.");
    } finally {
      setSearching(false);
    }
  };

  // ── Join clan ─────────────────────────────────────────────────────────────
  const handleJoinClan = async () => {
    if (!foundClan || !userId) return;
    setSubmitting(true);
    try {
      const updatedClan = await clanService.joinClan(foundClan._id, userId);
      setClan(updatedClan);
      if (updatedClan.users?.length > 0) await fetchAllMembersDetails(updatedClan.users);
      await fetchAvailableBattles(updatedClan);
      setOpenFindTeamModal(false);
      setFindClanId("");
      setFoundClan(null);
      setSnackbar({ open: true, message: `Successfully joined "${updatedClan.name}"!`, severity: "success" });
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || "Failed to join clan", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Leave clan ────────────────────────────────────────────────────────────
  const handleLeaveClan = async () => {
    if (!clan || !userId) return;
    if (!window.confirm("Are you sure you want to leave this clan?")) return;
    setSubmitting(true);
    try {
      await clanService.leaveClan(clan._id, userId);
      setClan(null);
      setMembersDetails({});
      setAvailableBattles([]);
      setSnackbar({ open: true, message: "You have left the clan", severity: "info" });
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || "Failed to leave clan", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete clan ───────────────────────────────────────────────────────────
  const handleDeleteClan = async () => {
    if (!clan) return;
    if (!window.confirm(`Are you sure you want to delete "${clan.name}"? This action cannot be undone.`)) return;
    setSubmitting(true);
    try {
      await clanService.deleteClan(clan._id);
      setClan(null);
      setMembersDetails({});
      setAvailableBattles([]);
      setSnackbar({ open: true, message: "Clan deleted successfully", severity: "success" });
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || "Failed to delete clan", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Join battle ───────────────────────────────────────────────────────────
  const handleJoinBattle = async (overrideBattleId) => {
    const targetId = overrideBattleId || battleId;
    if (!targetId?.trim()) { setSubmitError("Please enter a Battle ID"); return; }
    setJoiningBattle(true);
    setSubmitError(null);
    try {
      const response = await apiClient.post(`/battles/${targetId.trim()}/join`, { clanId: clan._id });
      setSnackbar({ open: true, message: "Successfully joined battle! Redirecting...", severity: "success" });
      setOpenBattleModal(false);
      setBattleId("");
      setTimeout(() => navigate(`/battle/${response.data.battle._id || targetId.trim()}`), 1000);
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Failed to join battle. Please check the Battle ID.");
    } finally {
      setJoiningBattle(false);
    }
  };

  // ── Invite user - CORRECTED ───────────────────────────────────────────────
  const handleInviteUser = async () => {
    if (!inviteUsername.trim()) {
      setSubmitError("Please enter a username");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const searchTerm = inviteUsername.trim();
      
      // Search for user by username
      const response = await apiClient.get(`/users/search2/${encodeURIComponent(searchTerm)}`);
      const user = response.data;
      
      if (!user || (!user._id && !user.id)) {
        throw new Error(`User "${searchTerm}" not found.`);
      }

      const targetId = user._id || user.id;
      
      if (targetId === userId) {
        throw new Error("You cannot invite yourself to the clan.");
      }
      
      if (clan.users?.includes(targetId)) {
        throw new Error(`${user.username || searchTerm} is already a member of this clan!`);
      }

      // Send invitation using the corrected clanService
      await clanService.createNotification(targetId, clan._id);
      
      setSnackbar({
        open: true,
        message: `Invitation sent to ${user.username || searchTerm}!`,
        severity: "success",
      });
      
      setOpenInviteModal(false);
      setInviteUsername("");
      setSelectedSlotIndex(null);

    } catch (err) {
      console.error("Invitation error:", err);
      
      // Handle specific error messages
      if (err.response?.status === 400) {
        if (err.response?.data?.message?.includes("déjà dans le clan")) {
          setSubmitError(`${inviteUsername.trim()} is already a member of this clan!`);
        } else {
          setSubmitError(err.response?.data?.message || "Invalid request");
        }
      } else if (err.response?.status === 404) {
        setSubmitError(`User "${inviteUsername.trim()}" not found.`);
      } else if (err.message) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Failed to send invitation. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const handleCloseFindModal = () => {
    if (!searching && !submitting) {
      setOpenFindTeamModal(false);
      setFindClanId("");
      setFoundClan(null);
      setSubmitError(null);
    }
  };

  const handleCloseBattleModal = () => {
    if (!joiningBattle) {
      setOpenBattleModal(false);
      setBattleId("");
      setSubmitError(null);
    }
  };

  const getMemberSlots = () => {
    const slots = Array(5).fill(null);
    if (clan?.users) {
      for (let i = 0; i < Math.min(clan.users.length, 5); i++) {
        const memberId = clan.users[i];
        slots[i] = {
          id: memberId,
          name: membersDetails[memberId] || `Player ${memberId.slice(-6)}`,
          isLeader: memberId === clan.leaderId || i === 0,
        };
      }
    }
    return slots;
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <VuiBox py={3} display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress aria-label="Loading clans" sx={{ color: "#0075FF" }} />
        </VuiBox>
        <Footer />
      </DashboardLayout>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <VuiBox py={3}>

        {/* Header */}
        <VuiBox mb={4}>
          <VuiBox display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <VuiBox display="flex" alignItems="center" gap={2}>
              <IoPeople size={32} color="#4ec9f0" />
              <VuiTypography variant="h2" color={pageTitleColor} fontWeight="bold">My Crew</VuiTypography>
            </VuiBox>
            {!clan && (
              <VuiButton
                onClick={() => setOpenFindTeamModal(true)}
                sx={{
                  background: "linear-gradient(135deg, #00c7ff 0%, #ff8f3f 100%)",
                  fontWeight: "bold", fontSize: "0.9rem", padding: "10px 20px",
                  boxShadow: "0px 5px 15px rgba(0, 199, 255, 0.3)",
                  '&:hover': { transform: "translateY(-2px)", boxShadow: "0px 8px 20px rgba(0, 199, 255, 0.4)" },
                  transition: "all 0.3s ease",
                }}
              >
                <IoSearch size="18px" style={{ marginRight: "8px" }} /> Find a Team
              </VuiButton>
            )}
          </VuiBox>
          <VuiTypography variant="body1" color={pageTextColor} mt={1}>
            Manage your crew, invite players, and build the perfect team
          </VuiTypography>
        </VuiBox>

        {/* Error state */}
        {error ? (
          <VuiBox textAlign="center" py={5}>
            <VuiTypography variant="h5" color="error" mb={2}>{error}</VuiTypography>
            <VuiButton color="info" onClick={loadUserClan}>Try Again</VuiButton>
          </VuiBox>

        /* No clan state */
        ) : !clan ? (
          <VuiBox textAlign="center" py={5}>
            <VuiBox mb={3}><IoPeople size={80} color="#4ec9f0" /></VuiBox>
            <VuiTypography variant="h4" color={pageTitleColor} mb={2}>No Clan Yet</VuiTypography>
            <VuiTypography variant="body1" color={pageTextColor} mb={4}>
              Create your own clan or find an existing team to join!
            </VuiTypography>
            <VuiBox display="flex" gap={2} justifyContent="center" flexWrap="wrap">
              <VuiButton color="info" onClick={() => setOpenCreateModal(true)}
                sx={{ background: "linear-gradient(135deg, #0075FF 0%, #4318FF 100%)", fontWeight: "bold", fontSize: "1rem", padding: "12px 32px" }}>
                <IoPeople size="20px" style={{ marginRight: "8px" }} /> Create Clan
              </VuiButton>
              <VuiButton onClick={() => setOpenFindTeamModal(true)}
                sx={{ background: "linear-gradient(135deg, #00c7ff 0%, #ff8f3f 100%)", fontWeight: "bold", fontSize: "1rem", padding: "12px 32px", boxShadow: "0px 5px 15px rgba(0, 199, 255, 0.3)" }}>
                <IoSearch size="20px" style={{ marginRight: "8px" }} /> Find a Team
              </VuiButton>
            </VuiBox>
          </VuiBox>

        /* Has clan */
        ) : (
          <>
            {/* Clan Header Card */}
            <VuiBox sx={{ background: "linear-gradient(135deg, rgba(0, 117, 255, 0.15), rgba(67, 24, 255, 0.1))", borderRadius: "20px", padding: "24px", marginBottom: "30px", border: "1px solid rgba(0, 117, 255, 0.3)" }}>
              <VuiBox display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <VuiBox>
                  <VuiTypography variant="h3" color={pageTitleColor} fontWeight="bold" mb={1}>{clan.name}</VuiTypography>
                  <VuiBox display="flex" alignItems="center" gap={1} mb={0.5}>
                    <VuiTypography variant="body2" color={pageTextColor}>CREW ID: {clan._id}</VuiTypography>
                    <Tooltip title={copied ? "Copied!" : "Copy Crew ID"} arrow>
                      <VuiButton size="small" onClick={handleCopyClanId}
                        sx={{
                          minWidth: "auto", padding: "4px 8px",
                          background: copied ? "linear-gradient(135deg, #00c7ff 0%, #00ff88 100%)" : "linear-gradient(135deg, rgba(0, 199, 255, 0.2), rgba(0, 117, 255, 0.2))",
                          borderRadius: "8px",
                          '&:hover': { background: copied ? "linear-gradient(135deg, #00c7ff 0%, #00ff88 100%)" : "linear-gradient(135deg, rgba(0, 199, 255, 0.4), rgba(0, 117, 255, 0.4))", transform: "scale(1.05)" },
                          transition: "all 0.2s ease",
                        }}>
                        {copied ? <IoCheckmark size="16px" color="#00ff88" /> : <IoCopy size="16px" color="#4ec9f0" />}
                      </VuiButton>
                    </Tooltip>
                  </VuiBox>
                  <VuiTypography variant="body2" color="info" mt={1}>{clan.users?.length || 0} / 5 Members</VuiTypography>
                </VuiBox>
                <VuiBox display="flex" gap={2} flexWrap="wrap">
                  <VuiButton color="info" onClick={() => setOpenBattleModal(true)}
                    sx={{ background: "linear-gradient(135deg, #00c7ff 0%, #0075FF 100%)", '&:hover': { transform: "translateY(-2px)" } }}>
                    <IoGameController size="18px" style={{ marginRight: "6px" }} /> Join Battle
                  </VuiButton>
                  <VuiButton color="error" variant="outlined" onClick={handleLeaveClan} disabled={submitting}>
                    <IoExit size="18px" style={{ marginRight: "6px" }} /> Leave
                  </VuiButton>
                  <VuiButton color="error" onClick={handleDeleteClan} disabled={submitting}
                    sx={{ background: "linear-gradient(135deg, #FF4444 0%, #CC0000 100%)" }}>
                    <IoTrash size="18px" style={{ marginRight: "6px" }} /> Delete Clan
                  </VuiButton>
                </VuiBox>
              </VuiBox>
            </VuiBox>

            {/* Available Battles */}
            {availableBattles.length > 0 && (
              <VuiBox mb={4}>
                <VuiTypography variant="h5" color={pageTitleColor} fontWeight="bold" mb={2}>Available Battles</VuiTypography>
                <Grid container spacing={2}>
                  {availableBattles.map((battle) => (
                    <Grid item xs={12} sm={6} md={4} key={battle._id}>
                      <Card
                        sx={{ background: "linear-gradient(135deg, rgba(0, 199, 255, 0.1), rgba(0, 117, 255, 0.05))", border: "1px solid rgba(0, 199, 255, 0.3)", borderRadius: "16px", padding: "16px", cursor: "pointer", transition: "all 0.3s ease", '&:hover': { transform: "translateY(-3px)", borderColor: "rgba(0, 199, 255, 0.6)", boxShadow: "0px 8px 25px rgba(0, 199, 255, 0.2)" } }}
                        onClick={() => handleJoinBattle(battle._id)}
                      >
                        <VuiBox display="flex" alignItems="center" gap={1} mb={1}>
                          <IoGameController size={20} color="#4ec9f0" />
                          <VuiTypography variant="h6" color="white" fontWeight="bold">
                            {battle.name || `Battle ${battle._id.slice(-6)}`}
                          </VuiTypography>
                        </VuiBox>
                        <VuiTypography variant="caption" color="rgba(189, 212, 245, 0.7)">Click to join</VuiTypography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </VuiBox>
            )}

            {/* Member Slots */}
            {loadingMembers ? (
              <VuiBox display="flex" justifyContent="center" py={4}>
                <CircularProgress aria-label="Loading clan members" sx={{ color: "#0075FF" }} />
              </VuiBox>
            ) : (
              <Grid container spacing={3}>
                {getMemberSlots().map((member, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
                    <UserSlotCard isOccupied={!!member}>
                      {member ? (
                        <>
                          <VuiBox sx={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg, #0075FF, #4318FF)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 2 }}>
                            <VuiTypography variant="h4" color="white" fontWeight="bold">
                              {member.name.charAt(0).toUpperCase()}
                            </VuiTypography>
                          </VuiBox>
                          <VuiTypography variant="h6" color={pageTitleColor} fontWeight="bold" textAlign="center">{member.name}</VuiTypography>
                          <VuiTypography variant="caption" color={pageTextColor}>
                            {member.isLeader ? "Leader" : "Member"}
                          </VuiTypography>
                        </>
                      ) : (
                        <>
                          <VuiBox sx={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255, 255, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 2 }}>
                            <IoPersonAdd size={30} color="#4ec9f0" />
                          </VuiBox>
                          <VuiTypography variant="h6" color={pageTextColor} fontWeight="regular">Empty Slot</VuiTypography>
                          <VuiButton size="small" onClick={() => { setSelectedSlotIndex(index); setOpenInviteModal(true); }} sx={{ mt: 1 }}>
                            Invite
                          </VuiButton>
                        </>
                      )}
                    </UserSlotCard>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}

        {/* ── Modals ── */}

        {/* Create Clan Modal */}
        <Modal 
          open={openCreateModal} 
          onClose={() => { setOpenCreateModal(false); setSubmitError(null); setClanName(""); }}
          aria-labelledby="create-clan-modal-title"
        >
          <VuiBox sx={modalStyle}>
            <VuiTypography id="create-clan-modal-title" variant="h4" color="white" mb={3}>Create Your Clan</VuiTypography>
            <TextField fullWidth label="CLAN NAME" value={clanName} onChange={(e) => setClanName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateClan()} sx={inputStyle} />
            {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
            <VuiButton fullWidth disabled={submitting || !clanName.trim()} onClick={handleCreateClan}
              sx={{ background: "linear-gradient(135deg, #00c7ff 0%, #ff8f3f 100%)", fontWeight: "bold", padding: "14px" }}>
              {submitting ? <CircularProgress aria-label="Creating clan" size={24} /> : "Create Clan"}
            </VuiButton>
          </VuiBox>
        </Modal>

        {/* Find Team Modal */}
        <Modal 
          open={openFindTeamModal} 
          onClose={handleCloseFindModal}
          aria-labelledby="find-team-modal-title"
        >
          <VuiBox sx={modalStyle}>
            <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <VuiTypography id="find-team-modal-title" variant="h4" color="white" fontWeight="bold">Find a Team</VuiTypography>
              <VuiButton variant="outlined" onClick={handleCloseFindModal} disabled={searching || submitting}
                sx={{ minWidth: "auto", width: 42, height: 42, padding: 0, borderRadius: "12px", borderColor: "rgba(158, 187, 233, 0.4)", color: "rgba(223, 234, 252, 0.95)", background: "rgba(12, 22, 48, 0.65)" }}>
                <IoClose size="24px" />
              </VuiButton>
            </VuiBox>

            {!foundClan ? (
              <>
                <VuiTypography variant="body2" sx={{ color: "rgba(205, 220, 247, 0.84)" }} mb={3}>
                  Enter the Clan ID to find and join an existing team.
                </VuiTypography>
                <TextField fullWidth label="CLAN ID" placeholder="Enter clan ID..." value={findClanId}
                  onChange={(e) => setFindClanId(e.target.value)} disabled={searching}
                  onKeyDown={(e) => e.key === "Enter" && handleFindClan()}
                  InputLabelProps={{ shrink: true }} sx={inputStyle} />
                {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
                <VuiButton fullWidth disabled={searching || !findClanId.trim()} onClick={handleFindClan}
                  sx={{ background: "linear-gradient(135deg, #00c7ff 0%, #ff8f3f 100%)", fontWeight: "bold", padding: "14px" }}>
                  {searching ? <CircularProgress aria-label="Searching for clan" size={24} /> : <VuiBox display="flex" alignItems="center" gap={1}><IoSearch size="18px" /> Search Clan</VuiBox>}
                </VuiButton>
              </>
            ) : (
              <>
                <VuiBox sx={{ background: "linear-gradient(135deg, rgba(0, 117, 255, 0.15), rgba(67, 24, 255, 0.1))", borderRadius: "16px", padding: "20px", mb: 3, border: "1px solid rgba(0, 117, 255, 0.3)" }}>
                  <VuiTypography variant="h5" color="white" fontWeight="bold" mb={1}>{foundClan.name}</VuiTypography>
                  <VuiTypography variant="body2" color="rgba(189, 212, 245, 0.8)" mb={1}>ID: {foundClan._id}</VuiTypography>
                  <VuiTypography variant="body2" color="info" mb={1}>{foundClan.users?.length || 0} / 5 Members</VuiTypography>
                  {foundClan.memberNames && (
                    <VuiTypography variant="caption" color="rgba(189, 212, 245, 0.6)">
                      Members: {Object.values(foundClan.memberNames).join(", ")}
                    </VuiTypography>
                  )}
                </VuiBox>
                <VuiButton fullWidth disabled={submitting} onClick={handleJoinClan}
                  sx={{ background: "linear-gradient(135deg, #00c7ff 0%, #ff8f3f 100%)", fontWeight: "bold", padding: "14px", mb: 2 }}>
                  {submitting ? <CircularProgress aria-label="Joining clan" size={24} /> : "Join This Team"}
                </VuiButton>
                <VuiButton fullWidth variant="outlined" onClick={() => { setFoundClan(null); setFindClanId(""); setSubmitError(null); }}
                  sx={{ borderColor: "rgba(255, 255, 255, 0.3)", color: "white", "&:hover": { borderColor: "rgba(78, 201, 240, 0.6)", background: "rgba(78, 201, 240, 0.1)" } }}>
                  Search Another Clan
                </VuiButton>
              </>
            )}
          </VuiBox>
        </Modal>

        {/* Join Battle Modal */}
        <Modal open={openBattleModal} onClose={handleCloseBattleModal}>
          <VuiBox sx={modalStyle}>
            <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <VuiBox display="flex" alignItems="center" gap={1.5}>
                <IoGameController size="24px" color="#4ec9f0" />
                <VuiTypography variant="h4" color="white" fontWeight="bold">Join a Battle</VuiTypography>
              </VuiBox>
              <VuiButton variant="outlined" onClick={handleCloseBattleModal} disabled={joiningBattle}
                sx={{ minWidth: "auto", width: 42, height: 42, padding: 0, borderRadius: "12px", borderColor: "rgba(158, 187, 233, 0.4)", color: "rgba(223, 234, 252, 0.95)", background: "rgba(12, 22, 48, 0.65)" }}>
                <IoClose size="24px" />
              </VuiButton>
            </VuiBox>
            <VuiTypography variant="body2" sx={{ color: "rgba(205, 220, 247, 0.84)" }} mb={3}>
              Enter the Battle ID to join an existing battle with your clan.
            </VuiTypography>
            <TextField fullWidth label="BATTLE ID" placeholder="Enter battle ID..." value={battleId}
              onChange={(e) => setBattleId(e.target.value)} disabled={joiningBattle}
              onKeyDown={(e) => e.key === "Enter" && handleJoinBattle()}
              InputLabelProps={{ shrink: true }} sx={inputStyle} />
            {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
            <VuiButton fullWidth disabled={joiningBattle || !battleId.trim()} onClick={() => handleJoinBattle()}
              sx={{ background: "linear-gradient(135deg, #00c7ff 0%, #ff8f3f 100%)", fontWeight: "bold", padding: "14px" }}>
              {joiningBattle ? <CircularProgress aria-label="Joining battle" size={24} /> : <VuiBox display="flex" alignItems="center" gap={1}><IoGameController size="18px" /> Join Battle</VuiBox>}
            </VuiButton>
          </VuiBox>
        </Modal>

        {/* Invite Modal */}
        <Modal open={openInviteModal} onClose={() => { if (!submitting) { setOpenInviteModal(false); setInviteUsername(""); setSubmitError(null); } }}>
          <VuiBox sx={modalStyle}>
            <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <VuiBox display="flex" alignItems="center" gap={1.5}>
                <IoPersonAdd size="24px" color="#4ec9f0" />
                <VuiTypography variant="h4" color="white" fontWeight="bold">Invite Player</VuiTypography>
              </VuiBox>
              <VuiButton variant="outlined" onClick={() => { if (!submitting) { setOpenInviteModal(false); setInviteUsername(""); setSubmitError(null); } }} disabled={submitting}
                sx={{ minWidth: "auto", width: 42, height: 42, padding: 0, borderRadius: "12px", borderColor: "rgba(158, 187, 233, 0.4)", color: "rgba(223, 234, 252, 0.95)", background: "rgba(12, 22, 48, 0.65)" }}>
                <IoClose size="24px" />
              </VuiButton>
            </VuiBox>

            {/* Show current members */}
            <VuiBox sx={{ background: "rgba(0, 117, 255, 0.1)", borderRadius: "12px", padding: "12px", mb: 3 }}>
              <VuiTypography variant="body2" color="info" mb={1}>Current Members ({clan?.users?.length || 0}/5):</VuiTypography>
              <VuiBox display="flex" flexWrap="wrap" gap={1}>
                {clan?.users?.map(memberId => {
                  const memberName = membersDetails[memberId] || `Player ${memberId.slice(-6)}`;
                  return (
                    <VuiTypography key={memberId} variant="caption" sx={{ background: "rgba(78, 201, 240, 0.2)", padding: "4px 8px", borderRadius: "8px" }}>
                      {memberName}
                    </VuiTypography>
                  );
                })}
              </VuiBox>
            </VuiBox>

            <VuiTypography variant="body2" sx={{ color: "rgba(205, 220, 247, 0.84)" }} mb={3}>
              Enter the exact username of the player you want to invite.
            </VuiTypography>

            <TextField
              fullWidth
              label="PLAYER USERNAME"
              placeholder="Ex: Phoenix"
              value={inviteUsername}
              onChange={(e) => { setInviteUsername(e.target.value); setSubmitError(null); }}
              onKeyDown={(e) => e.key === "Enter" && handleInviteUser()}
              disabled={submitting}
              InputLabelProps={{ shrink: true }}
              sx={inputStyle}
            />

            {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

            <VuiButton fullWidth disabled={submitting || !inviteUsername.trim()} onClick={handleInviteUser}
              sx={{ background: "linear-gradient(135deg, #00c7ff 0%, #ff8f3f 100%)", fontWeight: "bold", padding: "14px" }}>
              {submitting ? <CircularProgress aria-label="Sending invitation" size={24} /> : (
                <VuiBox display="flex" alignItems="center" gap={1}>
                  <IoPersonAdd size="18px" /> Send Invitation
                </VuiBox>
              )}
            </VuiButton>
          </VuiBox>
        </Modal>

        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>

      </VuiBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Clans;