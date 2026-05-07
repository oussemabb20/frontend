import React, { useState, useEffect, useMemo } from 'react';
import {
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
  Button,
  Menu,
  Card,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { IoTrophy, IoSparkles } from 'react-icons/io5';
import VuiBox from 'components/VuiBox';
import VuiTypography from 'components/VuiTypography';
import VuiButton from 'components/VuiButton';
import { tournamentService, CreateTournamentData } from '../../services/tournament.service.js';
import challengeService, { Challenge } from '../../services/challenge.service.js';
import { useNavigate } from 'react-router-dom';

interface InlineTournamentCreatorProps {
  selectedSize: number;
  darkMode?: boolean;
  onTournamentCreated: (tournament: any) => void;
  onCancel: () => void;
}

type MatchSlot = {
  key: string;
  label: string;
  round: string;
};

const InlineTournamentCreator: React.FC<InlineTournamentCreatorProps> = ({
  selectedSize,
  darkMode = false,
  onTournamentCreated,
  onCancel,
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
    startAt: dayjs().add(1, 'hour'),
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
    loadChallenges();
    const initialChallenges: Record<string, string> = {};
    matchSlots.forEach((slot) => {
      initialChallenges[slot.key] = '';
    });
    setFormData((prev) => ({ ...prev, matchChallenges: initialChallenges }));
  }, [selectedSize]);

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
    const now = dayjs();
    const isValidStartTime = formData.startAt && formData.startAt.isValid() && formData.startAt.isAfter(now);
    
    return (
      formData.name.trim().length >= 3 &&
      isValidStartTime &&
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
    } catch (err: any) {
      setError(err.message || 'Failed to create tournament');
    } finally {
      setLoading(false);
    }
  };

  const getSizeInfo = () => {
    const info = {
      4: { rounds: 2, matches: 3 },
      8: { rounds: 3, matches: 7 },
      16: { rounds: 4, matches: 15 },
      32: { rounds: 5, matches: 31 },
    };
    return info[selectedSize as keyof typeof info] || info[16];
  };

  const sizeInfo = getSizeInfo();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <form onSubmit={handleFormSubmit} noValidate>
        <VuiBox>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        {formData.startAt && !formData.startAt.isAfter(dayjs()) && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            The start time must be in the future. Please select a date and time after {dayjs().format('MM/DD/YYYY hh:mm A')}.
          </Alert>
        )}

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
          </Grid>
        </Box>

        <Grid container spacing={3}>
          {/* Tournament Name */}
          <Grid item xs={12} md={6}>
            <TextField 
              fullWidth 
              label="Tournament Name" 
              value={formData.name} 
              onChange={(e) => handleInputChange('name', e.target.value)}
              variant="outlined"
              required={false}
              error={formData.name.trim().length > 0 && formData.name.trim().length < 3}
              helperText={formData.name.trim().length > 0 && formData.name.trim().length < 3 ? 'Tournament name must be at least 3 characters' : ''}
              inputProps={{
                autoComplete: 'off',
                required: false,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: darkMode ? 'white' : 'inherit',
                  '& fieldset': {
                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#4aa3ff',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                },
                '& .MuiFormHelperText-root': {
                  color: darkMode ? '#ff6b6b' : '#d32f2f',
                },
              }}
            />
          </Grid>

          {/* Start Time */}
          <Grid item xs={12} md={6}>
            <DateTimePicker 
              label="Start Time" 
              value={formData.startAt} 
              onChange={(newValue) => handleInputChange('startAt', newValue)} 
              minDateTime={dayjs()}
              sx={{
                width: '100%',
              }}
              slotProps={{ 
                textField: { 
                  fullWidth: true, 
                  variant: 'outlined',
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: darkMode ? '#0f1f35' : 'white',
                      color: darkMode ? '#e0e7ef' : 'inherit',
                      borderRadius: '12px',
                      '& fieldset': {
                        borderColor: darkMode ? '#1e3a52' : 'rgba(0, 0, 0, 0.23)',
                      },
                      '&:hover fieldset': {
                        borderColor: darkMode ? '#2a5a8c' : 'rgba(0, 0, 0, 0.87)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: darkMode ? '#2196f3' : '#1976d2',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: darkMode ? '#6b8aa8' : 'rgba(0, 0, 0, 0.6)',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      '&.Mui-focused': {
                        color: darkMode ? '#6b8aa8' : '#1976d2',
                      },
                    },
                    '& .MuiIconButton-root': {
                      color: darkMode ? '#e0e7ef' : 'inherit',
                    },
                  },
                },
                layout: {
                  sx: {
                    '& .MuiPickersLayout-contentWrapper': {
                      backgroundColor: darkMode ? '#0a1929' : 'white',
                    },
                  },
                },
                popper: {
                  sx: {
                    '& .MuiPaper-root': {
                      backgroundColor: darkMode ? '#0a1929' : 'white',
                      backgroundImage: 'none',
                      borderRadius: '16px',
                      padding: '24px',
                      boxShadow: darkMode ? '0 8px 40px rgba(0, 0, 0, 0.7)' : '0 8px 32px rgba(0, 0, 0, 0.15)',
                    },
                    '& .MuiPickersCalendarHeader-root': {
                      color: darkMode ? '#e0e7ef' : 'inherit',
                      paddingTop: '0',
                      marginBottom: '16px',
                      '& .MuiPickersCalendarHeader-label': {
                        color: darkMode ? '#e0e7ef' : 'inherit',
                        fontSize: '18px',
                        fontWeight: 500,
                      },
                      '& .MuiIconButton-root': {
                        color: darkMode ? '#6b8aa8' : 'inherit',
                      },
                    },
                    '& .MuiDayCalendar-header': {
                      '& .MuiTypography-root': {
                        color: darkMode ? '#6b8aa8' : 'rgba(0, 0, 0, 0.6)',
                        fontSize: '13px',
                        fontWeight: 500,
                      },
                    },
                    '& .MuiPickersDay-root': {
                      color: darkMode ? '#8fa8c4' : 'inherit',
                      backgroundColor: 'transparent',
                      fontSize: '15px',
                      fontWeight: 400,
                      '&:hover': {
                        backgroundColor: darkMode ? 'rgba(33, 150, 243, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                      },
                      '&.Mui-selected': {
                        backgroundColor: darkMode ? '#2196f3' : '#1976d2',
                        color: '#fff',
                        fontWeight: 500,
                        '&:hover': {
                          backgroundColor: darkMode ? '#1e88e5' : '#1565c0',
                        },
                      },
                      '&.MuiPickersDay-today': {
                        border: 'none',
                        backgroundColor: 'transparent',
                      },
                      '&.Mui-disabled': {
                        color: darkMode ? '#2d4a5f' : 'rgba(0, 0, 0, 0.38)',
                      },
                    },
                    '& .MuiPickersDay-dayOutsideMonth': {
                      color: darkMode ? '#2d4a5f' : 'rgba(0, 0, 0, 0.38)',
                    },
                    '& .MuiMultiSectionDigitalClock-root': {
                      backgroundColor: darkMode ? '#0f1f35' : 'transparent',
                      borderRadius: '12px',
                      padding: '16px',
                      marginTop: '16px',
                    },
                    '& .MuiMultiSectionDigitalClockSection-root': {
                      '& .MuiMenuItem-root': {
                        color: darkMode ? '#8fa8c4' : 'inherit',
                        fontSize: '20px',
                        fontWeight: 500,
                        justifyContent: 'center',
                        '&.Mui-selected': {
                          backgroundColor: 'transparent',
                          color: darkMode ? '#e0e7ef' : '#1976d2',
                          fontWeight: 600,
                          fontSize: '24px',
                        },
                      },
                    },
                    '& .MuiDialogActions-root': {
                      padding: '16px 0 0',
                      '& .MuiButton-root': {
                        fontSize: '14px',
                        textTransform: 'none',
                        borderRadius: '8px',
                        padding: '10px 24px',
                        fontWeight: 500,
                        '&:first-of-type': {
                          color: darkMode ? '#6b8aa8' : 'rgba(0, 0, 0, 0.6)',
                          border: darkMode ? '1px solid #1e3a52' : '1px solid rgba(0, 0, 0, 0.23)',
                        },
                        '&:last-child': {
                          backgroundColor: darkMode ? '#2196f3' : '#1976d2',
                          color: '#fff',
                          fontWeight: 600,
                        },
                      },
                    },
                  },
                },
              }} 
            />
          </Grid>

          {/* Match Duration */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}>Match Duration</InputLabel>
              <Select 
                value={formData.matchDurationMinutes} 
                onChange={(e) => handleInputChange('matchDurationMinutes', e.target.value)} 
                label="Match Duration"
                sx={{
                  color: darkMode ? 'white' : 'inherit',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#4aa3ff',
                  },
                  '& .MuiSvgIcon-root': {
                    color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'inherit',
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: darkMode ? '#0a1230' : 'white',
                      color: darkMode ? 'white' : 'black',
                    },
                  },
                }}
              >
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
              <InputLabel sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}>No-show Wait</InputLabel>
              <Select 
                value={formData.noShowWaitMinutes} 
                onChange={(e) => handleInputChange('noShowWaitMinutes', e.target.value)} 
                label="No-show Wait"
                sx={{
                  color: darkMode ? 'white' : 'inherit',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#4aa3ff',
                  },
                  '& .MuiSvgIcon-root': {
                    color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'inherit',
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: darkMode ? '#0a1230' : 'white',
                      color: darkMode ? 'white' : 'black',
                    },
                  },
                }}
              >
                <MenuItem value={5}>5 minutes</MenuItem>
                <MenuItem value={10}>10 minutes</MenuItem>
                <MenuItem value={15}>15 minutes</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Round Break */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}>Break Between Rounds</InputLabel>
              <Select 
                value={formData.roundBreakMinutes} 
                onChange={(e) => handleInputChange('roundBreakMinutes', e.target.value)} 
                label="Break Between Rounds"
                sx={{
                  color: darkMode ? 'white' : 'inherit',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#4aa3ff',
                  },
                  '& .MuiSvgIcon-root': {
                    color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'inherit',
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: darkMode ? '#0a1230' : 'white',
                      color: darkMode ? 'white' : 'black',
                    },
                  },
                }}
              >
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
            <TextField 
              fullWidth 
              label="Winner XP Reward" 
              type="number" 
              value={formData.winnerXp} 
              onChange={(e) => handleInputChange('winnerXp', parseInt(e.target.value) || 0)}
              variant="outlined"
              required={false}
              inputProps={{
                min: 1,
                required: false,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: darkMode ? 'white' : 'inherit',
                  '& fieldset': {
                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#4aa3ff',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                },
              }}
            />
          </Grid>

          {/* Winner Badge */}
          <Grid item xs={12} md={6}>
            <TextField 
              fullWidth 
              label="Winner Badge Title" 
              value={formData.winnerBadge} 
              onChange={(e) => handleInputChange('winnerBadge', e.target.value)}
              variant="outlined"
              required={false}
              error={formData.winnerBadge.trim().length > 0 && formData.winnerBadge.trim().length < 3}
              helperText={formData.winnerBadge.trim().length > 0 && formData.winnerBadge.trim().length < 3 ? 'Badge title must be at least 3 characters' : ''}
              inputProps={{
                autoComplete: 'off',
                required: false,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: darkMode ? 'white' : 'inherit',
                  '& fieldset': {
                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#4aa3ff',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                },
              }}
            />
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
                          color: darkMode ? 'white' : 'inherit',
                          borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                          '&:hover': {
                            borderColor: darkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
                            backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
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
                    backgroundColor: darkMode ? '#0a1230' : 'white',
                    color: darkMode ? 'white' : 'black',
                  },
                }}
              >
                <MenuItem 
                  onClick={() => handleSelectChallengeForActiveMatch('')}
                  sx={{
                    color: darkMode ? 'white' : 'inherit',
                    '&:hover': {
                      backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  Clear selection
                </MenuItem>
                {(activeMatchKey ? getSelectableChallengesForMatch(activeMatchKey) : []).map((challenge) => (
                  <MenuItem 
                    key={`${activeMatchKey}_${challenge._id}`} 
                    onClick={() => handleSelectChallengeForActiveMatch(challenge._id)}
                    sx={{
                      color: darkMode ? 'white' : 'inherit',
                      '&:hover': {
                        backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                  >
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

        <VuiBox display="flex" justifyContent="space-between" alignItems="center" mt={3} gap={2}>
          <Button 
            type="button"
            variant="outlined" 
            startIcon={<IoSparkles size={16} />} 
            onClick={(e) => {
              e.preventDefault();
              navigate('/challenges');
            }}
          >
            Create Challenge with AI
          </Button>
          <Box>
            <VuiButton 
              type="button"
              variant="outlined" 
              color="secondary" 
              onClick={(e) => {
                e.preventDefault();
                onCancel();
              }} 
              disabled={loading} 
              sx={{ mr: 2 }}
            >
              Cancel
            </VuiButton>
            <VuiButton 
              type="button"
              variant="contained" 
              color="info" 
              onClick={(e) => {
                e.preventDefault();
                handleCreateTournament();
              }} 
              disabled={!canSubmit || loading} 
              startIcon={<IoTrophy />}
            >
              {loading ? 'Creating...' : 'Create Tournament'}
            </VuiButton>
          </Box>
        </VuiBox>
        </VuiBox>
      </form>
    </LocalizationProvider>
  );
};

export default InlineTournamentCreator;
