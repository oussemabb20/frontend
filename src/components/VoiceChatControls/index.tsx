import React from 'react';
import { Box, IconButton, Tooltip, Typography, Chip } from '@mui/material';
import {
  Mic,
  MicOff,
  Phone,
  PhoneDisabled,
  SignalCellularAlt,
} from '@mui/icons-material';
import { useVoiceChat } from '../../hooks/useVoiceChat.js';

interface VoiceChatControlsProps {
  battleId: string;
  userId: string;
  autoConnect?: boolean;
  onPeerJoined?: (userId: string) => void;
  onPeerLeft?: (userId: string) => void;
}

const VoiceChatControls: React.FC<VoiceChatControlsProps> = ({
  battleId,
  userId,
  autoConnect = false,
  onPeerJoined,
  onPeerLeft,
}) => {
  const {
    isConnected,
    isMuted,
    connectionState,
    connect,
    disconnect,
    toggleMute,
    error,
  } = useVoiceChat({
    battleId,
    userId,
    autoConnect,
    onPeerJoined,
    onPeerLeft,
    onError: (err) => console.error('[VoiceChatControls] Error:', err),
  });

  const getConnectionStateColor = () => {
    switch (connectionState) {
      case 'connected':
        return '#00ff00';
      case 'connecting':
        return '#ffaa00';
      case 'disconnected':
      case 'failed':
        return '#ff0000';
      default:
        return '#888888';
    }
  };

  const getConnectionStateText = () => {
    switch (connectionState) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      case 'failed':
        return 'Connection Failed';
      default:
        return 'Not Connected';
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 2,
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Connection Status */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SignalCellularAlt sx={{ color: getConnectionStateColor(), fontSize: 20 }} />
        <Chip
          label={getConnectionStateText()}
          size="small"
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: getConnectionStateColor(),
            fontSize: '12px',
          }}
        />
      </Box>

      {/* Connect/Disconnect Button */}
      {!isConnected ? (
        <Tooltip title="Connect Voice Chat">
          <IconButton
            onClick={connect}
            sx={{
              backgroundColor: '#00aa00',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: '#00cc00',
              },
            }}
          >
            <Phone />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Disconnect Voice Chat">
          <IconButton
            onClick={disconnect}
            sx={{
              backgroundColor: '#cc0000',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: '#ff0000',
              },
            }}
          >
            <PhoneDisabled />
          </IconButton>
        </Tooltip>
      )}

      {/* Mute/Unmute Button */}
      <Tooltip title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}>
        <span>
          <IconButton
            onClick={toggleMute}
            disabled={!isConnected}
            sx={{
              backgroundColor: isMuted ? '#ff6b6b' : '#4a90e2',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: isMuted ? '#ff5252' : '#357abd',
              },
              '&:disabled': {
                backgroundColor: '#333333',
                color: '#666666',
              },
            }}
          >
            {isMuted ? <MicOff /> : <Mic />}
          </IconButton>
        </span>
      </Tooltip>

      {/* Error Display */}
      {error && (
        <Typography
          variant="caption"
          sx={{
            color: '#ff6b6b',
            maxWidth: 200,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          Error: {error.message}
        </Typography>
      )}
    </Box>
  );
};

export default VoiceChatControls;
