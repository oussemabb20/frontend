import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Avatar, Box, Typography } from '@mui/material';
import VuiButton from 'components/VuiButton';
import VuiTypography from 'components/VuiTypography';
import { IoCall, IoVideocam, IoClose } from 'react-icons/io5';
import { useVisionUIController } from 'context';

function CallNotification({ open, callData, onAccept, onReject }) {
  const [controller] = useVisionUIController();
  const { darkMode } = controller;

  if (!callData) return null;

  const isVideoCall = callData.callType === 'video';
  const callerName = callData.callerUsername || 'Unknown';

  return (
    <Dialog
      open={open}
      onClose={onReject}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          background: darkMode
            ? 'linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.49) 76.65%)'
            : 'linear-gradient(180deg, rgba(255, 255, 255, 0.97) 0%, rgba(241, 245, 249, 0.94) 100%)',
          border: darkMode ? '1px solid rgba(255, 255, 255, 0.125)' : '1px solid rgba(148, 163, 184, 0.18)',
          borderRadius: '20px',
          boxShadow: darkMode
            ? '0 20px 60px rgba(0, 0, 0, 0.5)'
            : '0 20px 60px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: '#0075FF',
              fontSize: '2rem',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': {
                  boxShadow: '0 0 0 0 rgba(0, 117, 255, 0.7)',
                },
                '70%': {
                  boxShadow: '0 0 0 20px rgba(0, 117, 255, 0)',
                },
                '100%': {
                  boxShadow: '0 0 0 0 rgba(0, 117, 255, 0)',
                },
              },
            }}
          >
            {callerName.charAt(0).toUpperCase()}
          </Avatar>
          <VuiTypography variant="h5" color={darkMode ? 'white' : 'dark'} fontWeight="bold">
            {callerName}
          </VuiTypography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={2}>
          {isVideoCall ? (
            <IoVideocam size="24px" color="#0075FF" />
          ) : (
            <IoCall size="24px" color="#0075FF" />
          )}
          <VuiTypography variant="body1" color={darkMode ? 'text' : 'dark'}>
            Incoming {isVideoCall ? 'video' : 'voice'} call
          </VuiTypography>
        </Box>
        <VuiTypography variant="caption" color={darkMode ? 'text' : 'secondary'}>
          {isVideoCall ? 'Turn on your camera to answer' : 'Answer to start talking'}
        </VuiTypography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3, px: 3 }}>
        <VuiButton
          color="error"
          size="large"
          onClick={onReject}
          sx={{
            minWidth: '120px',
            borderRadius: '50px',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <IoClose size="20px" />
          Decline
        </VuiButton>
        <VuiButton
          color="success"
          size="large"
          onClick={onAccept}
          sx={{
            minWidth: '120px',
            borderRadius: '50px',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {isVideoCall ? <IoVideocam size="20px" /> : <IoCall size="20px" />}
          Accept
        </VuiButton>
      </DialogActions>
    </Dialog>
  );
}

export default CallNotification;
