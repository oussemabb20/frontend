import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceChatService } from '../services/voiceChat.service.js';

interface UseVoiceChatOptions {
  battleId: string;
  userId: string;
  autoConnect?: boolean;
  onPeerJoined?: (userId: string) => void;
  onPeerLeft?: (userId: string) => void;
  onError?: (error: Error) => void;
}

interface UseVoiceChatReturn {
  isConnected: boolean;
  isMuted: boolean;
  connectionState: RTCPeerConnectionState | null;
  remoteStream: MediaStream | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
  error: Error | null;
}

export const useVoiceChat = (options: UseVoiceChatOptions): UseVoiceChatReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const voiceChatRef = useRef<VoiceChatService | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  const connect = useCallback(async () => {
    try {
      setError(null);
      
      // Create voice chat service
      voiceChatRef.current = new VoiceChatService({
        battleId: options.battleId,
        userId: options.userId,
        onPeerJoined: options.onPeerJoined,
        onPeerLeft: (userId) => {
          setRemoteStream(null);
          options.onPeerLeft?.(userId);
        },
        onConnectionStateChange: (state) => {
          setConnectionState(state);
          if (state === 'connected') {
            // Get and set remote stream when connected
            const stream = voiceChatRef.current?.getRemoteStream();
            if (stream) {
              setRemoteStream(stream);
            }
          }
        },
        onError: (err) => {
          setError(err);
          options.onError?.(err);
        },
      });

      // Connect to signaling server
      await voiceChatRef.current.connect();
      
      // Start capturing audio
      await voiceChatRef.current.startAudio();
      
      setIsConnected(true);
      console.log('[useVoiceChat] Connected successfully');
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
      console.error('[useVoiceChat] Connection failed:', error);
    }
  }, [options]);

  const disconnect = useCallback(() => {
    if (voiceChatRef.current) {
      voiceChatRef.current.disconnect();
      voiceChatRef.current = null;
    }
    setIsConnected(false);
    setRemoteStream(null);
    setConnectionState(null);
    console.log('[useVoiceChat] Disconnected');
  }, []);

  const toggleMute = useCallback(() => {
    if (voiceChatRef.current) {
      const newMutedState = voiceChatRef.current.toggleMute();
      setIsMuted(newMutedState);
    }
  }, []);

  const setMutedState = useCallback((muted: boolean) => {
    if (voiceChatRef.current) {
      voiceChatRef.current.setMuted(muted);
      setIsMuted(muted);
    }
  }, []);

  // Auto-connect if enabled
  useEffect(() => {
    if (options.autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [options.autoConnect, options.battleId]);

  // Play remote audio when stream is available
  useEffect(() => {
    if (remoteStream) {
      if (!remoteAudioRef.current) {
        remoteAudioRef.current = new Audio();
        remoteAudioRef.current.autoplay = true;
      }
      remoteAudioRef.current.srcObject = remoteStream;
      console.log('[useVoiceChat] Playing remote audio');
    }

    return () => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = null;
      }
    };
  }, [remoteStream]);

  return {
    isConnected,
    isMuted,
    connectionState,
    remoteStream,
    connect,
    disconnect,
    toggleMute,
    setMuted: setMutedState,
    error,
  };
};
