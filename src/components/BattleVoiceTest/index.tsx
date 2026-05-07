import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography, Alert } from '@mui/material';
import battleService from '../../services/battle.service.js';

/**
 * Simple test component for battle voice chat
 * Use this to debug voice connection issues
 */
const BattleVoiceTest: React.FC<{ battleId: string; opponentUserId: string }> = ({
  battleId,
  opponentUserId,
}) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  const addLog = (message: string) => {
    console.log(`[VoiceTest] ${message}`);
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    // Initialize socket
    const token = localStorage.getItem('accessToken');
    battleService.initializeSocket(token ?? undefined);

    addLog('Socket initialized');

    // Setup listeners
    const unsubOffer = battleService.onVoiceOffer((data) => {
      addLog(`Received offer from ${data.username}`);
      handleOffer(data);
    });

    const unsubAnswer = battleService.onVoiceAnswer((data) => {
      addLog(`Received answer from ${data.username}`);
      handleAnswer(data);
    });

    const unsubIce = battleService.onVoiceIceCandidate((data) => {
      addLog('Received ICE candidate');
      handleIceCandidate(data);
    });

    return () => {
      unsubOffer();
      unsubAnswer();
      unsubIce();
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
  };

  const startVoice = async () => {
    try {
      setError('');
      setStatus('starting');
      addLog('Starting voice chat...');

      // Get microphone
      addLog('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      localStreamRef.current = stream;
      addLog('✅ Microphone access granted');

      // Create peer connection
      addLog('Creating peer connection...');
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });
      peerConnectionRef.current = pc;

      // Add tracks
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
        addLog(`Added ${track.kind} track`);
      });

      // Setup handlers
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          addLog('Sending ICE candidate');
          battleService.sendVoiceIceCandidate(battleId, opponentUserId, event.candidate.toJSON());
        }
      };

      pc.ontrack = (event) => {
        addLog('✅ Received remote track');
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
          remoteAudioRef.current.play();
        }
        setStatus('connected');
      };

      pc.onconnectionstatechange = () => {
        addLog(`Connection state: ${pc.connectionState}`);
        if (pc.connectionState === 'connected') {
          setStatus('connected');
        } else if (pc.connectionState === 'failed') {
          setError('Connection failed');
          setStatus('failed');
        }
      };

      // Create and send offer
      addLog('Creating offer...');
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      addLog('Sending offer...');
      battleService.sendVoiceOffer(battleId, opponentUserId, offer);
      setStatus('connecting');
    } catch (err: any) {
      addLog(`❌ Error: ${err.message}`);
      setError(err.message);
      setStatus('error');
    }
  };

  const handleOffer = async (data: any) => {
    try {
      addLog('Handling incoming offer...');

      // Get microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });
      peerConnectionRef.current = pc;

      // Add tracks
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Setup handlers
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          battleService.sendVoiceIceCandidate(battleId, data.userId, event.candidate.toJSON());
        }
      };

      pc.ontrack = (event) => {
        addLog('✅ Received remote track');
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
          remoteAudioRef.current.play();
        }
        setStatus('connected');
      };

      // Set remote description
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      addLog('Set remote description');

      // Create answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      addLog('Sending answer...');
      battleService.sendVoiceAnswer(battleId, data.userId, answer);
      setStatus('connecting');
    } catch (err: any) {
      addLog(`❌ Error handling offer: ${err.message}`);
      setError(err.message);
    }
  };

  const handleAnswer = async (data: any) => {
    try {
      if (!peerConnectionRef.current) {
        addLog('❌ No peer connection');
        return;
      }
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      addLog('✅ Set remote description from answer');
    } catch (err: any) {
      addLog(`❌ Error handling answer: ${err.message}`);
    }
  };

  const handleIceCandidate = async (data: any) => {
    try {
      if (!peerConnectionRef.current) {
        addLog('❌ No peer connection for ICE');
        return;
      }
      await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      addLog('✅ Added ICE candidate');
    } catch (err: any) {
      addLog(`❌ Error adding ICE: ${err.message}`);
    }
  };

  return (
    <Box sx={{ p: 3, border: '2px solid #0075FF', borderRadius: 2, backgroundColor: '#0a0e27' }}>
      <Typography variant="h6" color="white" mb={2}>
        🔧 Voice Chat Debug Tool
      </Typography>

      <Box mb={2}>
        <Typography variant="body2" color="white">
          Battle ID: {battleId}
        </Typography>
        <Typography variant="body2" color="white">
          Opponent ID: {opponentUserId}
        </Typography>
        <Typography variant="body2" color="white">
          Status: {status}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button variant="contained" onClick={startVoice} disabled={status === 'connecting' || status === 'connected'}>
        Start Voice Test
      </Button>

      <Box
        mt={2}
        p={2}
        sx={{
          backgroundColor: '#000',
          borderRadius: 1,
          maxHeight: 300,
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '12px',
        }}
      >
        {logs.map((log, i) => (
          <Typography key={i} variant="caption" color="lime" display="block">
            {log}
          </Typography>
        ))}
      </Box>

      <audio ref={remoteAudioRef} autoPlay />
    </Box>
  );
};

export default BattleVoiceTest;
