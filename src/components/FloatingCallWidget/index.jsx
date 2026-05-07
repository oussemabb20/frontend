import React, { useRef, useEffect } from 'react';
import { Box, Avatar, IconButton, Typography } from '@mui/material';
import { IoCall, IoVideocam, IoMic, IoMicOff, IoVideocamOff, IoClose } from 'react-icons/io5';
import { useVisionUIController } from 'context';

function FloatingCallWidget({ 
  isActive, 
  callType, 
  callerName, 
  callStatus, 
  onEndCall,
  localStream,
  remoteStream,
  isMuted,
  onToggleMute,
  isVideoOff,
  onToggleVideo
}) {
  const [controller] = useVisionUIController();
  const { darkMode } = controller;
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream && callType === 'video') {
      remoteVideoRef.current.srcObject = remoteStream;
    }
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callType]);

  if (!isActive) return null;

  const isVideoCall = callType === 'video';

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: isVideoCall ? 400 : 320,
        background: darkMode
          ? 'linear-gradient(127.09deg, rgba(6, 11, 40, 0.98) 19.41%, rgba(10, 14, 35, 0.95) 76.65%)'
          : 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(241, 245, 249, 0.95) 100%)',
        border: darkMode ? '1px solid rgba(255, 255, 255, 0.125)' : '1px solid rgba(148, 163, 184, 0.25)',
        borderRadius: '20px',
        boxShadow: darkMode
          ? '0 20px 60px rgba(0, 0, 0, 0.6)'
          : '0 20px 60px rgba(0, 0, 0, 0.2)',
        zIndex: 9999,
        overflow: 'hidden',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Video Display (if video call) */}
      {isVideoCall && (
        <Box sx={{ position: 'relative', width: '100%', height: 250, bgcolor: '#000' }}>
          {/* Remote Video (large) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          
          {/* Local Video (small, picture-in-picture) */}
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              width: 100,
              height: 75,
              borderRadius: '12px',
              overflow: 'hidden',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              bgcolor: '#000',
            }}
          >
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)', // Mirror effect
              }}
            />
          </Box>
        </Box>
      )}

      {/* Audio element for voice calls */}
      <audio ref={remoteAudioRef} autoPlay />

      {/* Call Info */}
      <Box sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Avatar sx={{ bgcolor: '#0075FF', width: 48, height: 48 }}>
            {callerName?.charAt(0).toUpperCase() || '?'}
          </Avatar>
          <Box flex={1}>
            <Typography
              variant="h6"
              sx={{
                color: darkMode ? 'white' : '#0f172a',
                fontWeight: 600,
                fontSize: '1rem',
              }}
            >
              {callerName || 'Unknown'}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: darkMode ? 'rgba(226, 232, 240, 0.7)' : 'rgba(15, 23, 42, 0.6)',
                fontSize: '0.75rem',
              }}
            >
              {callStatus || 'In call'}
            </Typography>
          </Box>
          <IconButton
            onClick={onEndCall}
            sx={{
              bgcolor: '#ef4444',
              color: 'white',
              '&:hover': {
                bgcolor: '#dc2626',
              },
              width: 36,
              height: 36,
            }}
          >
            <IoClose size="20px" />
          </IconButton>
        </Box>

        {/* Call Controls */}
        <Box display="flex" justifyContent="center" gap={2}>
          {/* Mute/Unmute */}
          <IconButton
            onClick={onToggleMute}
            sx={{
              bgcolor: isMuted ? '#ef4444' : darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              color: isMuted ? 'white' : darkMode ? 'white' : '#0f172a',
              '&:hover': {
                bgcolor: isMuted ? '#dc2626' : darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
              },
              width: 44,
              height: 44,
            }}
          >
            {isMuted ? <IoMicOff size="20px" /> : <IoMic size="20px" />}
          </IconButton>

          {/* Video On/Off (only for video calls) */}
          {isVideoCall && (
            <IconButton
              onClick={onToggleVideo}
              sx={{
                bgcolor: isVideoOff ? '#ef4444' : darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                color: isVideoOff ? 'white' : darkMode ? 'white' : '#0f172a',
                '&:hover': {
                  bgcolor: isVideoOff ? '#dc2626' : darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                },
                width: 44,
                height: 44,
              }}
            >
              {isVideoOff ? <IoVideocamOff size="20px" /> : <IoVideocam size="20px" />}
            </IconButton>
          )}

          {/* End Call */}
          <IconButton
            onClick={onEndCall}
            sx={{
              bgcolor: '#ef4444',
              color: 'white',
              '&:hover': {
                bgcolor: '#dc2626',
              },
              width: 44,
              height: 44,
            }}
          >
            <IoCall size="20px" style={{ transform: 'rotate(135deg)' }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

export default FloatingCallWidget;
