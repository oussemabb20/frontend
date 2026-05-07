import { io, Socket } from 'socket.io-client';
import api from './api.js';
import axios from 'axios';

class BattleService {
  private socket: Socket | null = null;
  private battleServiceUrl = 'http://localhost:3010'; // Direct connection to battle service for WebSocket
  private currentUserId: string | null = null;
  private currentUsername: string | null = null;
  private joinRoomInFlight = new Map<string, Promise<any>>();
  private joinPrivateInFlight = new Set<string>();

  // Initialize socket connection to Battle Service (direct connection, not through gateway)
  initializeSocket(token?: string): Socket {
    if (this.socket) {
      if (!this.socket.connected) {
        this.socket.connect();
      }
      return this.socket;
    }

    console.log('Initializing battle socket connection to:', `${this.battleServiceUrl}/battle`);

    const socket = io(`${this.battleServiceUrl}/battle`, {
      auth: {
        token: token || localStorage.getItem('accessToken'),
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    this.socket = socket;

    socket.on('connect', () => {
      console.log('✅ Battle socket connected:', socket.id);
      console.log('Socket transport:', socket.io.engine.transport.name);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Battle socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        socket.connect();
      }
    });

    socket.on('connect_error', (error) => {
      console.error('🔴 Battle socket connection error:', error.message);
      console.error('Make sure battle service is running on port 3010');
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
    });

    return socket;
  }

  // Set current user info
  setCurrentUser(userId: string, username: string) {
    this.currentUserId = userId;
    this.currentUsername = username;
  }

  getCurrentUserId(): string | null {
    if (this.currentUserId) return this.currentUserId;
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user._id || user.id || null;
  }

  getCurrentUsername(): string | null {
    if (this.currentUsername) return this.currentUsername;
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.username || user.email || null;
  }

  private emitVoiceEvent<T extends object>(eventName: string, payload: T) {
    if (!this.socket) {
      console.error('[BattleService] Socket not initialized');
      throw new Error('Socket not initialized');
    }

    if (!this.socket.connected) {
      console.error('[BattleService] Socket not connected');
      throw new Error('Socket not connected');
    }

    const userId = this.getCurrentUserId();
    const username = this.getCurrentUsername();
    
    const payloadRecord = payload as Record<string, unknown>;
    const eventData = {
      ...payloadRecord,
      userId,
      username,
    };
    
    console.log(`🎤 [BattleService] Emitting ${eventName}:`, eventData);
    console.log(`  - Socket ID: ${this.socket.id}`);
    console.log(`  - Socket connected: ${this.socket.connected}`);
    console.log(`  - User ID: ${userId}`);
    console.log(`  - Username: ${username}`);
    console.log(`  - Battle ID: ${payloadRecord.battleId}`);
    console.log(`  - Target User ID: ${payloadRecord.targetUserId}`);

    this.socket.emit(eventName, eventData);
    
    console.log(`✅ [BattleService] ${eventName} emitted successfully`);
  }

  private subscribe(eventName: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(eventName, callback);
    }

    return () => {
      if (this.socket) {
        this.socket.off(eventName, callback);
      }
    };
  }

  // Queue Management
  joinQueue(mode: string, skillLevel: number = 1, teamSize?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }

      if (!this.socket.connected) {
        reject(new Error('Socket not connected. Please wait for connection.'));
        return;
      }

      const userId = this.getCurrentUserId();
      const username = this.getCurrentUsername();

      if (!userId || !username) {
        reject(new Error('User not authenticated'));
        return;
      }

      console.log('🎮 Joining queue:', { userId, username, mode, skillLevel, teamSize });

      this.socket.emit('battle:join_queue', {
        userId,
        username,
        mode,
        skillLevel,
        teamSize,
      });

      // Listen for queue confirmation
      this.socket.once('battle:queue_joined', (data) => {
        console.log('✅ Queue joined:', data);
        if (data.success) {
          resolve();
        } else {
          reject(new Error(data.message));
        }
      });

      // Listen for errors
      this.socket.once('battle:error', (error) => {
        console.error('❌ Queue error:', error);
        reject(new Error(error.message));
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error('Queue join timeout - no response from server'));
      }, 5000);
    });
  }

  leaveQueue(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }

      const userId = this.getCurrentUserId();
      if (!userId) {
        reject(new Error('User not authenticated'));
        return;
      }

      this.socket.emit('battle:leave_queue', { userId });

      this.socket.once('battle:queue_left', (data) => {
        if (data.success) {
          resolve();
        } else {
          reject(new Error(data.message));
        }
      });
    });
  }

  // Battle Room Management
  joinBattleRoom(battleId: string): Promise<any> {
    const existingJoinPromise = this.joinRoomInFlight.get(battleId);
    if (existingJoinPromise) {
      return existingJoinPromise;
    }

    const joinPromise = new Promise((resolve, reject) => {
      if (!this.socket) {
        this.joinRoomInFlight.delete(battleId);
        reject(new Error('Socket not initialized'));
        return;
      }

      const userId = this.getCurrentUserId();
      if (!userId) {
        this.joinRoomInFlight.delete(battleId);
        reject(new Error('User not authenticated'));
        return;
      }

      const socket = this.socket;
      const onRoomJoined = (data: any) => {
        if (data?.battle?._id !== battleId) {
          return;
        }
        cleanup();
        resolve(data.battle);
      };

      const onError = (error: any) => {
        cleanup();
        reject(new Error(error.message));
      };

      const cleanup = () => {
        this.joinRoomInFlight.delete(battleId);
        socket.off('battle:room_joined', onRoomJoined);
        socket.off('battle:error', onError);
      };

      this.socket.emit('battle:join_room', { battleId, userId });

      socket.on('battle:room_joined', onRoomJoined);
      socket.on('battle:error', onError);
    });

    this.joinRoomInFlight.set(battleId, joinPromise);
    return joinPromise;
  }

  // Code Submission
  submitCode(battleId: string, code: string, language: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }

      const userId = this.getCurrentUserId();
      if (!userId) {
        reject(new Error('User not authenticated'));
        return;
      }

      this.socket.emit('battle:submit_code', {
        battleId,
        userId,
        code,
        language,
      });

      this.socket.once('battle:submission_result', (result) => {
        resolve(result);
      });

      this.socket.once('battle:error', (error) => {
        reject(new Error(error.message));
      });
    });
  }

  // Forfeit Battle
  forfeitBattle(battleId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }

      const userId = this.getCurrentUserId();
      if (!userId) {
        reject(new Error('User not authenticated'));
        return;
      }

      this.socket.emit('battle:forfeit', { battleId, userId });
      resolve();
    });
  }

  // Event Listeners
  onMatchFound(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('battle:match_found', callback);
    }
    return () => {
      if (this.socket) {
        this.socket.off('battle:match_found', callback);
      }
    };
  }

  onCountdown(callback: (data: any) => void) {
    if (this.socket) {
      console.log('📡 Registering countdown event listener');
      const wrappedCallback = (data: any) => {
        console.log('⏱️ Countdown event received from socket:', data);
        callback(data);
      };
      this.socket.on('battle:countdown', wrappedCallback);

      return () => {
        if (this.socket) {
          console.log('🔇 Unregistering countdown event listener');
          this.socket.off('battle:countdown', wrappedCallback);
        }
      };
    }

    return () => {
      // no-op when socket is not available during subscription
    };
  }

  onBattleStarted(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('battle:started', callback);
    }
    return () => {
      if (this.socket) {
        this.socket.off('battle:started', callback);
      }
    };
  }

  onProgressUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('battle:progress_update', callback);
    }
    return () => {
      if (this.socket) {
        this.socket.off('battle:progress_update', callback);
      }
    };
  }

  onBattleCompleted(callback: (data: any) => void) {
    return this.subscribe('battle:completed', callback);
  }

  onQueueUpdate(callback: (data: any) => void) {
    if (this.socket) {
      console.log('📡 Registering queue update event listener');
      const wrappedCallback = (data: any) => {
        console.log('👥 Queue update event received:', data);
        callback(data);
      };
      this.socket.on('battle:queue_update', wrappedCallback);

      return () => {
        if (this.socket) {
          console.log('🔇 Unregistering queue update event listener');
          this.socket.off('battle:queue_update', wrappedCallback);
        }
      };
    }

    return () => {
      // no-op when socket is not available during subscription
    };
  }

  sendVoiceOffer(
    battleId: string,
    targetUserId: string,
    offer: RTCSessionDescriptionInit,
  ) {
    this.emitVoiceEvent('battle:voice_offer', { battleId, targetUserId, offer });
  }

  sendVoiceAnswer(
    battleId: string,
    targetUserId: string,
    answer: RTCSessionDescriptionInit,
  ) {
    this.emitVoiceEvent('battle:voice_answer', { battleId, targetUserId, answer });
  }

  sendVoiceIceCandidate(
    battleId: string,
    targetUserId: string,
    candidate: RTCIceCandidateInit,
  ) {
    this.emitVoiceEvent('battle:voice_ice_candidate', {
      battleId,
      targetUserId,
      candidate,
    });
  }

  sendVoiceEnd(battleId: string, targetUserId: string) {
    this.emitVoiceEvent('battle:voice_end', { battleId, targetUserId });
  }

  sendVoiceMuteChanged(battleId: string, targetUserId: string, muted: boolean) {
    this.emitVoiceEvent('battle:voice_mute_changed', {
      battleId,
      targetUserId,
      muted,
    });
  }

  onVoiceOffer(callback: (data: any) => void) {
    return this.subscribe('battle:voice_offer', callback);
  }

  onVoiceAnswer(callback: (data: any) => void) {
    return this.subscribe('battle:voice_answer', callback);
  }

  onVoiceIceCandidate(callback: (data: any) => void) {
    return this.subscribe('battle:voice_ice_candidate', callback);
  }

  onVoiceEnd(callback: (data: any) => void) {
    return this.subscribe('battle:voice_end', callback);
  }

  onVoiceMuteChanged(callback: (data: any) => void) {
    return this.subscribe('battle:voice_mute_changed', callback);
  }

  // HTTP API calls
  async getActiveBattles(): Promise<any> {
    const userId = this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      const response = await api.get(`/battles/active/${userId}`);
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        const directResponse = await axios.get(
          `${this.battleServiceUrl}/api/battles/active/${userId}`,
        );
        return directResponse.data;
      }
      throw error;
    }
  }

  async getBattleHistory(): Promise<any> {
    const userId = this.getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      const response = await api.get(`/battles/history/${userId}`);
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        const directResponse = await axios.get(
          `${this.battleServiceUrl}/api/battles/history/${userId}`,
        );
        return directResponse.data;
      }
      throw error;
    }
  }

  async getTeamLeague(teamSize?: string): Promise<any> {
    try {
      const query = teamSize ? `?teamSize=${encodeURIComponent(teamSize)}` : '';
      const response = await api.get(`/battles/team-league${query}`);
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        const query = teamSize ? `?teamSize=${encodeURIComponent(teamSize)}` : '';
        const directResponse = await axios.get(
          `${this.battleServiceUrl}/api/battles/team-league${query}`,
        );
        return directResponse.data;
      }
      throw error;
    }
  }

  async getBattle(battleId: string): Promise<any> {
    try {
      const response = await api.get(`/battles/${battleId}`);
      return response.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        const directResponse = await axios.get(
          `${this.battleServiceUrl}/api/battles/${battleId}`,
        );
        return directResponse.data;
      }
      throw error;
    }
  }

  // Private Battle Methods
  async createPrivateBattle(skillLevel: number = 1, mode: string = '1v1', teamSize?: string): Promise<any> {
    const userId = this.getCurrentUserId();
    const username = this.getCurrentUsername();
    
    if (!userId || !username) throw new Error('User not authenticated');

    const response = await api.post('/battles/private/create', {
      userId,
      username,
      skillLevel,
      mode,
      teamSize,
    });
    return response.data;
  }

  joinPrivateBattle(battleId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }

      if (!this.socket.connected) {
        reject(new Error('Socket not connected. Please wait for connection.'));
        return;
      }

      const userId = this.getCurrentUserId();
      const username = this.getCurrentUsername();

      if (!userId || !username) {
        reject(new Error('User not authenticated'));
        return;
      }

      if (this.joinPrivateInFlight.has(battleId)) {
        resolve();
        return;
      }

      this.joinPrivateInFlight.add(battleId);

      console.log('🎮 Joining private battle:', { battleId, userId, username });

      this.socket.emit('battle:join_private', {
        battleId,
        userId,
        username,
      });

      const socket = this.socket;
      let successTimeout: ReturnType<typeof setTimeout>;
      const onError = (error: any) => {
        clearTimeout(successTimeout);
        cleanup();
        console.error('❌ Join private battle error:', error);
        reject(new Error(error.message));
      };

      const cleanup = () => {
        this.joinPrivateInFlight.delete(battleId);
        socket.off('battle:error', onError);
      };

      // Listen for success (match_found event will be emitted)
      successTimeout = setTimeout(() => {
        cleanup();
        resolve(); // Resolve after emitting, match_found will handle the rest
      }, 100);

      // Listen for errors
      socket.on('battle:error', onError);
    });
  }

  // Disconnect
  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new BattleService();
