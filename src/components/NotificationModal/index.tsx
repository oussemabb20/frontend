import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

interface NotificationModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  buttonText?: string;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  open,
  onClose,
  title = 'localhost:5173 says',
  message,
  buttonText = 'OK',
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="notification-modal-title"
      aria-describedby="notification-modal-description"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          backgroundColor: '#1a1a1a',
          borderRadius: '16px',
          padding: '32px',
          minWidth: '400px',
          maxWidth: '600px',
          border: '1px solid #333',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          outline: 'none',
        }}
      >
        <Typography
          id="notification-modal-title"
          variant="h6"
          component="h2"
          sx={{
            color: '#ffffff',
            fontSize: '20px',
            fontWeight: 500,
            marginBottom: '16px',
          }}
        >
          {title}
        </Typography>
        <Typography
          id="notification-modal-description"
          sx={{
            color: '#ffffff',
            fontSize: '16px',
            marginBottom: '32px',
          }}
        >
          {message}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            onClick={onClose}
            sx={{
              backgroundColor: '#b8c7ff',
              color: '#000000',
              borderRadius: '24px',
              padding: '10px 40px',
              fontSize: '16px',
              fontWeight: 500,
              textTransform: 'none',
              border: '2px solid #8a9fff',
              '&:hover': {
                backgroundColor: '#a0b3ff',
              },
            }}
          >
            {buttonText}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default NotificationModal;
