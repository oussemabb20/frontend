import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Box, IconButton, Menu, MenuItem } from '@mui/material';
import { IoTrophy, IoPeople, IoTime, IoCalendar, IoSettings, IoPlay, IoStop, IoTrash, IoEye, IoEllipsisVertical } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import Footer from 'examples/Footer';
import VuiBox from 'components/VuiBox';
import VuiTypography from 'components/VuiTypography';
import VuiButton from 'components/VuiButton';
import { useVisionUIController } from 'context';
import tournamentService, { Tournament } from '../../services/tournament.service.js';
import TournamentSizeSelector from 'components/TournamentSizeSelector';
import InlineTournamentCreator from 'components/InlineTournamentCreator';

const AdminTournaments: React.FC = () => {
  const [controller] = useVisionUIController();
  const { darkMode } = controller;
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [selectedSize, setSelectedSize] = useState(16);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<HTMLElement | null>(null);
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [showInlineCreator, setShowInlineCreator] = useState(false);

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      const tournamentList = await tournamentService.getTournaments();
      setTournaments(tournamentList);
    } catch (error: any) {
      setFeedback(error.message || 'Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTournament = () => {
    setShowSizeSelector(true);
  };

  const handleSizeSelected = (size: number) => {
    setSelectedSize(size);
    setShowSizeSelector(false);
    setShowInlineCreator(true);
  };

  const handleTournamentCreated = (tournament: Tournament) => {
    setFeedback(`Tournament "${tournament.name}" created successfully!`);
    loadTournaments();
    setShowInlineCreator(false);
  };

  const handleStartTournament = async (tournamentId: string) => {
    try {
      setLoading(true);
      await tournamentService.updateTournament(tournamentId, {
        status: 'active',
        startAt: new Date().toISOString(),
      });
      setFeedback('Tournament started successfully!');
      await loadTournaments();
    } catch (error: any) {
      setFeedback(error.message || 'Failed to start tournament');
    } finally {
      setLoading(false);
    }
    setActionMenuAnchor(null);
  };

  const handleDeleteTournament = async (tournamentId: string) => {
    if (window.confirm('Are you sure you want to delete this tournament?')) {
      try {
        setLoading(true);
        await tournamentService.deleteTournament(tournamentId);
        setFeedback('Tournament deleted successfully!');
        await loadTournaments();
      } catch (error: any) {
        setFeedback(error.message || 'Failed to delete tournament');
      } finally {
        setLoading(false);
      }
    }
    setActionMenuAnchor(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'active':
        return 'success';
      case 'completed':
        return 'secondary';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTournamentStats = (maxParticipants: number) => {
    const stats = {
      4: { rounds: 2, matches: 3 },
      8: { rounds: 3, matches: 7 },
      16: { rounds: 4, matches: 15 },
      32: { rounds: 5, matches: 31 },
    };
    return stats[maxParticipants as keyof typeof stats] || { rounds: 0, matches: 0 };
  };

  const getTotalStats = () => {
    const totalRegistered = tournaments.reduce((sum, t) => sum + (t.registeredPlayers?.length || 0), 0);
    const totalCapacity = tournaments.reduce((sum, t) => sum + t.maxParticipants, 0);
    const totalMatches = tournaments.reduce((sum, t) => sum + getTournamentStats(t.maxParticipants).matches, 0);
    return { totalRegistered, totalCapacity, totalMatches };
  };

  const openActionMenu = (event: React.MouseEvent<HTMLElement>, tournament: Tournament) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedTournament(tournament);
  };

  const closeActionMenu = () => {
    setActionMenuAnchor(null);
    setSelectedTournament(null);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <VuiBox py={3}>
        <VuiBox mb={3}>
          <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <VuiBox>
              <VuiTypography variant="h3" color="white" fontWeight="bold">
                Tournament Management
              </VuiTypography>
              <VuiTypography variant="body2" color="text">
                Create and manage tournaments for your platform
              </VuiTypography>
            </VuiBox>
            <VuiButton variant="contained" color="info" startIcon={<IoTrophy />} onClick={handleCreateTournament}>
              Create Tournament
            </VuiButton>
          </VuiBox>

          {/* Overall Statistics */}
          {tournaments.length > 0 && (
            <Card sx={{ mb: 3, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <Box textAlign="center">
                      <IoPeople size="32px" style={{ marginBottom: 8 }} />
                      <Typography variant="h3" fontWeight="bold">
                        {getTotalStats().totalRegistered}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Total Registered Users
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        out of {getTotalStats().totalCapacity} capacity
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box textAlign="center">
                      <IoTrophy size="32px" style={{ marginBottom: 8 }} />
                      <Typography variant="h3" fontWeight="bold">
                        {tournaments.length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Active Tournaments
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        {tournaments.filter(t => t.status === 'active').length} ongoing
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box textAlign="center">
                      <IoCalendar size="32px" style={{ marginBottom: 8 }} />
                      <Typography variant="h3" fontWeight="bold">
                        {getTotalStats().totalMatches}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Total Matches
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        across all tournaments
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {feedback && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {feedback}
            </Alert>
          )}
        </VuiBox>

        {/* Inline Tournament Creator */}
        {showInlineCreator && (
          <VuiBox mb={3}>
            <Card sx={{ background: darkMode ? 'rgba(10, 18, 48, 0.95)' : 'white', border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.12)', p: 3 }}>
              <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <VuiTypography variant="h4" color={darkMode ? 'white' : 'dark'} fontWeight="bold">
                  Create {selectedSize}-Player Tournament
                </VuiTypography>
              </VuiBox>
              <InlineTournamentCreator 
                selectedSize={selectedSize} 
                darkMode={darkMode}
                onTournamentCreated={handleTournamentCreated} 
                onCancel={() => setShowInlineCreator(false)}
              />
            </Card>
          </VuiBox>
        )}

        {tournaments.length === 0 ? (
          <Card sx={{ textAlign: 'center', p: 4 }}>
            <IoTrophy size="64px" color="#FFD700" style={{ marginBottom: '16px' }} />
            <Typography variant="h6" gutterBottom>
              No Tournaments Created
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Create your first tournament to get started with competitive coding events.
            </Typography>
            <Button variant="contained" color="primary" startIcon={<IoTrophy />} onClick={handleCreateTournament}>
              Create Your First Tournament
            </Button>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {tournaments.map(tournament => (
              <Grid item xs={12} md={6} lg={4} key={tournament._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: darkMode ? 'rgba(10, 18, 48, 0.95)' : 'white',
                    border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.12)',
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <IoTrophy size="24px" color="#FFD700" />
                        <Typography variant="h6" fontWeight="bold">
                          {tournament.name}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip label={getStatusLabel(tournament.status)} color={getStatusColor(tournament.status) as any} size="small" />
                        <IconButton size="small" onClick={e => openActionMenu(e, tournament)}>
                          <IoEllipsisVertical />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Tournament Stats Summary */}
                    <Box
                      sx={{
                        backgroundColor: darkMode ? 'rgba(74, 163, 255, 0.1)' : 'rgba(74, 163, 255, 0.05)',
                        borderRadius: 2,
                        padding: 2,
                        mb: 2,
                        border: darkMode ? '1px solid rgba(74, 163, 255, 0.2)' : '1px solid rgba(74, 163, 255, 0.15)',
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box textAlign="center">
                            <Typography variant="h4" fontWeight="bold" color="primary">
                              {tournament.maxParticipants}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Players
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box textAlign="center">
                            <Typography variant="h4" fontWeight="bold" color="secondary">
                              {getTournamentStats(tournament.maxParticipants).matches}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Matches
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>

                    <Box mb={2}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <IoPeople size="16px" />
                        <Typography variant="body2">
                          {tournament.registeredPlayers?.length || 0}/{tournament.maxParticipants} Registered
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <IoTime size="16px" />
                        <Typography variant="body2">
                          {tournament.matchDurationMinutes} min matches
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <IoCalendar size="16px" />
                        <Typography variant="body2">
                          {formatDate(tournament.startAt)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Prize: {tournament.winnerXp} XP
                      </Typography>
                      <br />
                      <Typography variant="caption" color="textSecondary">
                        Badge: {tournament.winnerBadge}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Action Menu */}
        <Menu anchorEl={actionMenuAnchor} open={Boolean(actionMenuAnchor)} onClose={closeActionMenu}>
          {selectedTournament?.status === 'draft' && (
            <MenuItem onClick={() => handleStartTournament(selectedTournament._id)}>
              <IoPlay style={{ marginRight: 8 }} />
              Start Tournament
            </MenuItem>
          )}
          <MenuItem onClick={() => handleDeleteTournament(selectedTournament?._id || '')}>
            <IoTrash style={{ marginRight: 8 }} />
            Delete Tournament
          </MenuItem>
        </Menu>

        {/* Tournament Creation Modals */}
        <TournamentSizeSelector open={showSizeSelector} onClose={() => setShowSizeSelector(false)} onSelectSize={handleSizeSelected} darkMode={darkMode} />
      </VuiBox>
      <Footer />
    </DashboardLayout>
  );
};

export default AdminTournaments;
