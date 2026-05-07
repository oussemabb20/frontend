import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
  IconButton,
  Button,
  Menu,
  Chip,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { IoClose, IoTrophy, IoSparkles } from 'react-icons/io5';
import VuiBox from 'components/VuiBox';
import VuiTypography from 'components/VuiTypography';
import VuiButton from 'components/VuiButton';
import { tournamentService, CreateTournamentData } from '../../services/tournament.service.js';
import challengeService, { Challenge } from '../../services/challenge.service.js';
import { useNavigate } from 'react-router-dom';

interface ComprehensiveTournamentCreatorProps {
  open: boolean;
  onClose: () => void;
  onTournamentCreated: (tournament: any) => void;
  selectedSize: number;
  darkMode?: boolean;
}

type MatchSlot = {
  key: string;
  label: string;
  round: string;
};

const ComprehensiveTournamentCreator: React.FC<ComprehensiveTournamentCreatorProps> = ({
  open,
  onClose,
  onTournamentCreated,
  selectedSize,
  darkMode = false,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>([]);
  const [challengeLoading, setChallengeLoading] = useState(true);
  const [matchMenuAnchor, setMatchMenuAnchor] = useState<HTMLElement | null>(null);
  const [activeMatchKey, setActiveMatchKey] = useState<string>('');

  const [formData, setFormData] = useState({
    name: `${selectedSize}-Player Tournament`,
    startAt: new Date(Date.now() + 60 * 60 * 1000),
    matchDurationMinutes: 30,
    noShowWaitMinutes: 5,
    roundBreakMinutes: selectedSize <= 8 ? 5 : 10,
    winnerXp: selectedSize * 100,
    winnerBadge: `${selectedSize}-Player Champion`,
    matchChallenges: {} as Record<string, string>,
  });

  const getMatchSlots = (size: number): MatchSlot[] => {
    const slots: MatchSlot[] = [];
    const rounds = {
      4: ['Semifinal', 'Final'],
      8: ['Quarterfinal', 'Semifinal', 'Final'],
      16: ['Round of 16', 'Quarterfinal', 'Semifinal', 'Final'],
      32: ['Round of 32', 'Round of 16', 'Quarterfinal', 'Semifinal', 'Final'],
    };

    const roundStructure = rounds[size as keyof typeof rounds] || rounds[16];
    let currentSize = size;

    roundStructure.forEach((roundName) => {
      const matchesInRound = currentSize / 2;
      for (let i = 1; i <= matchesInRound; i++) {
        const matchKey = `${roundName.toLowerCase().replace(/\s+/g, '_')}_m${i}`;
        slots.push({
          key: matchKey,
          label: roundName === 'Final' ? 'Championship' : `Match ${i}`,
          round: roundName,
        });
      }
      currentSize = matchesInRound;
    });

    return slots;
  };

  const matchSlots = useMemo(() => getMatchSlots(selectedSize), [selectedSize]);

  useEffect(() => {
    if (open) {
      loadChallenges();
      // Initialize match challenges
      const initialChallenges: Record<string, string> = {};
      matchSlots.forEach((slot) => {
        initialChallenges[slot.key] = '';
      });
      setFormData((prev) => ({ ...prev, matchChallenges: initialChallenges }));
    }
  }, [open, selectedSize]);

  const loadChallenges = async () => {
    setChallengeLoading(true);
    try {
      const response = await challengeService.getChallenges({
        page: 1,
        limit: 200,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        isActive: true,
      });
      setAvailableChallenges(Array.isArray(response?.challenges) ? response.challenges : []);
    } catch (error) {
      console.error('Failed to load challenges:', error);
      setAvailableChallenges([]);
    } finally {
      setChallengeLoading(false);
    }
  };

  const sortedChallenges = useMemo(
    () => [...availableChallenges].sort((a, b) => a.title.localeCompare(b.title)),
    [availableChallenges]
  );

  const selectedChallengeIds = useMemo(
    () => matchSlots.map((slot) => formData.matchChallenges[slot.key]).filter((id) => id),
    [formData.matchChallenges, matchSlots]
  );

  const allMatchesAssigned = selectedChallengeIds.length === matchSlots.length;
  const uniqueChallengePerMatch = new Set(selectedChallengeIds).size === matchSlots.length;

  const canSubmit = useMemo(() => {
    return (
      formData.name.trim().length >= 3 &&
      formData.startAt > new Date() &&
      formData.matchDurationMinutes > 0 &&
      formData.noShowWaitMinutes > 0 &&
      formData.roundBreakMinutes > 0 &&
      formData.winnerXp > 0 &&
      formData.winnerBadge.trim().length >= 3 &&
      allMatchesAssigned &&
      uniqueChallengePerMatch
    );
  }, [formData, allMatchesAssigned, uniqueChallengePerMatch]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleMatchChallengeChange = (matchKey: string, challengeId: string) => {
    setFormData((prev) => ({
      ...prev,
      matchChallenges: {
        ...prev.matchChallenges,
        [matchKey]: challengeId,
      },
    }));
  };

  const handleOpenMatchMenu = (event: React.MouseEvent<HTMLButtonElement>, matchKey: string) => {
    setActiveMatchKey(matchKey);
    setMatchMenuAnchor(event.currentTarget);
  };

  const handleCloseMatchMenu = () => {
    setMatchMenuAnchor(null);
    setActiveMatchKey('');
  };

  const handleSelectChallengeForActiveMatch = (challengeId: string) => {
    if (!activeMatchKey) return;
    handleMatchChallengeChange(activeMatchKey, challengeId);
    handleCloseMatchMenu();
  };

  const getSelectableChallengesForMatch = (matchKey: string) => {
    const currentSelection = formData.matchChallenges[matchKey];
    const selectedInOtherMatches = new Set(
      matchSlots
        .filter((slot) => slot.key !== matchKey)
        .map((slot) => formData.matchChallenges[slot.key])
        .filter((id) => id)
    );

    return sortedChallenges.filter(
      (challenge) => challenge._id === currentSelection || !selectedInOtherMatches.has(challenge._id)
    );
  };

  const challengeTitleById = (id: string) => {
    return availableChallenges.find((challenge) => challenge._id === id)?.title || 'Unknown Challenge';
  };

  const challengeDisplayById = (id: string) => {
    const challenge = availableChallenges.find((item) => item._id === id);
    if (!challenge) return 'Unknown Challenge';
    return `${challenge.title} (${String(challenge.difficulty || '').toUpperCase()})`;
  };

  const handleCreateTournament = async () => {
    if (!canSubmit || loading) return;

    setLoading(true);
    setError('');

    try {
      const matchAssignments = matchSlots.map((slot) => ({
        matchKey: slot.key,
        round: slot.round,
        label: slot.label,
        challengeId: formData.matchChallenges[slot.key],
        challengeTitle: challengeTitleById(formData.matchChallenges[slot.key]),
      }));

      const tournamentData: CreateTournamentData = {
        name: formData.name.trim(),
        maxParticipants: selectedSize,
        startAt: formData.startAt.toISOString(),
        matchDurationMinutes: formData.matchDurationMinutes,
        noShowWaitMinutes: formData.noShowWaitMinutes,
        roundBreakMinutes: formData.roundBreakMinutes,
        winnerXp: formData.winnerXp,
        winnerBadge: formData.winnerBadge,
        matchAssignments,
      };

      const tournament = await tournamentService.createTournament(tournamentData);
      onTournamentCreated(tournament);
      onClose();

      // Reset form
      const initialChallenges: Record<string, string> = {};
      matchSlots.forEach((slot) => {
        initialChallenges[slot.key] = '';
      });
      setFormData({
        name: `${selectedSize}-Player Tournament`,
        startAt: new Date(Date.now() + 60 * 60 * 1000),
        matchDurationMinutes: 30,
        noShowWaitMinutes: 5,
        roundBreakMinutes: selectedSize <= 8 ? 5 : 10,
        winnerXp: selectedSize * 100,
        winnerBadge: `${selectedSize}-Player Champion`,
        matchChallenges: initialChallenges,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create tournament');
    } finally {
      setLoading(false);
    }
  };

  const getSizeInfo = () => {
    const info = {
      4: { rounds: 2, matches: 3, duration: '~30 min' },
      8: { rounds: 3, matches: 7, duration: '~1 hour' },
      16: { rounds: 4, matches: 15, duration: '~2 hours' },
      32: { rounds: 5, matches: 31, duration: '~3 hours' },
    };
    return info[selectedSize as keyof typeof info] || info[16];
  };

  const sizeInfo = getSizeInfo();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { backgroundColor: darkMode ? 'rgba(10, 18, 48, 0.95)' : 'white', color: darkMode ? 'white' : 'black', borderRadius: '12px' } }}>
        <DialogTitle>
          <VuiBox display="flex" justifyContent="space-between" alignItems="center">
            <VuiBox display="flex" alignItems="center" gap={1}>
              <IoTrophy size="24px" color="#FFD700" />
              <VuiTypography variant="h4" color={darkMode ? 'white' : 'dark'} fontWeight="bold">
                Create {selectedSize}-Player Tournament
              </VuiTypography>
            </VuiBox>
            <IconButton onClick={onClose} sx={{ color: darkMode ? 'white' : 'black' }}>
              <IoClose />
            </IconButton>
          </VuiBox>
        </DialogTitle>

        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* Tournament Info Summary */}
          <Box sx={{ backgroundColor: darkMode ? 'rgba(74, 163, 255, 0.1)' : 'rgba(74, 163, 255, 0.05)', padding: 2, borderRadius: 2, mb: 3, border: darkMode ? '1px solid rgba(74, 163, 255, 0.2)' : '1px solid rgba(74, 163, 255, 0.15)' }}>
            <VuiTypography variant="h6" color={darkMode ? 'white' : 'dark'} mb={1}>
              Tournament Overview
            </VuiTypography>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <VuiTypography variant="caption" color="text">Players</VuiTypography>
                <VuiTypography variant="body2" color={darkMode ? 'white' : 'dark'} fontWeight="bold">{selectedSize}</VuiTypography>
              </Grid>
              <Grid item xs={3}>
                <VuiTypography variant="caption" color="text">Rounds</VuiTypography>
                <VuiTypography variant="body2" color={darkMode ? 'white' : 'dark'} fontWeight="bold">{sizeInfo.rounds}</VuiTypography>
              </Grid>
              <Grid item xs={3}>
                <VuiTypography variant="caption" color="text">Matches</VuiTypography>
                <VuiTypography variant="body2" color={darkMode ? 'white' : 'dark'} fontWeight="bold">{sizeInfo.matches}</VuiTypography>
              </Grid>
              <Grid item xs={3}>
                <VuiTypography variant="caption" color="text">Duration</VuiTypography>
                <VuiTypography variant="body2" color={darkMode ? 'white' : 'dark'} fontWeight="bold">{sizeInfo.duration}</VuiTypography>
              </Grid>
            </Grid>
          </Box>

          <Grid container spacing={3}>
            {/* Tournament Name */}
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Tournament Name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} variant="outlined" />
            </Grid>

            {/* Start Time */}
            <Grid item xs={12} md={6}>
              <DateTimePicker 
                label="Start Time" 
                value={formData.startAt} 
                onChange={(newValue) => handleInputChange('startAt', newValue)} 
<<<<<<< Updated upstream
                minDateTime={new Date()}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    variant="outlined"
                    sx={{
=======
                minDateTime={new Date()} 
                slotProps={{ 
                  textField: { 
                    fullWidth: true, 
                    variant: 'outlined',
                    onClick: (e) => e.stopPropagation(),
                    sx: {
>>>>>>> Stashed changes
                      '& .MuiInputBase-root': {
                        color: darkMode ? 'white' : 'black',
                        backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'white',
                      },
                      '& .MuiInputLabel-root': {
                        color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.23)',
                      },
<<<<<<< Updated upstream
                    }}
                  />
                )}
=======
                    }
                  },
                  popper: {
                    disablePortal: false,
                    placement: 'bottom-start',
                    sx: {
                      zIndex: 1400,
                      '& .MuiPaper-root': {
                        backgroundColor: darkMode ? 'rgba(10, 18, 48, 0.98)' : 'white',
                        color: darkMode ? 'white' : 'black',
                        border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.12)',
                      },
                      '& .MuiPickersDay-root': {
                        color: darkMode ? 'white' : 'black',
                        '&:hover': {
                          backgroundColor: darkMode ? 'rgba(74, 163, 255, 0.2)' : 'rgba(0, 117, 255, 0.1)',
                        },
                      },
                      '& .MuiPickersDay-root.Mui-selected': {
                        backgroundColor: '#0075FF',
                        color: 'white',
                      },
                      '& .MuiClock-root': {
                        backgroundColor: darkMode ? 'rgba(10, 18, 48, 0.5)' : 'white',
                      },
                      '& .MuiClockNumber-root': {
                        color: darkMode ? 'white' : 'black',
                      },
                      '& .MuiClockPointer-root': {
                        backgroundColor: '#0075FF',
                      },
                      '& .MuiClockPointer-thumb': {
                        backgroundColor: '#0075FF',
                        borderColor: '#0075FF',
                      },
                      '& .MuiPickersCalendarHeader-root': {
                        color: darkMode ? 'white' : 'black',
                      },
                      '& .MuiPickersArrowSwitcher-button': {
                        color: darkMode ? 'white' : 'black',
                      },
                      '& .MuiPickersYear-yearButton': {
                        color: darkMode ? 'white' : 'black',
                        '&:hover': {
                          backgroundColor: darkMode ? 'rgba(74, 163, 255, 0.2)' : 'rgba(0, 117, 255, 0.1)',
                        },
                      },
                      '& .MuiPickersYear-yearButton.Mui-selected': {
                        backgroundColor: '#0075FF',
                        color: 'white',
                      },
                      '& .MuiDialogActions-root button': {
                        color: '#0075FF',
                      },
                    }
                  },
                  desktopPaper: {
                    sx: {
                      backgroundColor: darkMode ? 'rgba(10, 18, 48, 0.98)' : 'white',
                      color: darkMode ? 'white' : 'black',
                    }
                  }
                }} 
