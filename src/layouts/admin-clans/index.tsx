import { useState, useEffect } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout/index.jsx";
import DashboardNavbar from "examples/Navbars/DashboardNavbar/index.jsx";
import { useVisionUIController } from "context/index.jsx";
import VuiBox from "components/VuiBox/index.jsx";
import VuiTypography from "components/VuiTypography/index.jsx";
import VuiButton from "components/VuiButton/index.jsx";
import {
  Card,
  Chip,
  IconButton,
  Tooltip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  InputAdornment,
} from "@mui/material";
import {
  IoRefresh,
  IoEye,
  IoClose,
  IoTrash,
  IoCreate,
  IoAdd,
  IoSearch,
  IoCopy,
  IoCheckmark,
} from "react-icons/io5";
import { clanService, type Clan } from "../../services/clan.service.js";
import apiClient from "../../services/api.js";
import type { ReactNode } from "react";

type ClanDialogMode = "view" | "edit" | "create";

interface MiniStatisticsCardProps {
  title: { text: string };
  count: ReactNode;
  percentage?: { color: "inherit" | "primary" | "secondary" | "info" | "success" | "warning" | "error" | "light" | "dark" | "text" | "white" | "logo"; text: string };
  icon: { component: string };
}

export default function AdminClans() {
  const [controller] = useVisionUIController();
  const { darkMode } = controller;
  const [clans, setClans] = useState<Clan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClan, setSelectedClan] = useState<Clan | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<ClanDialogMode>("view");
  const [formData, setFormData] = useState<{ name: string; userId: string }>({ name: "", userId: "" });
  const [membersDetails, setMembersDetails] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchClans();
  }, []);

  const fetchUserDetails = async (userId: string): Promise<string> => {
    try {
      const response = await apiClient.get(`/users/${userId}`);
      const user = response.data;
      return user?.username || user?.email?.split('@')[0] || `Player ${userId?.slice(-6)}`;
    } catch {
      return `Player ${userId?.slice(-6)}`;
    }
  };

  const fetchClans = async () => {
    setLoading(true);
    try {
      const data = await clanService.getAllClans();
      const clansData = Array.isArray(data) ? (data as Clan[]) : [];
      setClans(clansData);
      
      const allMembersDetails: Record<string, string> = {};
      for (const clan of clansData) {
        if (clan.users && clan.users.length > 0) {
          for (const userId of clan.users) {
            if (!allMembersDetails[userId]) {
              allMembersDetails[userId] = await fetchUserDetails(userId);
            }
          }
        }
      }
      setMembersDetails(allMembersDetails);
    } catch (error) {
      console.error("Failed to fetch clans:", error);
      setClans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleCreateClan = async () => {
    if (!formData.name.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      await clanService.createClan({
        name: formData.name.trim(),
        userId: formData.userId.trim() || undefined,
      });
      await fetchClans();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error creating clan:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateClan = async () => {
    if (!selectedClan) return;
    if (!formData.name.trim()) return;

    setSubmitting(true);
    try {
      await clanService.updateClan(selectedClan._id, { name: formData.name.trim() });
      await fetchClans();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error updating clan:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClan = async (clanId: string, clanName: string) => {
    if (!window.confirm(`Delete "${clanName}"? This cannot be undone.`)) return;

    try {
      await clanService.deleteClan(clanId);
      await fetchClans();
    } catch (error) {
      console.error("Error deleting clan:", error);
    }
  };

  const handleViewClan = (clan: Clan) => {
    setSelectedClan(clan);
    setDialogMode("view");
    setDialogOpen(true);
  };

  const handleEditClan = (clan: Clan) => {
    setSelectedClan(clan);
    setFormData({ name: clan.name, userId: "" });
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleOpenCreate = () => {
    resetForm();
    setDialogMode("create");
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: "", userId: "" });
    setSelectedClan(null);
  };

  const handleCloseDialog = () => {
    if (!submitting) {
      setDialogOpen(false);
      resetForm();
    }
  };

  const filteredClans = clans.filter((clan) =>
    clan.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clan._id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMemberNames = (userIds: string[] | undefined) => {
    if (!userIds || userIds.length === 0) return "No members";
    const names = userIds.map((id) => membersDetails[id] || `Player ${id?.slice(-6)}`);
    return names.join(", ");
  };

  const stats = {
    total: clans.length,
    full: clans.filter(c => (c.users?.length || 0) >= 5).length,
    available: clans.filter(c => (c.users?.length || 0) < 5).length,
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <VuiBox py={3}>
        {/* Header */}
        <Card
          sx={{
            mb: 3,
            p: 3,
            border: darkMode
              ? "1px solid rgba(255,255,255,0.08)"
              : "1px solid rgba(148, 163, 184, 0.3)",
            background: darkMode
              ? "radial-gradient(circle at 5% 5%, rgba(0,117,255,0.22) 0%, rgba(6,11,40,0.95) 36%, rgba(10,14,35,0.88) 100%)"
              : "radial-gradient(circle at 8% 12%, rgba(56, 189, 248, 0.25) 0%, rgba(255,255,255,0.98) 40%, rgba(241,245,249,0.96) 100%)",
          }}
        >
          <VuiBox display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <VuiBox>
              <VuiTypography variant="h4" color={darkMode ? "white" : "dark"} fontWeight="bold" mb={0.6}>
                Admin Teams
              </VuiTypography>
              <VuiTypography variant="button" color={darkMode ? "text" : "dark"}>
                Manage all clans - Create, Edit, Delete, and View clan details
              </VuiTypography>
            </VuiBox>
            <VuiButton
              color="info"
              size="small"
              onClick={() => fetchClans()}
              disabled={loading}
              startIcon={<IoRefresh size={16} />}
            >
              Refresh Data
            </VuiButton>
          </VuiBox>
        </Card>

        {/* Statistics Cards */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={4}>
            <MiniStatisticsCard
              title={{ text: "Total Clans" }}
              count={loading ? "..." : stats.total}
              percentage={{ color: "success", text: "" }}
              icon={{ component: "groups" }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <MiniStatisticsCard
              title={{ text: "Full Clans" }}
              count={loading ? "..." : stats.full}
              percentage={{ color: "info", text: "" }}
              icon={{ component: "people" }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <MiniStatisticsCard
              title={{ text: "Available Spots" }}
              count={loading ? "..." : stats.available}
              percentage={{ color: "warning", text: "" }}
              icon={{ component: "person_add" }}
            />
          </Grid>
        </Grid>

        {/* Main Table Card */}
        <Card
          sx={{
            p: 3,
            border: darkMode
              ? "1px solid rgba(255,255,255,0.08)"
              : "1px solid rgba(148, 163, 184, 0.28)",
            background: darkMode
              ? "linear-gradient(135deg, rgba(10, 18, 48, 0.95), rgba(7, 14, 39, 0.92))"
              : "linear-gradient(135deg, rgba(255, 255, 255, 0.99), rgba(241, 245, 249, 0.96))",
          }}
        >
          <VuiBox
            mb={2}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            gap={2}
            flexWrap="wrap"
          >
            <VuiBox>
              <VuiTypography variant="lg" color={darkMode ? "white" : "dark"} fontWeight="bold">
                All Clans
              </VuiTypography>
              <VuiTypography variant="caption" color={darkMode ? "text" : "dark"}>
                View and manage all clans in the system
              </VuiTypography>
            </VuiBox>
            <Stack direction="row" spacing={1}>
              <Chip
                label={`Total: ${filteredClans.length}`}
                size="small"
                sx={{
                  color: "#b8d8ff",
                  border: "1px solid rgba(0,117,255,0.35)",
                  backgroundColor: "rgba(0,117,255,0.14)",
                }}
              />
              <VuiButton
                variant="contained"
                onClick={handleOpenCreate}
                startIcon={<IoAdd />}
                sx={{
                  background: "linear-gradient(135deg, #00c7ff 0%, #ff8f3f 100%)",
                  fontWeight: "bold",
                  fontSize: "0.75rem",
                  py: 0.8,
                }}
              >
                Create Clan
              </VuiButton>
            </Stack>
          </VuiBox>

          <VuiBox display="flex" gap={2} mb={2} flexWrap="wrap">
            <TextField
              size="small"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name or ID"
              sx={{
                minWidth: 260,
                flexGrow: 1,
                "& .MuiInputBase-root": {
                  backgroundColor: darkMode
                    ? "rgba(7, 19, 48, 0.9) !important"
                    : "#ffffff !important",
                  color: darkMode ? "#e8f2ff !important" : "#0f172a !important",
                },
                "& .MuiOutlinedInput-root": {
                  backgroundColor: darkMode
                    ? "rgba(7, 19, 48, 0.9) !important"
                    : "#ffffff !important",
                  color: darkMode ? "#e8f2ff !important" : "#0f172a !important",
                  borderRadius: "10px",
                  "& fieldset": {
                    borderColor: darkMode
                      ? "rgba(132, 171, 235, 0.35) !important"
                      : "rgba(148, 163, 184, 0.45) !important",
                  },
                  "&:hover fieldset": {
                    borderColor: darkMode
                      ? "rgba(132, 171, 235, 0.6) !important"
                      : "rgba(100, 116, 139, 0.6) !important",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "rgba(0, 117, 255, 0.8) !important",
                  },
                },
                "& .MuiInputBase-input": {
                  color: darkMode ? "#e8f2ff !important" : "#0f172a !important",
                  WebkitTextFillColor: darkMode ? "#e8f2ff !important" : "#0f172a !important",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IoSearch size={16} color="#9ebde2" />
                  </InputAdornment>
                ),
              }}
            />
          </VuiBox>

          <TableContainer
            sx={{
              p: 1.5,
              borderRadius: "12px",
              border: darkMode
                ? "1px solid rgba(116, 153, 224, 0.25)"
                : "1px solid rgba(148, 163, 184, 0.34)",
              background: darkMode ? "rgba(5, 14, 37, 0.78)" : "rgba(255, 255, 255, 0.96)",
              overflow: "hidden",
            }}
          >
            <Table
              size="small"
              sx={{
                tableLayout: "fixed",
                width: "100%",
                "& .MuiTableCell-root": {
                  borderBottom: darkMode
                    ? "1px solid rgba(94, 128, 189, 0.24)"
                    : "1px solid rgba(203, 213, 225, 0.7)",
                  color: darkMode
                    ? "rgba(224, 239, 255, 0.95) !important"
                    : "#0f172a !important",
                  backgroundColor: darkMode
                    ? "rgba(9, 22, 52, 0.92) !important"
                    : "rgba(255, 255, 255, 0.96) !important",
                  verticalAlign: "middle",
                },
                "& .MuiTableHead-root .MuiTableCell-root": {
                  color: darkMode ? "#bdd8ff !important" : "#334155 !important",
                  fontWeight: 700,
                  backgroundColor: darkMode
                    ? "rgba(12, 25, 61, 0.98) !important"
                    : "rgba(241, 245, 249, 0.98) !important",
                  letterSpacing: "0.3px",
                  whiteSpace: "nowrap",
                },
                "& .MuiTableBody-root .MuiTableCell-root": {
                  backgroundColor: darkMode
                    ? "rgba(7, 18, 45, 0.9) !important"
                    : "rgba(255, 255, 255, 0.98) !important",
                },
                "& .MuiTableBody-root .MuiTableRow-root:hover": {
                  backgroundColor: darkMode
                    ? "rgba(0, 117, 255, 0.1) !important"
                    : "rgba(219, 234, 254, 0.72) !important",
                },
              }}
            >
              <TableHead>
               
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <VuiTypography variant="button" color="text">
                        Loading clans...
                      </VuiTypography>
                    </TableCell>
                  </TableRow>
                ) : filteredClans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <VuiTypography variant="button" color="text">
                        No clans found
                      </VuiTypography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClans.map((clan) => (
                    <TableRow key={clan._id}>
                      <TableCell sx={{ width: "25%", pl: 1 }}>
                        <VuiTypography
                          variant="button"
                          color={darkMode ? "white" : "dark"}
                          fontWeight="medium"
                          sx={{
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {clan.name}
                        </VuiTypography>
                      </TableCell>
                      <TableCell sx={{ width: "20%" }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip
                            label={clan._id?.slice(-8)}
                            size="small"
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "0.7rem",
                              background: "rgba(0, 117, 255, 0.15)",
                              color: "#0075FF",
                            }}
                          />
                          <Tooltip title="Copy ID" arrow>
                            <IconButton size="small" onClick={() => handleCopyId(clan._id)} sx={{ p: 0.5 }}>
                              {copiedId === clan._id ? <IoCheckmark size="14px" color="#00ff88" /> : <IoCopy size="14px" color="#0075FF" />}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ width: "20%" }}>
                        <Tooltip title={getMemberNames(clan.users)} arrow>
                          <VuiTypography
                            variant="caption"
                            color={darkMode ? "text" : "dark"}
                            sx={{ cursor: "pointer" }}
                          >
                            {clan.users?.length || 0} member{clan.users?.length !== 1 ? "s" : ""}
                          </VuiTypography>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ width: "15%" }}>
                        <Chip
                          label={`${clan.users?.length || 0} / 5`}
                          size="small"
                          sx={{
                            background: (clan.users?.length || 0) >= 5
                              ? "rgba(76, 175, 80, 0.15)"
                              : "rgba(0, 117, 255, 0.15)",
                            color: (clan.users?.length || 0) >= 5 ? "#4CAF50" : "#0075FF",
                            fontWeight: "bold",
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ width: "15%" }}>
                        <VuiTypography variant="caption" color={darkMode ? "text" : "dark"}>
                          {clan.createdAt ? new Date(clan.createdAt).toLocaleDateString() : "N/A"}
                        </VuiTypography>
                      </TableCell>
                      <TableCell align="right" sx={{ width: "5%" }}>
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="View">
                            <IconButton size="small" onClick={() => handleViewClan(clan)}>
                              <IoEye size={16} color="#9ec5ff" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleEditClan(clan)}>
                              <IoCreate size={16} color="#fb8c00" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => handleDeleteClan(clan._id, clan.name)}>
                              <IoTrash size={16} color="#ff8d8d" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </VuiBox>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: darkMode
              ? "linear-gradient(145deg, rgba(7, 14, 48, 0.98), rgba(8, 16, 46, 0.96))"
              : "linear-gradient(135deg, rgba(255, 255, 255, 1), rgba(248, 250, 252, 0.98))",
            border: darkMode ? "1px solid rgba(0, 117, 255, 0.2)" : "1px solid rgba(148, 163, 184, 0.25)",
            borderRadius: "20px",
          },
        }}
      >
        <DialogTitle>
          <VuiBox display="flex" justifyContent="space-between" alignItems="center">
            <VuiTypography variant="h5" color={darkMode ? "white" : "dark"} fontWeight="bold">
              {dialogMode === "create" ? "Create New Clan" : dialogMode === "edit" ? "Edit Clan" : "Clan Details"}
            </VuiTypography>
            <IconButton onClick={handleCloseDialog} size="small" disabled={submitting}>
              <IoClose color={darkMode ? "#fff" : "#000"} />
            </IconButton>
          </VuiBox>
        </DialogTitle>
        <DialogContent>
          {dialogMode === "view" && selectedClan ? (
            <VuiBox>
              <VuiBox mb={3}>
                <VuiTypography variant="caption" color="text" mb={1}>
                  Clan Name:
                </VuiTypography>
                <VuiTypography variant="h6" color={darkMode ? "white" : "dark"} fontWeight="bold">
                  {selectedClan.name}
                </VuiTypography>
              </VuiBox>
              <VuiBox mb={3}>
                <VuiTypography variant="caption" color="text" mb={1}>
                  Clan ID:
                </VuiTypography>
                <Chip
                  label={selectedClan._id}
                  size="small"
                  sx={{ fontFamily: "monospace", background: darkMode ? "rgba(0, 117, 255, 0.15)" : "rgba(0, 117, 255, 0.08)" }}
                />
              </VuiBox>
              <VuiBox mb={3}>
                <VuiTypography variant="caption" color="text" mb={1}>
                  Members ({selectedClan.users?.length || 0} / 5):
                </VuiTypography>
                <VuiBox sx={{ maxHeight: "200px", overflowY: "auto" }}>
                  {selectedClan.users?.map((memberId, idx) => (
                    <VuiBox key={idx} p={1} sx={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                      <VuiTypography variant="body2" color={darkMode ? "white" : "dark"}>
                        {membersDetails[memberId] || `Player ${memberId?.slice(-6)}`}
                      </VuiTypography>
                      <VuiTypography variant="caption" color="text" sx={{ fontFamily: "monospace" }}>
                        ID: {memberId}
                      </VuiTypography>
                    </VuiBox>
                  ))}
                  {(!selectedClan.users || selectedClan.users.length === 0) && (
                    <VuiTypography variant="body2" color="text" textAlign="center">
                      No members yet
                    </VuiTypography>
                  )}
                </VuiBox>
              </VuiBox>
              <VuiBox>
                <VuiTypography variant="caption" color="text" mb={1}>
                  Created At:
                </VuiTypography>
                <VuiTypography variant="body2" color={darkMode ? "white" : "dark"}>
                  {selectedClan.createdAt ? new Date(selectedClan.createdAt).toLocaleString() : "N/A"}
                </VuiTypography>
              </VuiBox>
            </VuiBox>
          ) : (
            <VuiBox>
              <TextField
                fullWidth
                label="Clan Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: darkMode ? "#fff" : "#000",
                    borderRadius: "12px",
                    "& fieldset": {
                      borderColor: darkMode ? "rgba(0, 117, 255, 0.25)" : "rgba(148, 163, 184, 0.3)",
                    },
                  },
                }}
              />
              {dialogMode === "create" && (
                <TextField
                  fullWidth
                  label="Creator User ID (optional)"
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  margin="normal"
                  placeholder="Leave empty to create without a creator"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: darkMode ? "#fff" : "#000",
                      borderRadius: "12px",
                      "& fieldset": {
                        borderColor: darkMode ? "rgba(0, 117, 255, 0.25)" : "rgba(148, 163, 184, 0.3)",
                      },
                    },
                  }}
                />
              )}
            </VuiBox>
          )}
        </DialogContent>
        <DialogActions>
          <VuiButton variant="outlined" color="secondary" onClick={handleCloseDialog} disabled={submitting}>
            {dialogMode === "view" ? "Close" : "Cancel"}
          </VuiButton>
          {dialogMode !== "view" && (
            <VuiButton
              variant="contained"
              color="info"
              onClick={dialogMode === "create" ? handleCreateClan : handleUpdateClan}
              disabled={submitting || !formData.name.trim()}
            >
              {submitting ? "Processing..." : (dialogMode === "create" ? "Create" : "Save")}
            </VuiButton>
          )}
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

