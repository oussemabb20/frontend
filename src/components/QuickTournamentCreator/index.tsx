import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, FormControl, InputLabel, Select, MenuItem, Alert, Box, IconButton } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { IoClose, IoTrophy, IoCalendar, IoTime, IoGift } from 'react-icons/io5';
import VuiBox from 'components/VuiBox';
import VuiTypography from 'components/VuiTypography';
import VuiButton from 'components/VuiButton';
import { tournamentService, CreateTournamentData } from '../../services/tournament.service.js';
interface QuickTournamentCreatorProps {
  open: boolean;
  onClose: () => void;
  onTournamentCreated: (tournament: any) => void;
  selectedSize: number;
  darkMode?: boolean;
}
const QuickTournamentCreator: React.FC<QuickTournamentCreatorProps> = ({
  open,
  onClose,
  onTournamentCreated,
  selectedSize,
  darkMode = false
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: `${selectedSize}-Player Tournament`,
    startAt: new Date(Date.now() + 60 * 60 * 1000),
    // 1 hour from now
    matchDurationMinutes: 30,
    noShowWaitMinutes: 5,
    roundBreakMinutes: selectedSize <= 8 ? 5 : 10,
    winnerXp: selectedSize * 100,
    // Scale XP with tournament size
    winnerBadge: `${selectedSize}-Player Champion`
  });
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };
  const handleCreateTournament = async () => {
    if (!formData.name.trim()) {
      setError('Tournament name is required');
      return;
    }
    if (formData.startAt <= new Date()) {
      setError('Start time must be in the future');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const tournamentData: CreateTournamentData = {
        name: formData.name.trim(),
        maxParticipants: selectedSize,
        startAt: formData.startAt.toISOString(),
        matchDurationMinutes: formData.matchDurationMinutes,
        noShowWaitMinutes: formData.noShowWaitMinutes,
        roundBreakMinutes: formData.roundBreakMinutes,
        winnerXp: formData.winnerXp,
        winnerBadge: formData.winnerBadge
      };
      const tournament = await tournamentService.createTournament(tournamentData);
      onTournamentCreated(tournament);
      onClose();

      // Reset form
      setFormData({
        name: `${selectedSize}-Player Tournament`,
        startAt: new Date(Date.now() + 60 * 60 * 1000),
        matchDurationMinutes: 30,
        noShowWaitMinutes: 5,
        roundBreakMinutes: selectedSize <= 8 ? 5 : 10,
        winnerXp: selectedSize * 100,
        winnerBadge: `${selectedSize}-Player Champion`
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create tournament');
    } finally {
      setLoading(false);
    }
  };
  const getSizeInfo = () => {
    const info = {
      4: {
        rounds: 2,
        matches: 3,
        duration: '~30 min'
      },
      8: {
        rounds: 3,
        matches: 7,
        duration: '~1 hour'
      },
      16: {
        rounds: 4,
        matches: 15,
        duration: '~2 hours'
      },
      32: {
        rounds: 5,
        matches: 31,
        duration: '~3 hours'
      }
    };
    return info[selectedSize as keyof typeof info] || info[16];
  };
  const sizeInfo = getSizeInfo();
  return <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{
      sx: {
        backgroundColor: "var(--theme-var-64)",
        color: "var(--theme-var-65)",
        borderRadius: '12px'
      }
    }}>
        <DialogTitle>
          <VuiBox display="flex" justifyContent="space-between" alignItems="center">
            <VuiBox display="flex" alignItems="center" gap={1}>
              <IoTrophy size="24px" color={"var(--theme-var-66)"} />
              <VuiTypography variant="h4" color={"var(--theme-var-67)"} fontWeight="bold">
                Create {selectedSize}-Player Tournament
              </VuiTypography>
            </VuiBox>
            <IconButton onClick={onClose} sx={{
            color: "var(--theme-var-68)"
          }}>
              <IoClose />
            </IconButton>
          </VuiBox>
        </DialogTitle>

        <DialogContent>
          {error && <Alert severity="error" sx={{
          mb: 2
        }}>
              {error}
            </Alert>}

          {/* Tournament Info Summary */}
          <Box sx={{
          backgroundColor: "var(--theme-var-69)",
          padding: 2,
          borderRadius: 2,
          mb: 3,
          border: `1px solid ${"var(--theme-var-70)"}`
        }}>
            <VuiTypography variant="h6" color={"var(--theme-var-71)"} mb={1}>
              Tournament Overview
            </VuiTypography>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <VuiTypography variant="caption" color={"var(--theme-var-72)"}>
                  Players
                </VuiTypography>
                <VuiTypography variant="body2" color={"var(--theme-var-73)"} fontWeight="bold">
                  {selectedSize}
                </VuiTypography>
              </Grid>
              <Grid item xs={3}>
                <VuiTypography variant="caption" color={"var(--theme-var-74)"}>
                  Rounds
                </VuiTypography>
                <VuiTypography variant="body2" color={"var(--theme-var-75)"} fontWeight="bold">
                  {sizeInfo.rounds}
                </VuiTypography>
              </Grid>
              <Grid item xs={3}>
                <VuiTypography variant="caption" color={"var(--theme-var-76)"}>
                  Matches
                </VuiTypography>
                <VuiTypography variant="body2" color={"var(--theme-var-77)"} fontWeight="bold">
                  {sizeInfo.matches}
                </VuiTypography>
              </Grid>
              <Grid item xs={3}>
                <VuiTypography variant="caption" color={"var(--theme-var-78)"}>
                  Duration
                </VuiTypography>
                <VuiTypography variant="body2" color={"var(--theme-var-79)"} fontWeight="bold">
                  {sizeInfo.duration}
                </VuiTypography>
              </Grid>
            </Grid>
          </Box>

          <Grid container spacing={3}>
            {/* Tournament Name */}
            <Grid item xs={12}>
              <TextField fullWidth label="Tournament Name" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} variant="outlined" InputProps={{
              style: {
                color: "var(--theme-var-80)"
              }
            }} InputLabelProps={{
              style: {
                color: "var(--theme-var-81)"
              }
            }} sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: "var(--theme-var-82)"
                },
                '&:hover fieldset': {
                  borderColor: "var(--theme-var-83)"
                }
              }
            }} />
            </Grid>

            {/* Start Time */}
            <Grid item xs={12} md={6}>
              <DateTimePicker 
                label="Start Time" 
                value={formData.startAt} 
                onChange={newValue => handleInputChange('startAt', newValue)} 
<<<<<<< Updated upstream
                minDateTime={new Date()}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    variant="outlined"
                    InputProps={{
                      style: {
                        color: "var(--theme-var-84)"
                      }
                    }}
                    InputLabelProps={{
                      style: {
                        color: "var(--theme-var-85)"
                      }
                    }}
                  />
                )}
=======
                minDateTime={new Date()} 
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined',
                    onClick: (e) => e.stopPropagation(),
                    InputProps: {
                      style: {
                        color: "var(--theme-var-84)"
                      }
                    },
                    InputLabelProps: {
                      style: {
                        color: "var(--theme-var-85)"
                      }
                    }
                  },
                  popper: {
                    disablePortal: false,
                    placement: 'bottom-start',
                    sx: {
                      zIndex: 1400,
                    }
                  },
                  desktopPaper: {
                    sx: {
                      backgroundColor: "var(--theme-var-64)",
                      color: "var(--theme-var-65)",
                    }
                  }
                }} 
>>>>>>> Stashed changes
              />
            </Grid>

            {/* Match Duration */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel sx={{
                color: "var(--theme-var-86)"
              }}>
                  Match Duration
                </InputLabel>
                <Select value={formData.matchDurationMinutes} onChange={e => handleInputChange('matchDurationMinutes', e.target.value)} label="Match Duration" sx={{
                color: "var(--theme-var-87)",
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: "var(--theme-var-88)"
                }
              }}>
                  <MenuItem value={15}>15 minutes</MenuItem>
                  <MenuItem value={30}>30 minutes</MenuItem>
                  <MenuItem value={45}>45 minutes</MenuItem>
                  <MenuItem value={60}>60 minutes</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Round Break */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel sx={{
                color: "var(--theme-var-89)"
              }}>
                  Break Between Rounds
                </InputLabel>
                <Select value={formData.roundBreakMinutes} onChange={e => handleInputChange('roundBreakMinutes', e.target.value)} label="Break Between Rounds" sx={{
                color: "var(--theme-var-90)",
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: "var(--theme-var-91)"
                }
              }}>
                  <MenuItem value={5}>5 minutes</MenuItem>
                  <MenuItem value={10}>10 minutes</MenuItem>
                  <MenuItem value={15}>15 minutes</MenuItem>
                  <MenuItem value={30}>30 minutes</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Winner XP */}
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Winner XP Reward" type="number" value={formData.winnerXp} onChange={e => handleInputChange('winnerXp', parseInt(e.target.value) || 0)} variant="outlined" InputProps={{
              style: {
                color: "var(--theme-var-92)"
              }
            }} InputLabelProps={{
              style: {
                color: "var(--theme-var-93)"
              }
            }} sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: "var(--theme-var-94)"
                }
              }
            }} />
            </Grid>

            {/* Winner Badge */}
            <Grid item xs={12}>
              <TextField fullWidth label="Winner Badge Title" value={formData.winnerBadge} onChange={e => handleInputChange('winnerBadge', e.target.value)} variant="outlined" InputProps={{
              style: {
                color: "var(--theme-var-95)"
              }
            }} InputLabelProps={{
              style: {
                color: "var(--theme-var-96)"
              }
            }} sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: "var(--theme-var-97)"
                }
              }
            }} />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{
        padding: 3
      }}>
          <VuiButton variant="outlined" color="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </VuiButton>
          <VuiButton variant="contained" color="info" onClick={handleCreateTournament} disabled={loading} startIcon={<IoTrophy />}>
            {loading ? 'Creating...' : 'Create Tournament'}
          </VuiButton>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>;
};
export default QuickTournamentCreator;