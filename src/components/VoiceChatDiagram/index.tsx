import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

/**
 * Visual diagram showing how voice chat works
 * Based on the 4-phase WebRTC flow
 */
const VoiceChatDiagram: React.FC = () => {
  const phases = [
    {
      title: 'PHASE 1 — SIGNALING',
      subtitle: 'The handshake',
      description: 'Players exchange connection info via WebSocket server',
      color: '#4a90e2',
      steps: [
        'Player 1 sends offer → Signaling server → Player 2',
        'Player 2 sends answer → Signaling server → Player 1',
        'ICE candidates exchanged (network path info)',
      ],
    },
    {
      title: 'PHASE 2 — CONNECTION',
      subtitle: 'P2P tunnel established',
      description: 'STUN server helps discover public IPs',
      color: '#f39c12',
      steps: [
        'Both players create RTCPeerConnection',
        'STUN server discovers public IP addresses',
        'Direct P2P connection opens',
        'Server no longer needed',
      ],
    },
    {
      title: 'PHASE 3 — LIVE AUDIO',
      subtitle: 'Real-time streaming',
      description: 'Audio flows directly between players',
      color: '#27ae60',
      steps: [
        'Mic captured with getUserMedia()',
        'Audio compressed with Opus codec (~20ms packets)',
        'Sent directly to other player',
        'Played instantly on speaker',
        'Latency: 20-150ms',
      ],
    },
    {
      title: 'PHASE 4 — MIC TOGGLE',
      subtitle: 'Instant control',
      description: 'Simple one-line toggle',
      color: '#e74c3c',
      steps: [
        'Mic ON: track.enabled = true',
        'Mic OFF: track.enabled = false',
        'Stream stays open',
        'Toggle is instant',
      ],
    },
  ];

  return (
    <Box
      sx={{
        padding: 4,
        backgroundColor: '#0a0e27',
        minHeight: '100vh',
      }}
    >
      <Typography
        variant="h3"
        sx={{
          color: '#ffffff',
          textAlign: 'center',
          marginBottom: 4,
          fontWeight: 'bold',
        }}
      >
        Voice Chat Architecture
      </Typography>

      <Typography
        variant="h6"
        sx={{
          color: '#b0b0b0',
          textAlign: 'center',
          marginBottom: 6,
          maxWidth: 800,
          margin: '0 auto 48px',
        }}
      >
        How 1v1 voice chat works from start to finish
      </Typography>

      {phases.map((phase, index) => (
        <Paper
          key={index}
          elevation={3}
          sx={{
            padding: 3,
            marginBottom: 3,
            backgroundColor: '#1a1f3a',
            borderLeft: `6px solid ${phase.color}`,
            maxWidth: 900,
            margin: '0 auto 24px',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: phase.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 2,
                fontWeight: 'bold',
                color: '#ffffff',
              }}
            >
              {index + 1}
            </Box>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  color: '#ffffff',
                  fontWeight: 'bold',
                }}
              >
                {phase.title}
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{
                  color: phase.color,
                  fontStyle: 'italic',
                }}
              >
                {phase.subtitle}
              </Typography>
            </Box>
          </Box>

          <Typography
            variant="body1"
            sx={{
              color: '#b0b0b0',
              marginBottom: 2,
            }}
          >
            {phase.description}
          </Typography>

          <Box sx={{ paddingLeft: 2 }}>
            {phase.steps.map((step, stepIndex) => (
              <Box
                key={stepIndex}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: 1,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: phase.color,
                    marginRight: 2,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: '#e0e0e0',
                  }}
                >
                  {step}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      ))}

      {/* Summary Box */}
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          marginTop: 4,
          backgroundColor: '#2d3561',
          maxWidth: 900,
          margin: '48px auto 0',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: '#ffffff',
            marginBottom: 2,
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          Key Takeaways
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ color: '#4a90e2', fontWeight: 'bold' }}>
              ⚡ Low Latency
            </Typography>
            <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
              20-150ms typical latency, fast enough for real-time gaming
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ color: '#27ae60', fontWeight: 'bold' }}>
              🔒 Secure & Private
            </Typography>
            <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
              P2P connection means audio never touches the server
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ color: '#f39c12', fontWeight: 'bold' }}>
              🎵 High Quality
            </Typography>
            <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
              Opus codec provides HD voice quality with low bandwidth
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ color: '#e74c3c', fontWeight: 'bold' }}>
              🎮 Simple Control
            </Typography>
            <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
              One-line code to toggle mic on/off instantly
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default VoiceChatDiagram;
