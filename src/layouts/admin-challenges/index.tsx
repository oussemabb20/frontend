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
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from "@mui/material";
import { IoRefresh, IoEye, IoClose, IoTicketOutline } from "react-icons/io5";
import challengeService, { type ChallengeTicket, type TicketMessage } from "../../services/challenge.service.js";

interface TicketDialogTicket extends ChallengeTicket {
    title?: string;
    messages?: TicketMessage[];
}

export default function AdminChallengeTickets() {
    const [controller] = useVisionUIController();
    const { darkMode } = controller;
    const [tickets, setTickets] = useState<ChallengeTicket[]>([]);
    const [statistics, setStatistics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedTicket, setSelectedTicket] = useState<TicketDialogTicket | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [adminResponse, setAdminResponse] = useState("");

    useEffect(() => {
        fetchTickets();
        fetchStatistics();
    }, [statusFilter]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const statusParam = statusFilter !== "all" ? (statusFilter as "open" | "in_progress" | "closed") : undefined;
            const data = await challengeService.getTickets(statusParam);
            console.log("📋 Fetched challenge tickets:", data);
            setTickets(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("❌ Failed to fetch challenge tickets:", error);
            setTickets([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            // Calculate statistics from all tickets
            const allTickets = await challengeService.getTickets();
            const stats = {
                total: allTickets.length,
                open: allTickets.filter(t => t.status === 'open').length,
                inProgress: allTickets.filter(t => t.status === 'in_progress').length,
                closed: allTickets.filter(t => t.status === 'closed').length,
            };
            setStatistics(stats);
        } catch (error) {
            console.error("Failed to fetch statistics:", error);
        }
    };

    const handleStatusChange = async (ticket: ChallengeTicket, newStatus: string) => {
        try {
            const challengeId = ticket.challengeId || '';
            const ticketId = ticket._id || ticket.id || ticket.ticketId || '';
            
            if (!challengeId || !ticketId) {
                console.error("Missing challengeId or ticketId");
                return;
            }

            await challengeService.treatTicket(challengeId, ticketId, { 
                status: newStatus as 'open' | 'in_progress' | 'closed' 
            });
            fetchTickets();
            fetchStatistics();
        } catch (error) {
            console.error("Failed to update ticket status:", error);
        }
    };

    const handleViewTicket = (ticket: ChallengeTicket) => {
        setSelectedTicket(ticket);
        setAdminResponse(ticket.adminResponse || "");
        setDialogOpen(true);
    };

    const handleSendResponse = async () => {
        if (!selectedTicket || !adminResponse.trim()) return;

        try {
            const challengeId = selectedTicket.challengeId || '';
            const ticketId = selectedTicket._id || selectedTicket.id || selectedTicket.ticketId || '';
            
            if (!challengeId || !ticketId) {
                console.error("Missing challengeId or ticketId");
                return;
            }

            await challengeService.treatTicket(challengeId, ticketId, {
                status: selectedTicket.status,
                adminResponse: adminResponse,
            });
            setAdminResponse("");
            setDialogOpen(false);
            fetchTickets();
        } catch (error) {
            console.error("Failed to send response:", error);
        }
    };

    const getCategoryLabel = (useCase: string) => {
        return useCase || "General";
    };

    const renderTicketCards = () => {
        if (loading) {
            return (
                <VuiBox display="flex" flexDirection="column" alignItems="center" gap={2} py={6}>
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
                        Loading tickets...
                    </VuiTypography>
                </VuiBox>
            );
        }

        if (tickets.length === 0) {
            return (
                <VuiBox display="flex" flexDirection="column" alignItems="center" gap={1.2} py={{ xs: 8, md: 10 }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "46px",
                            height: "46px",
                            borderRadius: "14px",
                            background: darkMode ? "rgba(160, 174, 192, 0.14)" : "rgba(100, 116, 139, 0.12)",
                            color: darkMode ? "rgba(160, 174, 192, 0.85)" : "rgba(71, 85, 105, 0.75)",
                        }}
                    >
                        <IoTicketOutline size="24px" />
                    </Box>
                    <VuiTypography variant="h6" color="text" opacity={0.5}>
                        No tickets found
                    </VuiTypography>
                    <VuiTypography variant="caption" color="text" opacity={0.4}>
                        {statusFilter !== "all" ? "No tickets for this filter" : "No tickets have been submitted yet"}
                    </VuiTypography>
                </VuiBox>
            );
        }

        return (
            <VuiBox display="flex" flexDirection="column" gap={3}>
                {tickets.map((ticket) => {
                    const getStatusColor = (status: string) => {
                        if (status === 'open') return '#0075FF';
                        if (status === 'in_progress') return '#FB8C00';
                        return '#4CAF50';
                    };

                    return (
                        <Card
                            key={ticket._id}
                            sx={{
                                background: darkMode
                                    ? "linear-gradient(145deg, rgba(10, 20, 60, 0.95), rgba(8, 16, 46, 0.92))"
                                    : "linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95))",
                                border: darkMode
                                    ? "1px solid rgba(0, 117, 255, 0.2)"
                                    : "1px solid rgba(148, 163, 184, 0.3)",
                                borderRadius: "16px",
                                boxShadow: darkMode
                                    ? "0px 8px 24px rgba(0, 0, 0, 0.4)"
                                    : "0px 6px 20px rgba(15, 23, 42, 0.08)",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    boxShadow: darkMode
                                        ? "0px 12px 32px rgba(0, 117, 255, 0.2)"
                                        : "0px 8px 24px rgba(0, 117, 255, 0.12)",
                                },
                            }}
                        >
                            <VuiBox p={3}>
                                {/* Title */}
                                <VuiTypography
                                    variant="h3"
                                    color={darkMode ? "white" : "dark"}
                                    fontWeight="bold"
                                    mb={1}
                                >
                                    {ticket.subject}
                                </VuiTypography>

                                {/* Challenge Title · by Reporter */}
                                <VuiTypography variant="body2" color="text" opacity={0.7} mb={2}>
                                    {ticket.challengeTitle || "Unknown Challenge"} · by {ticket.reporterUsername}
                                </VuiTypography>

                                <VuiTypography variant="caption" color="text" opacity={0.6} mb={2} display="block">
                                    Category: {getCategoryLabel(ticket.useCase)}
                                </VuiTypography>

                                {/* Status Badge */}
                                <Chip
                                    label={ticket.status}
                                    size="small"
                                    sx={{
                                        fontWeight: "bold",
                                        fontSize: "0.75rem",
                                        px: 2,
                                        height: "32px",
                                        mb: 2,
                                        backgroundColor: `${getStatusColor(ticket.status)}20`,
                                        color: getStatusColor(ticket.status),
                                        textTransform: "lowercase",
                                    }}
                                />

                                {/* Description Preview */}
                                        <VuiButton
                                            variant="outlined"
                                            color="secondary"
                                            onClick={() => handleViewTicket(ticket)}
                                            startIcon={<IoEye />}
                                            sx={{
                                                flex: 1,
                                                minWidth: "140px",
                                                textTransform: "none",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            View Ticket
                                        </VuiButton>
                                <VuiTypography
                                    variant="body2"
                                    color="text"
                                    opacity={0.8}
                                    mb={3}
                                    sx={{
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    {ticket.description}
                                </VuiTypography>

                                {/* Action Buttons */}
                                <VuiBox display="flex" gap={2} flexWrap="wrap">
                                    <VuiButton
                                        variant="contained"
                                        color="info"
                                        onClick={() => {
                                            if (ticket.challengeId) {
                                                window.open(`/challenges/${ticket.challengeId}`, '_blank');
                                            }
                                        }}
                                        sx={{
                                            flex: 1,
                                            minWidth: "140px",
                                            textTransform: "none",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        Open Challenge
                                    </VuiButton>
                                    <VuiButton
                                        variant="contained"
                                        color="warning"
                                        onClick={() => handleStatusChange(ticket, 'in_progress')}
                                        disabled={ticket.status === 'in_progress'}
                                        sx={{
                                            flex: 1,
                                            minWidth: "140px",
                                            textTransform: "none",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        Mark In Progress
                                    </VuiButton>
                                    <VuiButton
                                        variant="contained"
                                        color={ticket.status === 'closed' ? 'info' : 'success'}
                                        onClick={() => handleStatusChange(ticket, ticket.status === 'closed' ? 'open' : 'closed')}
                                        sx={{
                                            flex: 1,
                                            minWidth: "140px",
                                            textTransform: "none",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        {ticket.status === 'closed' ? 'Reopen' : 'Close'}
                                    </VuiButton>
                                </VuiBox>
                            </VuiBox>
                        </Card>
                    );
                })}
            </VuiBox>
        );
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
                                Challenge Tickets
                            </VuiTypography>
                            <VuiTypography variant="button" color={darkMode ? "text" : "dark"} fontWeight="regular">
                                Review tickets by status and see which user opened each one
                            </VuiTypography>
                        </VuiBox>
                        <VuiButton
                            variant="contained"
                            color="info"
                            onClick={() => {
                                fetchTickets();
                                fetchStatistics();
                            }}
                            startIcon={<IoRefresh />}
                            sx={{ 
                                minWidth: "120px",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                    transform: "translateY(-2px)",
                                    boxShadow: "0px 6px 16px rgba(0, 117, 255, 0.3)",
                                },
                            }}
                        >
                            Refresh
                        </VuiButton>
                    </VuiBox>

                    {/* Statistics */}
                    {statistics && (
                        <VuiBox display="flex" gap={2} mb={3} flexWrap="wrap">
                            <Chip
                                label={`All: ${statistics.total}`}
                                onClick={() => setStatusFilter("all")}
                                sx={{
                                    fontWeight: "bold",
                                    fontSize: "0.8rem",
                                    px: 2,
                                    height: "38px",
                                    cursor: "pointer",
                                    backgroundColor: statusFilter === "all" 
                                        ? "rgba(0, 117, 255, 0.25)" 
                                        : "rgba(0, 117, 255, 0.1)",
                                    color: "#0075FF",
                                    border: statusFilter === "all" 
                                        ? "2px solid #0075FF" 
                                        : "1.5px solid rgba(0, 117, 255, 0.3)",
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                        backgroundColor: "rgba(0, 117, 255, 0.2)",
                                        transform: "translateY(-2px)",
                                        boxShadow: "0px 4px 12px rgba(0, 117, 255, 0.25)",
                                    },
                                }}
                            />
                            <Chip
                                label={`Open: ${statistics.open}`}
                                onClick={() => setStatusFilter("open")}
                                sx={{
                                    fontWeight: "bold",
                                    fontSize: "0.8rem",
                                    px: 2,
                                    height: "38px",
                                    cursor: "pointer",
                                    backgroundColor: statusFilter === "open" 
                                        ? "rgba(227, 26, 26, 0.25)" 
                                        : "rgba(227, 26, 26, 0.1)",
                                    color: "#E31A1A",
                                    border: statusFilter === "open" 
                                        ? "2px solid #E31A1A" 
                                        : "1.5px solid rgba(227, 26, 26, 0.3)",
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                        backgroundColor: "rgba(227, 26, 26, 0.2)",
                                        transform: "translateY(-2px)",
                                        boxShadow: "0px 4px 12px rgba(227, 26, 26, 0.25)",
                                    },
                                }}
                            />
                            <Chip
                                label={`In Progress: ${statistics.inProgress}`}
                                onClick={() => setStatusFilter("in_progress")}
                                sx={{
                                    fontWeight: "bold",
                                    fontSize: "0.8rem",
                                    px: 2,
                                    height: "38px",
                                    cursor: "pointer",
                                    backgroundColor: statusFilter === "in_progress" 
                                        ? "rgba(251, 140, 0, 0.25)" 
                                        : "rgba(251, 140, 0, 0.1)",
                                    color: "#FB8C00",
                                    border: statusFilter === "in_progress" 
                                        ? "2px solid #FB8C00" 
                                        : "1.5px solid rgba(251, 140, 0, 0.3)",
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                        backgroundColor: "rgba(251, 140, 0, 0.2)",
                                        transform: "translateY(-2px)",
                                        boxShadow: "0px 4px 12px rgba(251, 140, 0, 0.25)",
                                    },
                                }}
                            />
                            <Chip
                                label={`Closed: ${statistics.closed}`}
                                onClick={() => setStatusFilter("closed")}
                                sx={{
                                    fontWeight: "bold",
                                    fontSize: "0.8rem",
                                    px: 2,
                                    height: "38px",
                                    cursor: "pointer",
                                    backgroundColor: statusFilter === "closed" 
                                        ? "rgba(76, 175, 80, 0.25)" 
                                        : "rgba(76, 175, 80, 0.1)",
                                    color: "#4CAF50",
                                    border: statusFilter === "closed" 
                                        ? "2px solid #4CAF50" 
                                        : "1.5px solid rgba(76, 175, 80, 0.3)",
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                        backgroundColor: "rgba(76, 175, 80, 0.2)",
                                        transform: "translateY(-2px)",
                                        boxShadow: "0px 4px 12px rgba(76, 175, 80, 0.25)",
                                    },
                                }}
                            />
                        </VuiBox>
                    )}
                </VuiBox>

                <VuiBox>
                    <VuiTypography
                        variant="lg"
                        color={darkMode ? "white" : "dark"}
                        fontWeight="bold"
                        sx={{ fontWeight: 800 }}
                        mb={3}
                    >
                        All Tickets ({tickets.length})
                    </VuiTypography>
                    {renderTicketCards()}
                </VuiBox>
            </VuiBox>

            {/* Ticket Detail Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="md"
                fullWidth
                aria-labelledby="ticket-detail-dialog-title"
                PaperProps={{
                    sx: {
                        background: darkMode
                            ? "linear-gradient(145deg, rgba(7, 14, 48, 0.98), rgba(8, 16, 46, 0.96))"
                            : "linear-gradient(135deg, rgba(255, 255, 255, 1), rgba(248, 250, 252, 0.98))",
                        border: darkMode 
                            ? "1px solid rgba(0, 117, 255, 0.2)" 
                            : "1px solid rgba(148, 163, 184, 0.25)",
                        borderRadius: "20px",
                        boxShadow: darkMode
                            ? "0px 24px 60px rgba(0, 0, 0, 0.6)"
                            : "0px 20px 50px rgba(15, 23, 42, 0.12)",
                    },
                }}
            >
                {selectedTicket && (
                    <>
                        <DialogTitle id="ticket-detail-dialog-title">
                            <VuiBox display="flex" justifyContent="space-between" alignItems="center">
                                <VuiTypography variant="h5" color={darkMode ? "white" : "dark"} fontWeight="bold">
                                    {selectedTicket.title || selectedTicket.subject}
                                </VuiTypography>
                                <IconButton onClick={() => setDialogOpen(false)} size="small" aria-label="Close dialog">
                                    <IoClose color={darkMode ? "#fff" : "#000"} />
                                </IconButton>
                            </VuiBox>
                        </DialogTitle>
                        <DialogContent>
                            <VuiBox mb={3}>
                                <VuiTypography variant="caption" color="text" mb={1}>
                                    Description:
                                </VuiTypography>
                                <VuiTypography variant="body2" color={darkMode ? "white" : "dark"}>
                                    {selectedTicket.description}
                                </VuiTypography>
                            </VuiBox>

                            <VuiBox mb={3}>
                                <VuiTypography variant="caption" color="text" mb={2}>
                                    Conversation:
                                </VuiTypography>
                                <VuiBox
                                    sx={{
                                        maxHeight: "300px",
                                        overflowY: "auto",
                                        border: darkMode 
                                            ? "1px solid rgba(0, 117, 255, 0.2)" 
                                            : "1px solid rgba(148, 163, 184, 0.25)",
                                        borderRadius: "12px",
                                        p: 2,
                                        background: darkMode
                                            ? "rgba(0, 0, 0, 0.15)"
                                            : "rgba(248, 250, 252, 0.5)",
                                        "&::-webkit-scrollbar": {
                                            width: "8px",
                                        },
                                        "&::-webkit-scrollbar-track": {
                                            background: darkMode ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.04)",
                                            borderRadius: "10px",
                                        },
                                        "&::-webkit-scrollbar-thumb": {
                                            background: darkMode 
                                                ? "linear-gradient(180deg, rgba(0, 117, 255, 0.6), rgba(0, 117, 255, 0.4))" 
                                                : "linear-gradient(180deg, rgba(0, 117, 255, 0.4), rgba(0, 117, 255, 0.25))",
                                            borderRadius: "10px",
                                            "&:hover": {
                                                background: darkMode 
                                                    ? "linear-gradient(180deg, rgba(0, 117, 255, 0.8), rgba(0, 117, 255, 0.6))" 
                                                    : "linear-gradient(180deg, rgba(0, 117, 255, 0.6), rgba(0, 117, 255, 0.4))",
                                            },
                                        },
                                    }}
                                >
                                    {(selectedTicket.messages ?? []).length > 0 ? (
                                        (selectedTicket.messages ?? []).map((msg, index: number) => (
                                            <VuiBox
                                                key={index}
                                                mb={2}
                                                p={2}
                                                sx={{
                                                    background: msg.isAdmin
                                                        ? darkMode
                                                            ? "linear-gradient(135deg, rgba(0, 117, 255, 0.15), rgba(0, 117, 255, 0.08))"
                                                            : "linear-gradient(135deg, rgba(0, 117, 255, 0.12), rgba(0, 117, 255, 0.06))"
                                                        : darkMode
                                                            ? "rgba(150, 180, 235, 0.1)"
                                                            : "rgba(150, 180, 235, 0.08)",
                                                    borderRadius: "10px",
                                                    borderLeft: msg.isAdmin 
                                                        ? "3px solid #0075FF" 
                                                        : darkMode 
                                                            ? "3px solid rgba(150, 180, 235, 0.4)" 
                                                            : "3px solid rgba(150, 180, 235, 0.3)",
                                                    transition: "all 0.2s ease",
                                                    "&:hover": {
                                                        transform: "translateX(4px)",
                                                        boxShadow: darkMode
                                                            ? "0px 4px 12px rgba(0, 117, 255, 0.15)"
                                                            : "0px 4px 10px rgba(0, 117, 255, 0.08)",
                                                    },
                                                }}
                                            >
                                                <VuiBox display="flex" justifyContent="space-between" mb={1}>
                                                    <VuiTypography variant="caption" color="text" fontWeight="bold">
                                                        {msg.username} {msg.isAdmin && "(Admin)"}
                                                    </VuiTypography>
                                                    <VuiTypography variant="caption" color="text" opacity={0.6}>
                                                        {new Date(msg.createdAt).toLocaleString()}
                                                    </VuiTypography>
                                                </VuiBox>
                                                <VuiTypography variant="body2" color={darkMode ? "white" : "dark"}>
                                                    {msg.message}
                                                </VuiTypography>
                                            </VuiBox>
                                        ))
                                    ) : (
                                        <VuiTypography variant="body2" color="text" textAlign="center">
                                            No messages yet
                                        </VuiTypography>
                                    )}
                                </VuiBox>
                            </VuiBox>

                            <VuiBox>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    placeholder="Type your reply..."
                                    value={adminResponse}
                                    onChange={(e) => setAdminResponse(e.target.value)}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            color: darkMode ? "#fff" : "#000",
                                            borderRadius: "12px",
                                            background: darkMode 
                                                ? "rgba(0, 0, 0, 0.15)" 
                                                : "rgba(248, 250, 252, 0.5)",
                                            "& fieldset": {
                                                borderColor: darkMode 
                                                    ? "rgba(0, 117, 255, 0.25)" 
                                                    : "rgba(148, 163, 184, 0.3)",
                                                borderWidth: "1.5px",
                                            },
                                            "&:hover fieldset": {
                                                borderColor: darkMode 
                                                    ? "rgba(0, 117, 255, 0.4)" 
                                                    : "rgba(0, 117, 255, 0.4)",
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#0075FF",
                                                borderWidth: "2px",
                                            },
                                        },
                                    }}
                                />
                            </VuiBox>
                        </DialogContent>
                        <DialogActions>
                            <VuiButton variant="outlined" color="secondary" onClick={() => setDialogOpen(false)}>
                                Close
                            </VuiButton>
                            <VuiButton variant="contained" color="info" onClick={handleSendResponse} disabled={!adminResponse.trim()}>
                                Send Reply
                            </VuiButton>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </DashboardLayout>
    );
}
