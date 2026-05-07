import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/index.js";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout/index.jsx";
import DashboardNavbar from "examples/Navbars/DashboardNavbar/index.jsx";
import { useVisionUIController } from "context/index.jsx";
import VuiBox from "components/VuiBox/index.jsx";
import VuiTypography from "components/VuiTypography/index.jsx";
import VuiButton from "components/VuiButton/index.jsx";
import VuiAvatar from "components/VuiAvatar/index.jsx";
import {
    Card,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    MenuItem,
    Select,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Tooltip,
    Box,
} from "@mui/material";
import { adminService } from "../../services/admin.service.js";
import { IoRefresh, IoTrash, IoKey, IoShieldCheckmark, IoBan, IoWarning } from "react-icons/io5";

export default function AdminUsers() {
    const [controller] = useVisionUIController();
    const { darkMode } = controller;
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const currentUser = useSelector((state: RootState) => state.user.currentUser);

    const [resetModalOpen, setResetModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [selectedUsername, setSelectedUsername] = useState<string>("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordResult, setNewPasswordResult] = useState("");

    const [roleChangeModalOpen, setRoleChangeModalOpen] = useState(false);
    const [pendingRoleChange, setPendingRoleChange] = useState<{
        userId: string;
        newRole: string;
        username: string;
    } | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await adminService.getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    const performRoleChange = async (userId: string, newRole: string) => {
        try {
            await adminService.updateRole(userId, newRole);
            setUsers(users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));

            if (currentUser?.id === userId && newRole === "user") {
                alert("You have been demoted to a regular user. You will lose access to admin features.");
                globalThis.location.href = "/dashboard";
            }
        } catch (error) {
            console.error("Failed to update user role", error);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string, username: string) => {
        const isChangingOwnRole = currentUser?.id === userId;

        if (isChangingOwnRole && newRole === "user") {
            setPendingRoleChange({ userId, newRole, username });
            setRoleChangeModalOpen(true);
            return;
        }

        await performRoleChange(userId, newRole);
    };

    const confirmRoleChange = async () => {
        if (!pendingRoleChange) return;

        await performRoleChange(pendingRoleChange.userId, pendingRoleChange.newRole);
        setRoleChangeModalOpen(false);
        setPendingRoleChange(null);
    };

    const cancelRoleChange = () => {
        setRoleChangeModalOpen(false);
        setPendingRoleChange(null);
    };

    const handleStatusChange = async (userId: string, isBanned: boolean) => {
        try {
            await adminService.updateStatus(userId, isBanned);
            setUsers(users.map((u) => (u._id === userId ? { ...u, isBanned } : u)));
        } catch (error) {
            console.error("Failed to update user status", error);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!globalThis.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            return;
        }

        try {
            await adminService.deleteUser(userId);
            setUsers(users.filter((u) => u._id !== userId));
        } catch (error) {
            console.error("Failed to delete user", error);
        }
    };

    const openResetModal = (userId: string, username: string) => {
        setSelectedUserId(userId);
        setSelectedUsername(username);
        setNewPasswordResult("");
        setNewPassword("");
        setResetModalOpen(true);
    };

    const handleResetPassword = async () => {
        if (!selectedUserId) return;

        try {
            const res = await adminService.resetPassword(selectedUserId, newPassword || undefined);
            setNewPasswordResult(res.tempPassword);
        } catch (error) {
            console.error("Failed to reset password", error);
        }
    };

    const getInitials = (username: string) => username.substring(0, 2).toUpperCase();

    const renderUsersTableRows = () => {
        if (loading) {
            return (
                <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                        <VuiBox display="flex" flexDirection="column" alignItems="center" gap={2}>
                            <Box
                                sx={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    border: "3px solid rgba(0, 117, 255, 0.3)",
                                    borderTopColor: "#0075FF",
                                    animation: "spin 1s linear infinite",
                                    "@keyframes spin": {
                                        "0%": { transform: "rotate(0deg)" },
                                        "100%": { transform: "rotate(360deg)" },
                                    },
                                }}
                            />
                            <VuiTypography variant="button" color="text">
                                Loading users...
                            </VuiTypography>
                        </VuiBox>
                    </TableCell>
                </TableRow>
            );
        }

        if (users.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                        <VuiBox display="flex" flexDirection="column" alignItems="center" gap={1}>
                            <VuiTypography variant="h6" color="text" opacity={0.5}>
                                No users found
                            </VuiTypography>
                            <VuiTypography variant="caption" color="text" opacity={0.4}>
                                There are no users in the system yet
                            </VuiTypography>
                        </VuiBox>
                    </TableCell>
                </TableRow>
            );
        }

        return users.map((user) => {
            const isAdminRole = user.role === "admin";
            const roleTextColor = darkMode
                ? isAdminRole
                    ? "#7ec0ff"
                    : "rgba(236, 244, 255, 0.92)"
                : isAdminRole
                    ? "#1d4ed8"
                    : "#0f172a";
            const roleBg = darkMode
                ? isAdminRole
                    ? "rgba(0, 117, 255, 0.18)"
                    : "rgba(9, 26, 68, 0.86)"
                : isAdminRole
                    ? "rgba(59, 130, 246, 0.12)"
                    : "rgba(241, 245, 249, 0.95)";
            const roleBorder = darkMode
                ? isAdminRole
                    ? "1px solid rgba(0, 117, 255, 0.45)"
                    : "1px solid rgba(123, 155, 218, 0.34)"
                : isAdminRole
                    ? "1px solid rgba(59, 130, 246, 0.36)"
                    : "1px solid rgba(148, 163, 184, 0.45)";
            const roleHoverBg = darkMode
                ? isAdminRole
                    ? "rgba(0, 117, 255, 0.24)"
                    : "rgba(15, 36, 86, 0.95)"
                : isAdminRole
                    ? "rgba(59, 130, 246, 0.18)"
                    : "rgba(226, 232, 240, 0.95)";
            const roleHoverBorder = darkMode
                ? isAdminRole
                    ? "rgba(0, 117, 255, 0.56)"
                    : "rgba(164, 193, 246, 0.5)"
                : isAdminRole
                    ? "rgba(37, 99, 235, 0.46)"
                    : "rgba(100, 116, 139, 0.55)";

            return (
                <TableRow key={user._id}>
                    <TableCell sx={{ pl: 4, width: "37%" }}>
                        <VuiBox display="flex" alignItems="center" gap={2}>
                            <VuiAvatar
                                src={user.profile?.avatar || user.providerAvatar}
                                alt={user.username}
                                size="md"
                                sx={{
                                    background:
                                        darkMode
                                            ? "linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.49) 76.65%)"
                                            : "linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(14, 165, 233, 0.9))",
                                    border: darkMode
                                        ? "2px solid rgba(255, 255, 255, 0.1)"
                                        : "2px solid rgba(255, 255, 255, 0.8)",
                                    fontSize: "0.875rem",
                                    fontWeight: "bold",
                                }}
                            >
                                {getInitials(user.username)}
                            </VuiAvatar>
                            <VuiBox>
                                <VuiBox display="flex" alignItems="center" gap={1}>
                                    <VuiTypography variant="button" color={darkMode ? "white" : "dark"} fontWeight="bold">
                                        {user.username}
                                    </VuiTypography>
                                    {currentUser?.id === user._id && (
                                        <Chip
                                            label="You"
                                            size="small"
                                            sx={{
                                                height: "20px",
                                                fontSize: "0.65rem",
                                                fontWeight: "bold",
                                                backgroundColor: "rgba(0, 117, 255, 0.15)",
                                                color: "#0075FF",
                                                border: "1px solid rgba(0, 117, 255, 0.3)",
                                            }}
                                        />
                                    )}
                                </VuiBox>
                                <VuiTypography
                                    variant="caption"
                                    color={darkMode ? "text" : "dark"}
                                    display="block"
                                    sx={{ opacity: 0.7, overflow: "hidden", textOverflow: "ellipsis" }}
                                >
                                    {user.email}
                                </VuiTypography>
                            </VuiBox>
                        </VuiBox>
                    </TableCell>

                    <TableCell align="center" sx={{ width: "18%" }}>
                        <Select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value, user.username)}
                            size="small"
                            variant="standard"
                            disableUnderline
                            inputProps={{ "aria-label": `Change role for ${user.username}` }}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        mt: 0.5,
                                        background: darkMode
                                            ? "linear-gradient(145deg, rgba(8, 19, 54, 0.98), rgba(10, 23, 63, 0.98))"
                                            : "#ffffff",
                                        border: darkMode
                                            ? "1px solid rgba(111, 156, 237, 0.25)"
                                            : "1px solid rgba(148, 163, 184, 0.4)",
                                        borderRadius: "12px",
                                        boxShadow: darkMode
                                            ? "0 12px 30px rgba(0, 0, 0, 0.4)"
                                            : "0 8px 22px rgba(15, 23, 42, 0.12)",
                                        "& .MuiMenuItem-root": {
                                            color: darkMode ? "rgba(230, 242, 255, 0.94)" : "#0f172a",
                                            fontSize: "0.82rem",
                                            "&:hover": {
                                                backgroundColor: darkMode
                                                    ? "rgba(0, 117, 255, 0.2)"
                                                    : "rgba(14, 165, 233, 0.12)",
                                            },
                                            "&.Mui-selected": {
                                                backgroundColor: darkMode
                                                    ? "rgba(0, 117, 255, 0.28)"
                                                    : "rgba(37, 99, 235, 0.14)",
                                            },
                                        },
                                    },
                                },
                            }}
                            sx={{
                                minWidth: "120px",
                                height: "36px",
                                borderRadius: "10px",
                                fontWeight: "bold",
                                fontSize: "0.8rem",
                                color: roleTextColor,
                                border: roleBorder,
                                backgroundColor: `${roleBg} !important`,
                                "& .MuiSelect-select": {
                                    display: "flex",
                                    alignItems: "center",
                                    py: "7px",
                                    px: "12px",
                                    pr: "28px !important",
                                    color: `${roleTextColor} !important`,
                                },
                                "& .MuiSelect-icon": {
                                    color: darkMode
                                        ? isAdminRole
                                            ? "#58a9ff"
                                            : "rgba(226, 239, 255, 0.95)"
                                        : "#334155",
                                    right: "8px",
                                },
                                "& .MuiInputBase-input": {
                                    backgroundColor: "transparent !important",
                                    WebkitTextFillColor: `${roleTextColor} !important`,
                                },
                                "&:hover": {
                                    backgroundColor: `${roleHoverBg} !important`,
                                    borderColor: roleHoverBorder,
                                },
                            }}
                        >
                            <MenuItem value="user">User</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                    </TableCell>

                    <TableCell align="center" sx={{ width: "14%" }}>
                        <Chip
                            label={user.isBanned ? "Banned" : "Active"}
                            icon={user.isBanned ? <IoBan size="14px" /> : <IoShieldCheckmark size="14px" />}
                            color={user.isBanned ? "error" : "success"}
                            size="small"
                            onClick={() => handleStatusChange(user._id, !user.isBanned)}
                            sx={{
                                cursor: "pointer",
                                fontWeight: "bold",
                                fontSize: "0.7rem",
                                px: 1.5,
                                height: "30px",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                    transform: "scale(1.05)",
                                },
                                "& .MuiChip-icon": {
                                    fontSize: "14px",
                                    ml: 0.5,
                                },
                                // Enhanced contrast for AAA compliance
                                "&.MuiChip-colorSuccess": {
                                    backgroundColor: darkMode ? "rgba(16, 185, 129, 0.25)" : "rgba(22, 163, 74, 0.18)",
                                    color: darkMode ? "#4ade80" : "#15803d",
                                    border: darkMode ? "1px solid rgba(74, 222, 128, 0.4)" : "1px solid rgba(22, 163, 74, 0.4)",
                                },
                            }}
                        />
                    </TableCell>

                    <TableCell align="center" sx={{ width: "15%" }}>
                        <VuiTypography variant="button" color={darkMode ? "text" : "dark"} fontWeight="medium" fontSize="0.75rem">
                            {new Date(user.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </VuiTypography>
                    </TableCell>

                    <TableCell align="right" sx={{ pr: 3, width: "16%" }}>
                        <VuiBox display="flex" justifyContent="flex-end" gap={1} flexWrap="wrap">
                            <Tooltip title="Reset Password" placement="top" arrow>
                                <IconButton
                                    onClick={() => openResetModal(user._id, user.username)}
                                    aria-label={`Reset password for ${user.username}`}
                                    sx={{
                                        color: "#0075FF",
                                        backgroundColor: "rgba(0, 117, 255, 0.12)",
                                        width: "38px",
                                        height: "38px",
                                        border: "1px solid rgba(0, 117, 255, 0.2)",
                                        transition: "all 0.2s ease",
                                        "&:hover": {
                                            backgroundColor: "rgba(0, 117, 255, 0.25)",
                                            transform: "translateY(-2px)",
                                            boxShadow: "0 4px 12px rgba(0, 117, 255, 0.3)",
                                        },
                                    }}
                                >
                                    <IoKey size="17px" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete User" placement="top" arrow>
                                <IconButton
                                    onClick={() => handleDelete(user._id)}
                                    aria-label={`Delete user ${user.username}`}
                                    sx={{
                                        color: "#E31A1A",
                                        backgroundColor: "rgba(227, 26, 26, 0.12)",
                                        width: "38px",
                                        height: "38px",
                                        border: "1px solid rgba(227, 26, 26, 0.2)",
                                        transition: "all 0.2s ease",
                                        "&:hover": {
                                            backgroundColor: "rgba(227, 26, 26, 0.25)",
                                            transform: "translateY(-2px)",
                                            boxShadow: "0 4px 12px rgba(227, 26, 26, 0.3)",
                                        },
                                    }}
                                >
                                    <IoTrash size="17px" />
                                </IconButton>
                            </Tooltip>
                        </VuiBox>
                    </TableCell>
                </TableRow>
            );
        });
    };

    return (
        <DashboardLayout>
            <DashboardNavbar />
            <VuiBox py={3}>
                <VuiBox mb={3}>
                    <VuiBox
                        display="flex"
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", md: "center" }}
                        flexDirection={{ xs: "column", md: "row" }}
                        gap={2}
                        mb={2}
                    >
                        <VuiBox>
                            <VuiTypography variant="h1" color={darkMode ? "white" : "dark"} fontWeight="bold" mb={1} sx={{ fontSize: "1.875rem" }}>
                                User Management
                            </VuiTypography>
                            <VuiTypography variant="button" color={darkMode ? "text" : "dark"} fontWeight="regular">
                                Manage user accounts, roles, and permissions
                            </VuiTypography>
                        </VuiBox>
                        <VuiButton
                            variant="contained"
                            color="info"
                            onClick={fetchUsers}
                            startIcon={<IoRefresh />}
                            sx={{ minWidth: "120px" }}
                        >
                            Refresh
                        </VuiButton>
                    </VuiBox>
                </VuiBox>

                <Card
                    sx={{
                        overflow: "visible",
                        background: darkMode
                            ? "linear-gradient(145deg, rgba(7, 14, 48, 0.97) 0%, rgba(8, 16, 46, 0.94) 65%, rgba(5, 12, 38, 0.97) 100%)"
                            : "linear-gradient(135deg, rgba(255, 255, 255, 0.99), rgba(241, 245, 249, 0.96))",
                        border: darkMode
                            ? "1px solid rgba(108, 141, 216, 0.18)"
                            : "1px solid rgba(148, 163, 184, 0.28)",
                        borderRadius: "24px",
                        boxShadow: darkMode
                            ? "0px 16px 42px rgba(0, 0, 0, 0.42)"
                            : "0px 14px 30px rgba(15, 23, 42, 0.1)",
                    }}
                >
                    <VuiBox p={3}>
                        <VuiTypography variant="lg" color={darkMode ? "white" : "dark"} fontWeight="bold" mb={3}>
                            All Users ({users.length})
                        </VuiTypography>

                        <VuiBox
                            sx={{
                                border: darkMode
                                    ? "1px solid rgba(108, 141, 216, 0.2)"
                                    : "1px solid rgba(148, 163, 184, 0.28)",
                                borderRadius: "18px",
                                overflowX: "auto",
                                background: darkMode
                                    ? "linear-gradient(140deg, rgba(8, 18, 56, 0.94), rgba(9, 19, 52, 0.86))"
                                    : "linear-gradient(140deg, rgba(255, 255, 255, 0.97), rgba(248, 250, 252, 0.95))",
                                "& .MuiTable-root": {
                                    borderCollapse: "separate",
                                    borderSpacing: "0",
                                    tableLayout: "fixed",
                                    width: "100%",
                                    minWidth: "900px",
                                },
                                "& .MuiTableHead-root .MuiTableRow-root": {
                                    background: darkMode
                                        ? "linear-gradient(135deg, rgba(27, 46, 92, 0.94), rgba(19, 37, 77, 0.88))"
                                        : "linear-gradient(135deg, rgba(226, 232, 240, 0.95), rgba(241, 245, 249, 0.95))",
                                },
                                "& .MuiTableHead-root .MuiTableCell-root": {
                                    py: 2,
                                    borderBottom: darkMode
                                        ? "1px solid rgba(102, 164, 255, 0.25)"
                                        : "1px solid rgba(148, 163, 184, 0.35)",
                                    color: darkMode ? "rgba(213, 230, 255, 0.92)" : "#334155",
                                },
                                "& .MuiTableBody-root .MuiTableRow-root": {
                                    transition: "all 0.2s ease",
                                    backgroundColor: darkMode
                                        ? "rgba(6, 14, 42, 0.45)"
                                        : "rgba(255, 255, 255, 0.92)",
                                    "&:hover": {
                                        backgroundColor: darkMode
                                            ? "rgba(25, 69, 156, 0.2)"
                                            : "rgba(219, 234, 254, 0.65)",
                                    },
                                },
                                "& .MuiTableBody-root .MuiTableRow-root:not(:last-child) td": {
                                    borderBottom: darkMode
                                        ? "1px solid rgba(150, 180, 235, 0.12)"
                                        : "1px solid rgba(203, 213, 225, 0.55)",
                                },
                                "& .MuiTableCell-root": {
                                    py: 2.5,
                                    px: 2,
                                    backgroundColor: "transparent !important",
                                    color: darkMode ? "rgba(232, 241, 255, 0.92)" : "#0f172a",
                                },
                                "& .MuiTableHead-root .MuiTableCell-root:first-of-type, & .MuiTableBody-root .MuiTableCell-root:first-of-type": {
                                    paddingLeft: "32px !important",
                                },
                            }}
                        >
                            <TableContainer
                                sx={{
                                    background: "transparent",
                                    boxShadow: "none",
                                    borderRadius: 0,
                                    "& .MuiTableHead-root": {
                                        display: "table-header-group",
                                        padding: 0,
                                        borderRadius: 0,
                                    },
                                    "& .MuiTableHead-root .MuiTableRow-root": {
                                        display: "table-row",
                                    },
                                    "& .MuiTableHead-root .MuiTableCell-root": {
                                        display: "table-cell",
                                    },
                                }}
                            >
                                <Table>
                                    <TableHead sx={{ display: "table-header-group", p: 0, borderRadius: 0 }}>
                                        <TableRow>
                                            <TableCell scope="col" sx={{ pl: 3, width: "37%" }}>
                                                <VuiTypography
                                                    variant="xxs"
                                                    color={darkMode ? "white" : "dark"}
                                                    fontWeight="bold"
                                                    textTransform="uppercase"
                                                    opacity={0.9}
                                                    sx={{ display: "block", width: "100%", textAlign: "left" }}
                                                >
                                                    User
                                                </VuiTypography>
                                            </TableCell>
                                            <TableCell scope="col" align="center" sx={{ width: "18%" }}>
                                                <VuiTypography
                                                    variant="xxs"
                                                    color={darkMode ? "white" : "dark"}
                                                    fontWeight="bold"
                                                    textTransform="uppercase"
                                                    opacity={0.9}
                                                    sx={{ display: "block", width: "100%", textAlign: "center" }}
                                                >
                                                    Role
                                                </VuiTypography>
                                            </TableCell>
                                            <TableCell scope="col" align="center" sx={{ width: "14%" }}>
                                                <VuiTypography
                                                    variant="xxs"
                                                    color={darkMode ? "white" : "dark"}
                                                    fontWeight="bold"
                                                    textTransform="uppercase"
                                                    opacity={0.9}
                                                    sx={{ display: "block", width: "100%", textAlign: "center" }}
                                                >
                                                    Status
                                                </VuiTypography>
                                            </TableCell>
                                            <TableCell scope="col" align="center" sx={{ width: "15%" }}>
                                                <VuiTypography
                                                    variant="xxs"
                                                    color={darkMode ? "white" : "dark"}
                                                    fontWeight="bold"
                                                    textTransform="uppercase"
                                                    opacity={0.9}
                                                    sx={{ display: "block", width: "100%", textAlign: "center" }}
                                                >
                                                    Joined
                                                </VuiTypography>
                                            </TableCell>
                                            <TableCell scope="col" align="right" sx={{ pr: 3, width: "16%" }}>
                                                <VuiTypography
                                                    variant="xxs"
                                                    color={darkMode ? "white" : "dark"}
                                                    fontWeight="bold"
                                                    textTransform="uppercase"
                                                    opacity={0.9}
                                                    sx={{ display: "block", width: "100%", textAlign: "right" }}
                                                >
                                                    Actions
                                                </VuiTypography>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>{renderUsersTableRows()}</TableBody>
                                </Table>
                            </TableContainer>
                        </VuiBox>
                    </VuiBox>
                </Card>
            </VuiBox>

            <Dialog
                open={resetModalOpen}
                onClose={() => setResetModalOpen(false)}
                aria-labelledby="reset-password-dialog-title"
                PaperProps={{
                    sx: {
                        background:
                            "linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.49) 76.65%)",
                        backdropFilter: "blur(42px)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "20px",
                        minWidth: { xs: "calc(100vw - 32px)", sm: "500px" },
                    },
                }}
            >
                <DialogTitle id="reset-password-dialog-title">
                    <VuiBox display="flex" alignItems="center" gap={1.5}>
                        <Box
                            sx={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "12px",
                                background: "rgba(0, 117, 255, 0.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <IoKey size="20px" color="#0075FF" />
                        </Box>
                        <VuiBox>
                            <VuiTypography variant="h5" color="white" fontWeight="bold">
                                Reset Password
                            </VuiTypography>
                            <VuiTypography variant="caption" color="text">
                                For user: {selectedUsername}
                            </VuiTypography>
                        </VuiBox>
                    </VuiBox>
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <VuiBox display="flex" flexDirection="column" gap={2.5}>
                        <VuiBox
                            p={2}
                            sx={{
                                backgroundColor: "rgba(0, 117, 255, 0.05)",
                                borderRadius: "12px",
                                border: "1px solid rgba(0, 117, 255, 0.2)",
                            }}
                        >
                            <VuiTypography variant="caption" color="text" fontWeight="regular">
                                Leave the field blank to auto-generate a secure random password.
                            </VuiTypography>
                        </VuiBox>
                        <TextField
                            label="New Password"
                            type="text"
                            fullWidth
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Leave blank for auto-generation"
                            sx={{
                                "& .MuiInputLabel-root": {
                                    color: "rgba(255, 255, 255, 0.6)",
                                },
                                "& .MuiOutlinedInput-root": {
                                    color: "white",
                                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                                    borderRadius: "12px",
                                    "& fieldset": {
                                        borderColor: "rgba(255, 255, 255, 0.2)",
                                    },
                                    "&:hover fieldset": {
                                        borderColor: "rgba(0, 117, 255, 0.5)",
                                    },
                                    "&.Mui-focused fieldset": {
                                        borderColor: "#0075FF",
                                    },
                                },
                            }}
                        />
                        {newPasswordResult && (
                            <VuiBox
                                p={2.5}
                                sx={{
                                    backgroundColor: "rgba(1, 255, 112, 0.05)",
                                    borderRadius: "12px",
                                    border: "1px solid rgba(1, 255, 112, 0.3)",
                                }}
                            >
                                <VuiTypography variant="caption" color="text" fontWeight="bold" mb={1} display="block">
                                    Password Reset Successful
                                </VuiTypography>
                                <VuiBox
                                    p={1.5}
                                    mt={1}
                                    sx={{
                                        backgroundColor: "rgba(0, 0, 0, 0.3)",
                                        borderRadius: "8px",
                                        fontFamily: "monospace",
                                    }}
                                >
                                    <VuiTypography variant="button" color="success" fontWeight="bold">
                                        {newPasswordResult}
                                    </VuiTypography>
                                </VuiBox>
                                <VuiTypography variant="caption" color="text" fontWeight="regular" mt={1} display="block">
                                    Make sure to save this password securely.
                                </VuiTypography>
                            </VuiBox>
                        )}
                    </VuiBox>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 2 }}>
                    <VuiButton onClick={() => setResetModalOpen(false)} color="secondary" sx={{ px: 3 }}>
                        Close
                    </VuiButton>
                    <VuiButton onClick={handleResetPassword} color="info" sx={{ px: 3 }} disabled={!!newPasswordResult}>
                        Reset Password
                    </VuiButton>
                </DialogActions>
            </Dialog>

            <Dialog
                open={roleChangeModalOpen}
                onClose={cancelRoleChange}
                aria-labelledby="role-change-dialog-title"
                PaperProps={{
                    sx: {
                        background:
                            "linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.49) 76.65%)",
                        backdropFilter: "blur(42px)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "20px",
                        minWidth: { xs: "calc(100vw - 32px)", sm: "500px" },
                    },
                }}
            >
                <DialogTitle id="role-change-dialog-title">
                    <VuiBox display="flex" alignItems="center" gap={1.5}>
                        <Box
                            sx={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "12px",
                                background: "rgba(227, 26, 26, 0.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <IoWarning size="20px" color="#E31A1A" />
                        </Box>
                        <VuiBox>
                            <VuiTypography variant="h5" color="white" fontWeight="bold">
                                Confirm Role Change
                            </VuiTypography>
                            <VuiTypography variant="caption" color="text">
                                You are about to change your own role
                            </VuiTypography>
                        </VuiBox>
                    </VuiBox>
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <VuiBox display="flex" flexDirection="column" gap={2.5}>
                        <VuiBox
                            p={2.5}
                            sx={{
                                backgroundColor: "rgba(227, 26, 26, 0.05)",
                                borderRadius: "12px",
                                border: "1px solid rgba(227, 26, 26, 0.3)",
                            }}
                        >
                            <VuiTypography variant="button" color="white" fontWeight="bold" mb={1} display="block">
                                Warning: Self-Demotion
                            </VuiTypography>
                            <VuiTypography variant="caption" color="text" fontWeight="regular">
                                You are about to demote yourself from Admin to User. This action will:
                            </VuiTypography>
                            <VuiBox component="ul" mt={1.5} pl={2}>
                                <VuiTypography component="li" variant="caption" color="text" mb={0.5}>
                                    Remove your access to the Admin Dashboard
                                </VuiTypography>
                                <VuiTypography component="li" variant="caption" color="text" mb={0.5}>
                                    Remove your ability to manage users
                                </VuiTypography>
                                <VuiTypography component="li" variant="caption" color="text" mb={0.5}>
                                    Require another admin to restore your admin privileges
                                </VuiTypography>
                            </VuiBox>
                        </VuiBox>

                        <VuiBox
                            p={2}
                            sx={{
                                backgroundColor: "rgba(255, 255, 255, 0.03)",
                                borderRadius: "12px",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                            }}
                        >
                            <VuiTypography variant="caption" color="text" fontWeight="regular">
                                <strong>User:</strong> {pendingRoleChange?.username}
                            </VuiTypography>
                            <VuiTypography variant="caption" color="text" fontWeight="regular" display="block" mt={0.5}>
                                <strong>New Role:</strong> User
                            </VuiTypography>
                        </VuiBox>
                    </VuiBox>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 2 }}>
                    <VuiButton onClick={cancelRoleChange} color="secondary" sx={{ px: 3 }}>
                        Cancel
                    </VuiButton>
                    <VuiButton onClick={confirmRoleChange} color="error" sx={{ px: 3 }}>
                        Confirm Demotion
                    </VuiButton>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
}