>>>>>>> Stashed changes
              />
            </Grid>

            {/* Match Duration */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Match Duration</InputLabel>
                <Select value={formData.matchDurationMinutes} onChange={(e) => handleInputChange('matchDurationMinutes', e.target.value)} label="Match Duration">
                  <MenuItem value={15}>15 minutes</MenuItem>
                  <MenuItem value={30}>30 minutes</MenuItem>
                  <MenuItem value={45}>45 minutes</MenuItem>
                  <MenuItem value={60}>60 minutes</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* No-show Wait */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>No-show Wait</InputLabel>
                <Select value={formData.noShowWaitMinutes} onChange={(e) => handleInputChange('noShowWaitMinutes', e.target.value)} label="No-show Wait">
                  <MenuItem value={5}>5 minutes</MenuItem>
                  <MenuItem value={10}>10 minutes</MenuItem>
                  <MenuItem value={15}>15 minutes</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Round Break */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Break Between Rounds</InputLabel>
                <Select value={formData.roundBreakMinutes} onChange={(e) => handleInputChange('roundBreakMinutes', e.target.value)} label="Break Between Rounds">
                  <MenuItem value={5}>5 minutes</MenuItem>
                  <MenuItem value={10}>10 minutes</MenuItem>
                  <MenuItem value={15}>15 minutes</MenuItem>
                  <MenuItem value={30}>30 minutes</MenuItem>
                  <MenuItem value={40}>40 minutes</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Winner XP */}
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Winner XP Reward" type="number" value={formData.winnerXp} onChange={(e) => handleInputChange('winnerXp', parseInt(e.target.value) || 0)} variant="outlined" />
            </Grid>

            {/* Winner Badge */}
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Winner Badge Title" value={formData.winnerBadge} onChange={(e) => handleInputChange('winnerBadge', e.target.value)} variant="outlined" />
            </Grid>

            {/* Match Challenges */}
            <Grid item xs={12}>
              <VuiBox sx={{ p: 2, borderRadius: '12px', border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(148, 163, 184, 0.3)' }}>
                <VuiBox mb={2}>
                  <VuiTypography variant="button" color={darkMode ? 'white' : 'dark'} fontWeight="bold">
                    Match Challenges (each match must have its own challenge)
                  </VuiTypography>
                  <VuiTypography variant="caption" color="text" display="block" mt={0.5}>
                    You need {matchSlots.length} different challenges for the full bracket.
                  </VuiTypography>
                  <VuiTypography variant="caption" color="text" display="block" mt={0.5}>
                    Available challenges: {sortedChallenges.length}
                  </VuiTypography>
                </VuiBox>

                {challengeLoading && <VuiTypography variant="caption" color="text">Loading challenge list...</VuiTypography>}

                {!challengeLoading && sortedChallenges.length === 0 && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    No active challenges found. Please create challenges first.
                  </Alert>
                )}

                {!challengeLoading && sortedChallenges.length > 0 && sortedChallenges.length < matchSlots.length && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    You need at least {matchSlots.length} challenges to assign a unique challenge to each match.
                  </Alert>
                )}

                {!challengeLoading && sortedChallenges.length > 0 && (
                  <Grid container spacing={1.5}>
                    {matchSlots.map((slot) => (
                      <Grid item xs={12} md={6} lg={4} key={slot.key}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={(event) => handleOpenMatchMenu(event, slot.key)}
                          disabled={challengeLoading || sortedChallenges.length === 0}
                          sx={{
                            justifyContent: 'flex-start',
                            textTransform: 'none',
                            py: 1.15,
                            px: 1.4,
                            borderColor: darkMode ? 'rgba(255,255,255,0.28)' : 'rgba(71, 85, 105, 0.4)',
                            color: darkMode ? '#ffffff' : '#0f172a',
                            backgroundColor: darkMode ? 'rgba(10, 19, 58, 0.75)' : '#ffffff',
                            '&:hover': {
                              borderColor: '#4aa3ff',
                              backgroundColor: darkMode ? 'rgba(12, 24, 72, 0.95)' : 'rgba(239, 246, 255, 0.9)',
                            },
                          }}
                        >
                          {formData.matchChallenges[slot.key]
                            ? `${slot.round} - ${slot.label}: ${challengeDisplayById(formData.matchChallenges[slot.key])}`
                            : `${slot.round} - ${slot.label}`}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                )}

                <Menu
                  anchorEl={matchMenuAnchor}
                  open={Boolean(matchMenuAnchor)}
                  onClose={handleCloseMatchMenu}
                  PaperProps={{
                    sx: {
                      maxHeight: 340,
                      minWidth: 360,
                      backgroundColor: darkMode ? 'rgba(9, 15, 48, 0.98)' : '#ffffff',
                      border: darkMode ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(148, 163, 184, 0.35)',
                      '& .MuiMenuItem-root': {
                        color: darkMode ? '#ffffff' : '#0f172a',
                        whiteSpace: 'normal',
                      },
                    },
                  }}
                >
                  <MenuItem onClick={() => handleSelectChallengeForActiveMatch('')}>Clear selection</MenuItem>
                  {(activeMatchKey ? getSelectableChallengesForMatch(activeMatchKey) : []).map((challenge) => (
                    <MenuItem key={`${activeMatchKey}_${challenge._id}`} onClick={() => handleSelectChallengeForActiveMatch(challenge._id)}>
                      {`${challenge.title} (${String(challenge.difficulty || '').toUpperCase()})`}
                    </MenuItem>
                  ))}
                </Menu>
              </VuiBox>
            </Grid>
          </Grid>

          {!allMatchesAssigned && (
            <VuiBox mt={2}>
              <Alert severity="warning">Assign a challenge for every match before creating the tournament.</Alert>
            </VuiBox>
          )}

          {allMatchesAssigned && !uniqueChallengePerMatch && (
            <VuiBox mt={2}>
              <Alert severity="warning">Each match must have a different challenge. You currently have duplicate selections.</Alert>
            </VuiBox>
          )}
        </DialogContent>

        <DialogActions sx={{ padding: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="outlined" startIcon={<IoSparkles size={16} />} onClick={() => navigate('/challenges')}>
            Create Challenge with AI
          </Button>
          <Box>
            <VuiButton variant="outlined" color="secondary" onClick={onClose} disabled={loading} sx={{ mr: 2 }}>
              Cancel
            </VuiButton>
            <VuiButton variant="contained" color="info" onClick={handleCreateTournament} disabled={!canSubmit || loading} startIcon={<IoTrophy />}>
              {loading ? 'Creating...' : 'Create Tournament'}
            </VuiButton>
          </Box>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ComprehensiveTournamentCreator;
