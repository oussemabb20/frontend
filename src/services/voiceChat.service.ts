import { io, Socket } from 'socket.io-client';

const STUN_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

interface VoiceChatConfig {
  battleId: string;
  userId: string;
  onPeerJoined?: (userId: string) => void;
  onPeerLeft?: (userId: string) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  onError?: (error: Error) => void;
}

export class VoiceChatService {
  private socket: Socket | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private config: VoiceChatConfig;
  private audioTrack: MediaStreamTrack | null = null;
  private isMuted: boolean = false;

  constructor(config: VoiceChatConfig) {
    this.config = config;
  }

  /**
   * PHASE 1: Initialize signaling connection
   */
  async connect(): Promise<void> {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    this.socket = io(`${apiUrl}/voice`, {
      transports: ['websocket'],
      reconnection: true,
    });

    this.setupSignalingListeners();
    
    // Join voice room
    this.socket.emit('voice:join_room', {
      battleId: this.config.battleId,
      userId: this.config.userId,
    });
  }

  /**
   * PHASE 2: Setup WebRTC peer connection
   */
  private async setupPeerConnection(isInitiator: boolean, targetUserId: string): Promise<void> {
    this.peerConnection = new RTCPeerConnection({
      iceServers: STUN_SERVERS,
    });

    // Monitor connection state
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      console.log(`[VoiceChat] Connection state: ${state}`);
      this.config.onConnectionStateChange?.(state!);
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket?.emit('voice:ice_candidate', {
          battleId: this.config.battleId,
          targetUserId,
          candidate: event.candidate.toJSON(),
        });
      }
    };

    // Handle incoming audio stream
    this.peerConnection.ontrack = (event) => {
      console.log('[VoiceChat] Received remote track');
      this.remoteStream = event.streams[0];
    };

    // Add local audio track
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });
    }

    // If initiator, create and send offer
    if (isInitiator) {
      await this.createAndSendOffer(targetUserId);
    }
  }

  /**
   * PHASE 3: Capture and stream audio
   */
  async startAudio(): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000, // Opus codec optimal rate
        },
        video: false,
      });

      this.audioTrack = this.localStream.getAudioTracks()[0];
      console.log('[VoiceChat] Audio captured successfully');
      
      return this.localStream;
    } catch (error) {
      console.error('[VoiceChat] Failed to capture audio:', error);
      this.config.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Get remote audio stream for playback
   */
  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  /**
   * PHASE 4: Toggle microphone
   */
  toggleMute(): boolean {
    if (!this.audioTrack) {
      console.warn('[VoiceChat] No audio track available');
      return this.isMuted;
    }

    this.isMuted = !this.isMuted;
    this.audioTrack.enabled = !this.isMuted;
    
    console.log(`[VoiceChat] Mic ${this.isMuted ? 'OFF' : 'ON'}`);
    return this.isMuted;
  }

  /**
   * Set mute state explicitly
   */
  setMuted(muted: boolean): void {
    if (!this.audioTrack) return;
    
    this.isMuted = muted;
    this.audioTrack.enabled = !muted;
  }

  /**
   * Get current mute state
   */
  isMicMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Setup signaling event listeners
   */
  private setupSignalingListeners(): void {
    if (!this.socket) return;

    this.socket.on('voice:room_joined', async (data: { battleId: string; peersInRoom: string[] }) => {
      console.log('[VoiceChat] Joined room, peers:', data.peersInRoom);
      
      // If there are peers, initiate connection
      if (data.peersInRoom.length > 0) {
        const targetUserId = data.peersInRoom[0];
        await this.setupPeerConnection(true, targetUserId);
      }
    });

    this.socket.on('voice:peer_joined', async (data: { userId: string }) => {
      console.log('[VoiceChat] Peer joined:', data.userId);
      this.config.onPeerJoined?.(data.userId);
      
      // Setup connection as receiver (will wait for offer)
      await this.setupPeerConnection(false, data.userId);
    });

    this.socket.on('voice:offer', async (data: { offer: RTCSessionDescriptionInit; fromUserId: string }) => {
      console.log('[VoiceChat] Received offer from:', data.fromUserId);
      
      if (!this.peerConnection) {
        await this.setupPeerConnection(false, data.fromUserId);
      }

      await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await this.peerConnection!.createAnswer();
      await this.peerConnection!.setLocalDescription(answer);

      this.socket?.emit('voice:answer', {
        battleId: this.config.battleId,
        targetUserId: data.fromUserId,
        answer: answer,
      });
    });

    this.socket.on('voice:answer', async (data: { answer: RTCSessionDescriptionInit; fromUserId: string }) => {
      console.log('[VoiceChat] Received answer from:', data.fromUserId);
      
      if (this.peerConnection) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });

    this.socket.on('voice:ice_candidate', async (data: { candidate: RTCIceCandidateInit; fromUserId: string }) => {
      if (this.peerConnection && data.candidate) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    this.socket.on('voice:peer_left', (data: { userId: string }) => {
      console.log('[VoiceChat] Peer left:', data.userId);
      this.config.onPeerLeft?.(data.userId);
      this.closePeerConnection();
    });

    this.socket.on('voice:peer_disconnected', (data: { userId: string }) => {
      console.log('[VoiceChat] Peer disconnected:', data.userId);
      this.config.onPeerLeft?.(data.userId);
      this.closePeerConnection();
    });
  }

  /**
   * Create and send WebRTC offer
   */
  private async createAndSendOffer(targetUserId: string): Promise<void> {
    if (!this.peerConnection) return;

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    this.socket?.emit('voice:offer', {
      battleId: this.config.battleId,
      targetUserId,
      offer: offer,
    });
  }

  /**
   * Close peer connection
   */
  private closePeerConnection(): void {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.remoteStream = null;
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    // Stop local audio
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Close peer connection
    this.closePeerConnection();

    // Leave room and disconnect socket
    if (this.socket) {
      this.socket.emit('voice:leave_room', {
        battleId: this.config.battleId,
        userId: this.config.userId,
      });
      this.socket.disconnect();
      this.socket = null;
    }

    this.audioTrack = null;
    console.log('[VoiceChat] Disconnected and cleaned up');
  }

  /**
   * Get connection statistics
   */
  async getStats(): Promise<RTCStatsReport | null> {
    if (!this.peerConnection) return null;
    return await this.peerConnection.getStats();
  }
}