// MiniStatisticsCard component (same as in AdminDashboard)
function MiniStatisticsCard({ title, count, percentage, icon }: MiniStatisticsCardProps) {
  const [controller] = useVisionUIController();
  const { darkMode } = controller;
  
  return (
    <Card
      sx={{
        p: 2,
        borderRadius: "16px",
        background: darkMode
          ? "linear-gradient(135deg, rgba(10, 18, 48, 0.95), rgba(7, 14, 39, 0.92))"
          : "linear-gradient(135deg, rgba(255, 255, 255, 0.99), rgba(241, 245, 249, 0.96))",
        border: darkMode
          ? "1px solid rgba(255,255,255,0.08)"
          : "1px solid rgba(148, 163, 184, 0.28)",
        boxShadow: darkMode
          ? "0 4px 20px rgba(0,0,0,0.3)"
          : "0 2px 12px rgba(0,0,0,0.05)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: darkMode
            ? "0 8px 28px rgba(0,117,255,0.2)"
            : "0 6px 20px rgba(0,117,255,0.12)",
        },
      }}
    >
      <VuiBox display="flex" justifyContent="space-between" alignItems="center">
        <VuiBox>
          <VuiTypography variant="caption" color={darkMode ? "text" : "dark"} fontWeight="medium">
            {title.text}
          </VuiTypography>
          <VuiTypography variant="h3" color={darkMode ? "white" : "dark"} fontWeight="bold" mt={0.5}>
            {count}
          </VuiTypography>
          {percentage && (
            <VuiTypography variant="caption" color={percentage.color} mt={0.5}>
              {percentage.text}
            </VuiTypography>
          )}
        </VuiBox>
        <VuiBox
          sx={{
            width: 48,
            height: 48,
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, rgba(0,117,255,0.15), rgba(0,117,255,0.05))",
            color: "#0075FF",
          }}
        >
          <span className="material-icons">{icon.component}</span>
        </VuiBox>
      </VuiBox>
    </Card>
  );
}