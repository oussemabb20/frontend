import React from 'react';
import { Dialog, DialogTitle, DialogContent, Grid, Card, CardContent, Typography, Box, IconButton, useTheme } from '@mui/material';
import { IoClose, IoTrophy, IoPeople } from 'react-icons/io5';
import VuiBox from 'components/VuiBox';
import VuiTypography from 'components/VuiTypography';
import VuiButton from 'components/VuiButton';
interface TournamentSizeSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelectSize: (size: number) => void;
  darkMode?: boolean;
}
const TOURNAMENT_SIZES = [{
  size: 4,
  name: 'Mini Tournament',
  description: '4 players, 2 rounds',
  rounds: ['Semifinal', 'Final'],
  matches: 3,
  duration: '~30 minutes',
  icon: '🏆'
}, {
  size: 8,
  name: 'Small Tournament',
  description: '8 players, 3 rounds',
  rounds: ['Quarterfinal', 'Semifinal', 'Final'],
  matches: 7,
  duration: '~1 hour',
  icon: '🥇'
}, {
  size: 16,
  name: 'Standard Tournament',
  description: '16 players, 4 rounds',
  rounds: ['Round of 16', 'Quarterfinal', 'Semifinal', 'Final'],
  matches: 15,
  duration: '~2 hours',
  icon: '👑'
}, {
  size: 32,
  name: 'Grand Tournament',
  description: '32 players, 5 rounds',
  rounds: ['Round of 32', 'Round of 16', 'Quarterfinal', 'Semifinal', 'Final'],
  matches: 31,
  duration: '~3 hours',
  icon: '🏅'
}];
const TournamentSizeSelector: React.FC<TournamentSizeSelectorProps> = ({
  open,
  onClose,
  onSelectSize,
  darkMode = false
}) => {
  const theme = useTheme();
  const handleSelectSize = (size: number) => {
    onSelectSize(size);
    onClose();
  };
  return <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{
    sx: {
      backgroundColor: "var(--theme-var-105)",
      color: "var(--theme-var-106)",
      borderRadius: '12px'
    }
  }}>
      <DialogTitle>
        <VuiBox display="flex" justifyContent="space-between" alignItems="center">
          <VuiBox display="flex" alignItems="center" gap={1}>
            <IoTrophy size="24px" color={"var(--theme-var-107)"} />
            <VuiTypography variant="h4" color={"var(--theme-var-108)"} fontWeight="bold">
              Choose Tournament Size
            </VuiTypography>
          </VuiBox>
          <IconButton onClick={onClose} sx={{
          color: "var(--theme-var-109)"
        }}>
            <IoClose />
          </IconButton>
        </VuiBox>
      </DialogTitle>

      <DialogContent>
        <VuiBox mb={2}>
          <VuiTypography variant="body2" color={"var(--theme-var-110)"} textAlign="center">
            Select the number of participants for your tournament
          </VuiTypography>
        </VuiBox>

        <Grid container spacing={2}>
          {TOURNAMENT_SIZES.map(tournament => <Grid item xs={12} sm={6} key={tournament.size}>
              <Card sx={{
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backgroundColor: "var(--theme-var-111)",
            border: `2px solid transparent`,
            '&:hover': {
              border: `2px solid ${"var(--theme-var-112)"}`,
              transform: 'translateY(-4px)',
              boxShadow: "var(--theme-var-113)"
            }
          }} onClick={() => handleSelectSize(tournament.size)}>
                <CardContent>
                  <VuiBox textAlign="center" mb={2}>
                    <Typography variant="h2" sx={{
                  fontSize: '3rem',
                  mb: 1
                }}>
                      {tournament.icon}
                    </Typography>
                    <VuiTypography variant="h5" color={"var(--theme-var-114)"} fontWeight="bold" mb={0.5}>
                      {tournament.name}
                    </VuiTypography>
                    <VuiTypography variant="body2" color={"var(--theme-var-115)"}>
                      {tournament.description}
                    </VuiTypography>
                  </VuiBox>

                  <VuiBox>
                    <VuiBox display="flex" alignItems="center" mb={1}>
                      <IoPeople size="16px" color={"var(--theme-var-116)"} />
                      <VuiTypography variant="caption" color={"var(--theme-var-117)"} ml={1}>
                        {tournament.size} Players
                      </VuiTypography>
                    </VuiBox>

                    <VuiBox display="flex" alignItems="center" mb={1}>
                      <IoTrophy size="16px" color={"var(--theme-var-118)"} />
                      <VuiTypography variant="caption" color={"var(--theme-var-119)"} ml={1}>
                        {tournament.matches} Matches
                      </VuiTypography>
                    </VuiBox>

                    <VuiBox display="flex" alignItems="center" mb={2}>
                      <Box component="span" sx={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: "var(--theme-var-120)",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                        ⏱
                      </Box>
                      <VuiTypography variant="caption" color={"var(--theme-var-121)"} ml={1}>
                        {tournament.duration}
                      </VuiTypography>
                    </VuiBox>

                    <VuiBox>
                      <VuiTypography variant="caption" color={"var(--theme-var-122)"} fontWeight="bold" mb={0.5}>
                        Tournament Rounds:
                      </VuiTypography>
                      <VuiBox display="flex" flexWrap="wrap" gap={0.5}>
                        {tournament.rounds.map((round, index) => <Box key={round} sx={{
                      backgroundColor: "var(--theme-var-123)",
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}>
                            {round}
                          </Box>)}
                      </VuiBox>
                    </VuiBox>
                  </VuiBox>

                  <VuiBox mt={2}>
                    <VuiButton variant="contained" color="info" fullWidth onClick={() => handleSelectSize(tournament.size)}>
                      Select {tournament.size} Players
                    </VuiButton>
                  </VuiBox>
                </CardContent>
              </Card>
            </Grid>)}
        </Grid>
      </DialogContent>
    </Dialog>;
};
export default TournamentSizeSelector;