import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout/index.jsx";
import DashboardNavbar from "examples/Navbars/DashboardNavbar/index.jsx";
import { useVisionUIController } from "context/index.jsx";
import VuiBox from "components/VuiBox/index.jsx";
import VuiTypography from "components/VuiTypography/index.jsx";
import VuiButton from "components/VuiButton/index.jsx";
import {
    Grid,
    Card,
    Stack,
    Chip,
    TextField,
    InputAdornment,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    Select,
    MenuItem,
    IconButton,
    Tooltip,
    Alert,
    Divider,
    FormControl,
} from "@mui/material";
import { adminService, UserAnalytics, AdminUser } from "../../services/admin.service.js";
import challengeService, { ChallengeTicket } from "../../services/challenge.service.js";
import MiniStatisticsCard from "examples/Cards/StatisticsCards/MiniStatisticsCard";
import {
    IoBan,
    IoRefresh,
    IoKey,
    IoSearch,
    IoSparkles,
} from "react-icons/io5";
import type { AxiosError } from "axios";

type RoleFilter = "all" | "admin" | "user";
type TicketStatusFilter = "all" | "open" | "in_progress" | "closed";

export default function AdminDashboard() {
    const [controller] = useVisionUIController();
    const { darkMode } = controller;
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
    const [actionUserId, setActionUserId] = useState<string | null>(null);
    const [actionFeedback, setActionFeedback] = useState<string>("");
    const [tickets, setTickets] = useState<ChallengeTicket[]>([]);
    const [allTickets, setAllTickets] = useState<ChallengeTicket[]>([]);
    const [ticketStatusFilter, setTicketStatusFilter] = useState<TicketStatusFilter>("all");

    const getUserId = (user: AdminUser): string | null => user._id || user.id || null;
    const getTicketId = (ticket: ChallengeTicket): string | null => {
        if (typeof ticket._id === "string" && ticket._id.trim().length > 0) return ticket._id;
        if (typeof ticket.id === "string" && ticket.id.trim().length > 0) return ticket.id;
        if (typeof ticket.ticketId === "string" && ticket.ticketId.trim().length > 0) return ticket.ticketId;
        return null;
    };
    const getTicketChallengeId = (ticket: ChallengeTicket): string | null => {
        if (typeof ticket.challengeId === "string" && ticket.challengeId.trim().length > 0) return ticket.challengeId;
        return null;
    };

    const getErrorMessage = (error: unknown, fallback: string): string => {
        const axiosError = error as AxiosError<{ message?: string }>;
        const apiMessage = axiosError?.response?.data?.message;
        if (typeof apiMessage === "string" && apiMessage.trim().length > 0) {
            return apiMessage;
        }
        return fallback;
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        setActionFeedback("");
        try {
            const [analyticsResult, usersResult] = await Promise.allSettled([
                adminService.getAnalytics(),
                adminService.getAllUsers(),
            ]);

            const [ticketsResult, allTicketsResult] = await Promise.allSettled([
                challengeService.getTickets(ticketStatusFilter === "all" ? undefined : ticketStatusFilter),
                challengeService.getTickets(),
            ]);

            if (analyticsResult.status === "fulfilled") {
                setAnalytics(analyticsResult.value);
            } else {
                setAnalytics(null);
                console.error("Failed to fetch admin analytics:", analyticsResult.reason);
            }

            if (usersResult.status === "fulfilled") {
                setUsers(usersResult.value);
            } else {
                setUsers([]);
                console.error("Failed to fetch admin users:", usersResult.reason);
                setActionFeedback("Could not load users in this view. Please refresh and try again.");
            }

            if (ticketsResult.status === "fulfilled") {
                setTickets(ticketsResult.value);
            } else {
                console.error("Failed to fetch filtered tickets:", ticketsResult.reason);
                setTickets([]);
            }

            if (allTicketsResult.status === "fulfilled") {
                setAllTickets(allTicketsResult.value);
            } else {
                console.error("Failed to fetch all tickets:", allTicketsResult.reason);
                setAllTickets([]);
            }
        } catch (error) {
            console.error("Failed to fetch admin dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchDashboardData();
    }, [ticketStatusFilter]);

    const recentUsers = useMemo(() => {
        return [...users]
            .sort((a, b) => {
                const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return bDate - aDate;
            })
            .filter((user) => {
                const term = searchTerm.trim().toLowerCase();
                const matchesSearch =
                    term.length === 0 ||
                    user.username.toLowerCase().includes(term) ||
                    user.email.toLowerCase().includes(term);
                const matchesRole = roleFilter === "all" || user.role === roleFilter;

                return matchesSearch && matchesRole;
            })
            .slice(0, 8);
    }, [users, searchTerm, roleFilter]);

    const adminCount = useMemo(() => users.filter((u) => u.role === "admin").length, [users]);
    const bannedCount = useMemo(() => users.filter((u) => u.isBanned).length, [users]);
    const newUsers7Days = useMemo(
        () =>
            users.filter((u) => {
                if (!u.createdAt) return false;
                const created = new Date(u.createdAt).getTime();
                const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                return created >= sevenDaysAgo;
            }).length,
        [users],
    );

    const ticketCounts = useMemo(() => {
        return allTickets.reduce(
            (acc, ticket) => {
                acc.all += 1;
                if (ticket.status === "open") acc.open += 1;
                if (ticket.status === "in_progress") acc.in_progress += 1;
                if (ticket.status === "closed") acc.closed += 1;
                return acc;
            },
            { all: 0, open: 0, in_progress: 0, closed: 0 },
        );
    }, [allTickets]);

    const challengeTicketRanking = useMemo(() => {
        const activeTickets = allTickets.filter(
            (ticket) => ticket.status === "open" || ticket.status === "in_progress",
        );

        const rankingMap = new Map<
            string,
            {
                challengeId: string;
                challengeTitle: string;
                total: number;
                open: number;
                inProgress: number;
            }
        >();

        for (const ticket of activeTickets) {
            const challengeId = String(ticket.challengeId || "").trim();
            const challengeTitle = String(ticket.challengeTitle || "Untitled challenge").trim();
            const key = challengeId || challengeTitle;
            if (!key) continue;

            const current = rankingMap.get(key) || {
                challengeId,
                challengeTitle: challengeTitle || "Untitled challenge",
                total: 0,
                open: 0,
                inProgress: 0,
            };

            current.total += 1;
            if (ticket.status === "open") current.open += 1;
            if (ticket.status === "in_progress") current.inProgress += 1;
            rankingMap.set(key, current);
        }

        return [...rankingMap.values()].sort((a, b) => b.total - a.total).slice(0, 6);
    }, [allTickets]);

    const updateUserInState = (userId: string, updates: Partial<AdminUser>) => {
        setUsers((prev) =>
            prev.map((user) => {
                const id = getUserId(user);
                if (!id) return user;
                return id === userId ? { ...user, ...updates } : user;
            }),
        );
    };

    const handleRoleChange = async (user: AdminUser, role: "user" | "admin") => {
        const userId = getUserId(user);
        if (!userId) {
            setActionFeedback("User ID is missing for this record. Refresh and try again.");
            return;
        }

        setActionUserId(userId);
        setActionFeedback("");
        try {
            await adminService.updateRole(userId, role);
            updateUserInState(userId, { role });
            setActionFeedback(`Role updated successfully to ${role}.`);
        } catch (error) {
            console.error("Failed to update user role:", error);
            setActionFeedback(getErrorMessage(error, "Role update failed. Please try again."));
        } finally {
            setActionUserId(null);
        }
    };

    const handleToggleBan = async (user: AdminUser) => {
        const userId = getUserId(user);
        if (!userId) {
            setActionFeedback("User ID is missing for this record. Refresh and try again.");
            return;
        }

        setActionUserId(userId);
        setActionFeedback("");
        try {
            await adminService.updateStatus(userId, !user.isBanned);
            updateUserInState(userId, { isBanned: !user.isBanned });
            setActionFeedback(
                `${user.username} has been ${user.isBanned ? "unbanned" : "banned"} successfully.`,
            );
        } catch (error) {
            console.error("Failed to update user status:", error);
            setActionFeedback(getErrorMessage(error, "Status update failed. Please try again."));
        } finally {
            setActionUserId(null);
        }
    };

    const handleResetPassword = async (user: AdminUser) => {
        const userId = getUserId(user);
        if (!userId) {
            setActionFeedback("User ID is missing for this record. Refresh and try again.");
            return;
        }

        const confirmed = globalThis.confirm(`Reset password for ${user.username}?`);
        if (!confirmed) return;

        setActionUserId(userId);
        setActionFeedback("");

        try {
            const result = await adminService.resetPassword(userId);
            const tempPassword = result?.tempPassword ?? "No temporary password returned.";
            globalThis.alert(`Temporary password for ${user.username}: ${tempPassword}`);
            setActionFeedback(`Password reset for ${user.username}.`);
        } catch (error) {
            console.error("Failed to reset password:", error);
            setActionFeedback(getErrorMessage(error, "Password reset failed. Please try again."));
        } finally {
            setActionUserId(null);
        }
    };

    const handleTreatTicket = async (
        ticket: ChallengeTicket,
        status: "open" | "in_progress" | "closed",
    ) => {
        const challengeId = getTicketChallengeId(ticket);
        const ticketId = getTicketId(ticket);
        if (!challengeId || !ticketId) {
            setActionFeedback("Ticket identifiers are missing. Please refresh and try again.");
            return;
        }

        const adminResponse = globalThis.prompt(
            "Optional admin response for this ticket:",
            ticket.adminResponse || "",
        );

        try {
            await challengeService.treatTicket(challengeId, ticketId, {
                status,
                adminResponse: adminResponse || undefined,
            });
            setActionFeedback(`Ticket moved to ${status.replace("_", " ")}.`);
            await fetchDashboardData();
        } catch (error) {
            console.error("Failed to treat ticket:", error);
            setActionFeedback("Failed to update ticket status.");
        }
    };

    const formatUseCases = (ticket: ChallengeTicket): string => {
        const values =
            Array.isArray(ticket.useCases) && ticket.useCases.length > 0
                ? ticket.useCases
                : ticket.useCase
                  ? [ticket.useCase]
                  : [];

        if (values.length === 0) {
            return "unspecified";
        }

        return values.map((item) => item.replace(/_/g, " ")).join(", ");
    };

    const getTicketReporterName = (ticket: ChallengeTicket): string => {
        const username = typeof ticket.reporterUsername === "string" ? ticket.reporterUsername.trim() : "";
        if (username.length > 0) return username;

        if (ticket.reporterId) {
            const matchedUser = users.find((user) => {
                const id = String(user._id || user.id || "");
                return id.length > 0 && id === String(ticket.reporterId);
            });

            const matchedUsername = matchedUser?.username?.trim();
            if (matchedUsername) {
                return matchedUsername;
            }
        }

        const email = typeof ticket.reporterEmail === "string" ? ticket.reporterEmail.trim() : "";
        if (email.length > 0) {
            const emailName = email.split("@")[0]?.trim();
            if (emailName) return emailName;
            return email;
        }

        if (ticket.reporterId) {
            return `user-${String(ticket.reporterId).slice(-6)}`;
        }

        return "unknown user";
    };

    return (
        <DashboardLayout>
            <DashboardNavbar />
            <VuiBox py={3}>
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
                            <VuiTypography variant="h1" color={darkMode ? "white" : "dark"} fontWeight="bold" mb={0.6} sx={{ fontSize: "1.75rem" }}>
                                Admin Control Center
                            </VuiTypography>
                            <VuiTypography variant="button" color={darkMode ? "text" : "dark"}>
                                Manage users, roles, and account security from one place.
                            </VuiTypography>
                        </VuiBox>
                        <VuiButton
                            color="info"
                            size="small"
                            onClick={() => void fetchDashboardData()}
                            disabled={loading}
                            startIcon={<IoRefresh size={16} />}
                        >
                            Refresh Data
                        </VuiButton>
                    </VuiBox>
                </Card>

                <VuiBox mb={3}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6} xl={3}>
                            <MiniStatisticsCard
                                title={{ text: "Total Users" }}
                                count={loading ? "..." : analytics?.totalUsers}
                                percentage={{ color: "success", text: "" }}
                                icon={{ component: "groups" }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6} xl={3}>
                            <MiniStatisticsCard
                                title={{ text: "Active Users (30 Days)" }}
                                count={loading ? "..." : analytics?.activeUsers}
                                percentage={{ color: "success", text: "" }}
                                icon={{ component: "person" }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6} xl={3}>
                            <MiniStatisticsCard
                                title={{ text: "Admin Accounts" }}
                                count={loading ? "..." : adminCount}
                                percentage={{ color: "info", text: "" }}
                                icon={{ component: "admin_panel_settings" }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6} xl={3}>
                            <MiniStatisticsCard
                                title={{ text: "Banned Accounts" }}
                                count={loading ? "..." : bannedCount}
                                percentage={{ color: "error", text: "" }}
                                icon={{ component: "block" }}
                            />
                        </Grid>
                    </Grid>
                </VuiBox>

                <Grid container spacing={3}>
                    <Grid item xs={12} lg={8}>
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
                                        Quick User Actions
                                    </VuiTypography>
                                    <VuiTypography variant="caption" color={darkMode ? "text" : "dark"}>
                                        Change roles, lock accounts, and reset passwords without leaving this page.
                                    </VuiTypography>
                                </VuiBox>
                                <Stack direction="row" spacing={1}>
                                    <Chip
                                        label={`Shown: ${recentUsers.length}`}
                                        size="small"
                                        sx={{
                                            color: "#b8d8ff",
                                            border: "1px solid rgba(0,117,255,0.35)",
                                            backgroundColor: "rgba(0,117,255,0.14)",
                                        }}
                                    />
                                    <Chip
                                        label={`New (7d): ${newUsers7Days}`}
                                        size="small"
                                        sx={{
                                            color: "#d8f8ff",
                                            border: "1px solid rgba(102,224,255,0.36)",
                                            backgroundColor: "rgba(102,224,255,0.12)",
                                        }}
                                    />
                                </Stack>
                            </VuiBox>

                            <VuiBox display="flex" gap={2} mb={2} flexWrap="wrap">
                                <TextField
                                    size="small"
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    placeholder="Search by username or email"
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
                                            WebkitTextFillColor: darkMode
                                                ? "#e8f2ff !important"
                                                : "#0f172a !important",
                                        },
                                        "& .MuiInputBase-input::placeholder": {
                                            color: darkMode
                                                ? "rgba(190, 212, 244, 0.72)"
                                                : "rgba(71, 85, 105, 0.72)",
                                            opacity: 1,
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
                                <Select
                                    size="small"
                                    value={roleFilter}
                                    onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
                                    inputProps={{ "aria-label": "Filter users by role" }}
                                    sx={{
                                        minWidth: 160,
                                        color: darkMode ? "#e8f2ff !important" : "#0f172a !important",
                                        backgroundColor: darkMode
                                            ? "rgba(7, 19, 48, 0.9) !important"
                                            : "#ffffff !important",
                                        borderRadius: "10px",
                                        "& .MuiInputBase-root": {
                                            backgroundColor: darkMode
                                                ? "rgba(7, 19, 48, 0.9) !important"
                                                : "#ffffff !important",
                                            color: darkMode ? "#e8f2ff !important" : "#0f172a !important",
                                        },
                                        "& .MuiSelect-select": {
                                            color: darkMode ? "#e8f2ff !important" : "#0f172a !important",
                                            WebkitTextFillColor: darkMode
                                                ? "#e8f2ff !important"
                                                : "#0f172a !important",
                                        },
                                        ".MuiOutlinedInput-notchedOutline": {
                                            borderColor: darkMode
                                                ? "rgba(132, 171, 235, 0.35) !important"
                                                : "rgba(148, 163, 184, 0.45) !important",
                                        },
                                        "&:hover .MuiOutlinedInput-notchedOutline": {
                                            borderColor: darkMode
                                                ? "rgba(132, 171, 235, 0.6) !important"
                                                : "rgba(100, 116, 139, 0.6) !important",
                                        },
                                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "rgba(0, 117, 255, 0.8) !important",
                                        },
                                        ".MuiSvgIcon-root": {
                                            color: darkMode ? "#a9c7ef !important" : "#334155 !important",
                                        },
                                    }}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                backgroundColor: darkMode ? "rgba(8, 20, 48, 0.98)" : "#ffffff",
                                                color: darkMode ? "#e8f2ff" : "#0f172a",
                                                border: darkMode
                                                    ? "1px solid rgba(132, 171, 235, 0.35)"
                                                    : "1px solid rgba(148, 163, 184, 0.4)",
                                                "& .MuiMenuItem-root": {
                                                    color: darkMode ? "#e8f2ff" : "#0f172a",
                                                },
                                                "& .MuiMenuItem-root.Mui-selected": {
                                                    backgroundColor: darkMode
                                                        ? "rgba(0, 117, 255, 0.2)"
                                                        : "rgba(0, 117, 255, 0.12)",
                                                },
                                                "& .MuiMenuItem-root:hover": {
                                                    backgroundColor: darkMode
                                                        ? "rgba(0, 117, 255, 0.14)"
                                                        : "rgba(0, 117, 255, 0.08)",
                                                },
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="all">All Roles</MenuItem>
                                    <MenuItem value="admin">Admin</MenuItem>
                                    <MenuItem value="user">User</MenuItem>
                                </Select>
                            </VuiBox>

                            {actionFeedback && (
                                <Alert
                                    severity={actionFeedback.includes("failed") ? "error" : "success"}
                                    sx={{ mb: 2 }}
                                >
                                    {actionFeedback}
                                </Alert>
                            )}

                            <TableContainer
                                sx={{
                                    p: 1.5,
                                    borderRadius: "12px",
                                    border: darkMode
                                        ? "1px solid rgba(116, 153, 224, 0.25)"
                                        : "1px solid rgba(148, 163, 184, 0.34)",
                                    background: darkMode ? "rgba(5, 14, 37, 0.78)" : "rgba(255, 255, 255, 0.96)",
                                    overflow: "hidden",
                                    "& .MuiTableHead-root": {
                                        display: "table-header-group",
                                    },
                                    "& .MuiTableHead-root .MuiTableRow-root": {
                                        display: "table-row",
                                    },
                                    "& .MuiTableHead-root .MuiTableCell-root": {
                                        display: "table-cell",
                                    },
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
                                        <TableRow>
                                            <TableCell scope="col" sx={{ width: "22%", textAlign: "left", pl: 1 }}>User</TableCell>
                                            <TableCell scope="col" sx={{ width: "34%", textAlign: "left" }}>Email</TableCell>
                                            <TableCell scope="col" sx={{ width: "18%", textAlign: "left" }}>Role</TableCell>
                                            <TableCell scope="col" sx={{ width: "14%", textAlign: "left" }}>Status</TableCell>
                                            <TableCell scope="col" sx={{ width: "12%", textAlign: "right" }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {recentUsers.map((user, index) => {
                                            const rowUserId = getUserId(user);
                                            const key = rowUserId || `${user.username}-${index}`;

                                            return (
                                            <TableRow key={key}>
                                                <TableCell sx={{ width: "22%", pl: 1 }}>
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
                                                        {user.username}
                                                    </VuiTypography>
                                                </TableCell>
                                                <TableCell sx={{ width: "34%" }}>
                                                    <VuiTypography
                                                        variant="caption"
                                                        color={darkMode ? "text" : "dark"}
                                                        sx={{
                                                            display: "block",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            whiteSpace: "nowrap",
                                                        }}
                                                    >
                                                        {user.email}
                                                    </VuiTypography>
                                                </TableCell>
                                                <TableCell sx={{ width: "18%" }}>
                                                    <Select
                                                        size="small"
                                                        value={user.role}
                                                        disabled={rowUserId ? actionUserId === rowUserId : true}
                                                        onChange={(event) =>
                                                            void handleRoleChange(
                                                                user,
                                                                event.target.value as "user" | "admin",
                                                            )
                                                        }
                                                        inputProps={{ "aria-label": `Change role for ${user.username}` }}
                                                        sx={{
                                                            width: "100%",
                                                            color: darkMode ? "#e8f2ff !important" : "#0f172a !important",
                                                            backgroundColor: darkMode
                                                                ? "rgba(7, 19, 48, 0.9) !important"
                                                                : "#ffffff !important",
                                                            borderRadius: "9px",
                                                            "& .MuiInputBase-root": {
                                                                backgroundColor: darkMode
                                                                    ? "rgba(7, 19, 48, 0.9) !important"
                                                                    : "#ffffff !important",
                                                                color: darkMode
                                                                    ? "#e8f2ff !important"
                                                                    : "#0f172a !important",
                                                            },
                                                            "& .MuiSelect-select": {
                                                                color: darkMode
                                                                    ? "#e8f2ff !important"
                                                                    : "#0f172a !important",
                                                                WebkitTextFillColor: darkMode
                                                                    ? "#e8f2ff !important"
                                                                    : "#0f172a !important",
                                                            },
                                                            ".MuiOutlinedInput-notchedOutline": {
                                                                borderColor: darkMode
                                                                    ? "rgba(132, 171, 235, 0.35) !important"
                                                                    : "rgba(15, 23, 42, 0.2) !important",
                                                            },
                                                            ".MuiSvgIcon-root": {
                                                                color: darkMode
                                                                    ? "#a9c7ef !important"
                                                                    : "#334155 !important",
                                                            },
                                                        }}
                                                        MenuProps={{
                                                            PaperProps: {
                                                                sx: {
                                                                    backgroundColor: darkMode
                                                                        ? "rgba(8, 20, 48, 0.98)"
                                                                        : "#ffffff",
                                                                    color: darkMode ? "#e8f2ff" : "#0f172a",
                                                                    border: darkMode
                                                                        ? "1px solid rgba(132, 171, 235, 0.35)"
                                                                        : "1px solid rgba(15, 23, 42, 0.2)",
                                                                    "& .MuiMenuItem-root": {
                                                                        color: darkMode ? "#e8f2ff" : "#0f172a",
                                                                    },
                                                                    "& .MuiMenuItem-root.Mui-selected": {
                                                                        backgroundColor: darkMode
                                                                            ? "rgba(0, 117, 255, 0.2)"
                                                                            : "rgba(0, 117, 255, 0.12)",
                                                                    },
                                                                    "& .MuiMenuItem-root:hover": {
                                                                        backgroundColor: darkMode
                                                                            ? "rgba(0, 117, 255, 0.14)"
                                                                            : "rgba(0, 117, 255, 0.08)",
                                                                    },
                                                                },
                                                            },
                                                        }}
                                                    >
                                                        <MenuItem value="user">User</MenuItem>
                                                        <MenuItem value="admin">Admin</MenuItem>
                                                    </Select>
                                                </TableCell>
                                                <TableCell sx={{ width: "14%" }}>
                                                    <Chip
                                                        label={user.isBanned ? "Banned" : "Active"}
                                                        size="small"
                                                        sx={{
                                                            color: darkMode
                                                                ? user.isBanned
                                                                    ? "#ffd7d7"
                                                                    : "#d7ffe0"
                                                                : user.isBanned
                                                                    ? "#b91c1c"
                                                                    : "#166534",
                                                            border: user.isBanned
                                                                ? "1px solid rgba(255,80,80,0.35)"
                                                                : "1px solid rgba(80,255,150,0.35)",
                                                            backgroundColor: user.isBanned
                                                                ? darkMode
                                                                    ? "rgba(255,80,80,0.16)"
                                                                    : "rgba(239,68,68,0.14)"
                                                                : darkMode
                                                                    ? "rgba(80,255,150,0.12)"
                                                                    : "rgba(34,197,94,0.14)",
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right" sx={{ width: "12%" }}>
                                                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                        <Tooltip title="Reset password">
                                                            <span>
                                                                <IconButton
                                                                    size="small"
                                                                    disabled={rowUserId ? actionUserId === rowUserId : true}
                                                                    onClick={() => void handleResetPassword(user)}
                                                                    aria-label={`Reset password for ${user.username}`}
                                                                >
                                                                    <IoKey size={16} color="#9ec5ff" />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                        <Tooltip title={user.isBanned ? "Unban user" : "Ban user"}>
                                                            <span>
                                                                <IconButton
                                                                    size="small"
                                                                    disabled={rowUserId ? actionUserId === rowUserId : true}
                                                                    onClick={() => void handleToggleBan(user)}
                                                                    aria-label={user.isBanned ? `Unban ${user.username}` : `Ban ${user.username}`}
                                                                >
                                                                    <IoBan
                                                                        size={16}
                                                                        color={user.isBanned ? "#83f7b5" : "#ff8d8d"}
                                                                    />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                            );
                                        })}
                                        {!loading && recentUsers.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                                    <VuiTypography variant="button" color="text">
                                                        No users match your filters.
                                                    </VuiTypography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Card>
                    </Grid>

                    <Grid item xs={12} lg={4}>
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
                            <VuiBox display="flex" alignItems="center" gap={1} mb={1}>
                                <IoSparkles color="#8bd8ff" size={16} />
                                <VuiTypography variant="lg" color={darkMode ? "white" : "dark"} fontWeight="bold">
                                    Suggested Next Admin Tools
                                </VuiTypography>
                            </VuiBox>
                            <VuiTypography variant="caption" color={darkMode ? "text" : "dark"} sx={{ display: "block", mb: 2 }}>
                                Ideas you can add next for stronger operations and security.
                            </VuiTypography>
                            <Divider sx={{ mb: 2, borderColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(148,163,184,0.35)" }} />

                            <Stack spacing={1.6}>
                                <Card sx={{ p: 1.5, background: darkMode ? "rgba(16, 25, 54, 0.75)" : "rgba(241, 245, 249, 0.95)" }}>
                                    <VuiTypography variant="button" color={darkMode ? "white" : "dark"} fontWeight="bold">
                                        Audit Log Timeline
                                    </VuiTypography>
                                    <VuiTypography variant="caption" color={darkMode ? "text" : "dark"} sx={{ display: "block", mt: 0.5 }}>
                                        Track who changed roles, banned users, and reset credentials.
                                    </VuiTypography>
                                </Card>
                                <Card sx={{ p: 1.5, background: darkMode ? "rgba(16, 25, 54, 0.75)" : "rgba(241, 245, 249, 0.95)" }}>
                                    <VuiTypography variant="button" color={darkMode ? "white" : "dark"} fontWeight="bold">
                                        Bulk User Actions
                                    </VuiTypography>
                                    <VuiTypography variant="caption" color={darkMode ? "text" : "dark"} sx={{ display: "block", mt: 0.5 }}>
                                        Select many users and apply role or status changes in one operation.
                                    </VuiTypography>
                                </Card>
                                <Card sx={{ p: 1.5, background: darkMode ? "rgba(16, 25, 54, 0.75)" : "rgba(241, 245, 249, 0.95)" }}>
                                    <VuiTypography variant="button" color={darkMode ? "white" : "dark"} fontWeight="bold">
                                        Risk Flags & Alerts
                                    </VuiTypography>
                                    <VuiTypography variant="caption" color={darkMode ? "text" : "dark"} sx={{ display: "block", mt: 0.5 }}>
                                        Alert on unusual admin changes, repeated failed logins, and ban spikes.
                                    </VuiTypography>
                                </Card>
                            </Stack>
                        </Card>

                        <Card
                            sx={{
                                p: 3,
                                border: darkMode
                                    ? "1px solid rgba(255,255,255,0.08)"
                                    : "1px solid rgba(148, 163, 184, 0.28)",
                                mt: 2,
                                background: darkMode
                                    ? "linear-gradient(135deg, rgba(10, 18, 48, 0.95), rgba(7, 14, 39, 0.92))"
                                    : "linear-gradient(135deg, rgba(255, 255, 255, 0.99), rgba(241, 245, 249, 0.96))",
                            }}
                        >
                            <VuiTypography variant="lg" color={darkMode ? "white" : "dark"} fontWeight="bold" mb={1}>
                                Challenge Tickets
                            </VuiTypography>
                            <VuiTypography variant="caption" color={darkMode ? "text" : "dark"} sx={{ display: "block", mb: 2 }}>
                                Review tickets by status and see which user opened each one.
                            </VuiTypography>

                            <VuiBox display="flex" alignItems="center" gap={1} mb={2} flexWrap="wrap">
                                <Select
                                    size="small"
                                    value={ticketStatusFilter}
                                    onChange={(event) => setTicketStatusFilter(event.target.value as TicketStatusFilter)}
                                    inputProps={{ "aria-label": "Filter tickets by status" }}
                                    sx={{
                                        minWidth: 170,
                                        color: darkMode ? "#e8f2ff !important" : "#0f172a !important",
                                        backgroundColor: darkMode
                                            ? "rgba(7, 19, 48, 0.9) !important"
                                            : "#ffffff !important",
                                        borderRadius: "10px",
                                        "& .MuiSelect-select": {
                                            color: darkMode ? "#e8f2ff !important" : "#0f172a !important",
                                            WebkitTextFillColor: darkMode
                                                ? "#e8f2ff !important"
                                                : "#0f172a !important",
                                        },
                                        ".MuiOutlinedInput-notchedOutline": {
                                            borderColor: darkMode
                                                ? "rgba(132, 171, 235, 0.35) !important"
                                                : "rgba(148, 163, 184, 0.45) !important",
                                        },
                                        ".MuiSvgIcon-root": {
                                            color: darkMode ? "#a9c7ef !important" : "#334155 !important",
                                        },
                                    }}
                                >
                                    <MenuItem value="all">All statuses</MenuItem>
                                    <MenuItem value="open">Open</MenuItem>
                                    <MenuItem value="in_progress">In progress</MenuItem>
                                    <MenuItem value="closed">Closed</MenuItem>
                                </Select>
                                <Chip label={`All: ${ticketCounts.all}`} size="small" sx={{ color: "#d6eaff" }} />
                                <Chip label={`Open: ${ticketCounts.open}`} size="small" sx={{ color: "#d6eaff" }} />
                                <Chip
                                    label={`In progress: ${ticketCounts.in_progress}`}
                                    size="small"
                                    sx={{ color: "#d6eaff" }}
                                />
                                <Chip label={`Closed: ${ticketCounts.closed}`} size="small" sx={{ color: "#d6eaff" }} />
                            </VuiBox>

                            <Stack spacing={1.2}>
                                <VuiBox mb={0.4}>
                                    <VuiTypography variant="button" color="white" fontWeight="bold" sx={{ display: "block", mb: 1 }}>
                                        Challenges By Active Tickets
                                    </VuiTypography>

                                    {challengeTicketRanking.length === 0 ? (
                                        <VuiTypography variant="caption" color="text" sx={{ display: "block", mb: 1.2 }}>
                                            No active tickets right now.
                                        </VuiTypography>
                                    ) : (
                                        <Stack spacing={0.9} sx={{ mb: 1.3 }}>
                                            {challengeTicketRanking.map((item) => (
                                                <VuiBox
                                                    key={`${item.challengeId}-${item.challengeTitle}`}
                                                    display="flex"
                                                    justifyContent="space-between"
                                                    alignItems="center"
                                                    gap={1}
                                                >
                                                    <VuiTypography
                                                        variant="caption"
                                                        color="text"
                                                        sx={{
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            whiteSpace: "nowrap",
                                                            maxWidth: "68%",
                                                        }}
                                                        title={item.challengeTitle}
                                                    >
                                                        {item.challengeTitle}
                                                    </VuiTypography>
                                                    <Stack direction="row" spacing={0.6}>
                                                        <Chip size="small" label={`Total ${item.total}`} sx={{ color: "#d6eaff" }} />
                                                        <Chip size="small" label={`Open ${item.open}`} sx={{ color: "#d6eaff" }} />
                                                        <Chip
                                                            size="small"
                                                            label={`In Progress ${item.inProgress}`}
                                                            sx={{ color: "#d6eaff" }}
                                                        />
                                                    </Stack>
                                                </VuiBox>
                                            ))}
                                        </Stack>
                                    )}

                                    <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 1.2 }} />
                                </VuiBox>

                                {tickets.length === 0 && (
                                    <VuiTypography variant="caption" color="text">
                                        No tickets for this filter.
                                    </VuiTypography>
                                )}

                                {tickets.slice(0, 8).map((ticket) => (
                                    <Card
                                        key={ticket._id}
                                        sx={{ p: 1.3, background: darkMode ? "rgba(16, 25, 54, 0.75)" : "rgba(241, 245, 249, 0.95)" }}
                                    >
                                        <VuiTypography variant="button" color={darkMode ? "white" : "dark"} fontWeight="bold">
                                            {ticket.subject}
                                        </VuiTypography>
                                        <VuiTypography variant="caption" color={darkMode ? "text" : "dark"} sx={{ display: "block", mt: 0.4 }}>
                                            {ticket.challengeTitle} · by {getTicketReporterName(ticket)}
                                        </VuiTypography>
                                        <VuiBox mt={0.7} mb={0.7}>
                                            <Chip
                                                size="small"
                                                label={ticket.status === "in_progress" ? "In progress" : ticket.status}
                                                sx={{
                                                    color: "#e8f2ff",
                                                    backgroundColor:
                                                        ticket.status === "open"
                                                            ? "rgba(0, 117, 255, 0.22)"
                                                            : ticket.status === "in_progress"
                                                              ? "rgba(255, 179, 0, 0.2)"
                                                              : "rgba(80, 255, 150, 0.18)",
                                                }}
                                            />
                                        </VuiBox>
                                        <VuiTypography
                                            variant="caption"
                                            color={darkMode ? "text" : "dark"}
                                            sx={{
                                                display: "block",
                                                mt: 0.8,
                                                mb: 1,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {formatUseCases(ticket)} · {ticket.description}
                                        </VuiTypography>
                                        <FormControl fullWidth>
                                            <Stack direction="row" spacing={1}>
                                                <VuiButton
                                                    size="small"
                                                    color="info"
                                                    onClick={() =>
                                                        navigate(`/challenges/${String(ticket.challengeId || "")}`)
                                                    }
                                                    disabled={!ticket.challengeId}
                                                    sx={{
                                                        background: darkMode
                                                            ? "linear-gradient(135deg, rgba(0,117,255,0.88) 0%, rgba(0,92,214,0.88) 100%)"
                                                            : "linear-gradient(135deg, rgba(14,165,233,0.96) 0%, rgba(37,99,235,0.96) 100%)",
                                                        border: darkMode
                                                            ? "1px solid rgba(120, 177, 255, 0.45)"
                                                            : "1px solid rgba(37, 99, 235, 0.36)",
                                                        color: "#eaf4ff",
                                                    }}
                                                >
                                                    Open Challenge
                                                </VuiButton>
                                                {ticket.status !== "in_progress" && (
                                                    <VuiButton
                                                        size="small"
                                                        color="info"
                                                        onClick={() => void handleTreatTicket(ticket, "in_progress")}
                                                        sx={{
                                                            background:
                                                                "linear-gradient(135deg, rgba(30,96,210,0.82) 0%, rgba(15,72,179,0.82) 100%)",
                                                            border: "1px solid rgba(120, 177, 255, 0.35)",
                                                            color: "#deecff",
                                                        }}
                                                    >
                                                        Mark In Progress
                                                    </VuiButton>
                                                )}
                                                {ticket.status !== "closed" && (
                                                    <VuiButton
                                                        size="small"
                                                        color="info"
                                                        onClick={() => void handleTreatTicket(ticket, "closed")}
                                                        sx={{
                                                            background:
                                                                "linear-gradient(135deg, rgba(26,84,193,0.78) 0%, rgba(13,62,161,0.78) 100%)",
                                                            border: "1px solid rgba(120, 177, 255, 0.32)",
                                                            color: "#d7e9ff",
                                                        }}
                                                    >
                                                        Close
                                                    </VuiButton>
                                                )}
                                                {ticket.status === "closed" && (
                                                    <VuiButton
                                                        size="small"
                                                        color="info"
                                                        onClick={() => void handleTreatTicket(ticket, "open")}
                                                        sx={{
                                                            background:
                                                                "linear-gradient(135deg, rgba(30,96,210,0.82) 0%, rgba(15,72,179,0.82) 100%)",
                                                            border: "1px solid rgba(120, 177, 255, 0.35)",
                                                            color: "#deecff",
                                                        }}
                                                    >
                                                        Reopen
                                                    </VuiButton>
                                                )}
                                            </Stack>
                                        </FormControl>
                                    </Card>
                                ))}
                            </Stack>
                        </Card>
                    </Grid>
                </Grid>
            </VuiBox>
        </DashboardLayout>
    );
}
