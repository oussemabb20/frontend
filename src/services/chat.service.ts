import { io, Socket } from 'socket.io-client';
import api from './api.js';

const CHAT_SOCKET_URL = import.meta.env.VITE_CHAT_SOCKET_URL || 'http://localhost:3000';

class ChatService {
  private socket: Socket | null = null;
  private messageCallbacks: Array<(data: any) => void> = [];
  private typingCallbacks: Array<(data: any) => void> = [];
  private onlineCallbacks: Array<(data: any) => void> = [];
  private incomingCallCallbacks: Array<(data: any) => void> = [];
  private callInitiatedCallbacks: Array<(data: any) => void> = [];
  private callAcceptedCallbacks: Array<(data: any) => void> = [];
  private callRejectedCallbacks: Array<(data: any) => void> = [];
  private callEndedCallbacks: Array<(data: any) => void> = [];
  private callOfferCallbacks: Array<(data: any) => void> = [];
  private callAnswerCallbacks: Array<(data: any) => void> = [];
  private callIceCandidateCallbacks: Array<(data: any) => void> = [];
  private callErrorCallbacks: Array<(data: any) => void> = [];

  initializeSocket(token?: string): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    const authToken = token || localStorage.getItem('accessToken');

    this.socket = io(`${CHAT_SOCKET_URL}/chat`, {
      auth: {
        token: authToken,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();

    return this.socket;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Chat socket connected:', this.socket?.id);
    });

    this.socket.on('authenticated', (data) => {
      console.log('Chat authenticated:', data);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Chat socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Chat socket connection error:', error);
    });

    this.socket.on('new_message', (data) => {
      this.messageCallbacks.forEach(callback => callback(data));
    });

    this.socket.on('user_typing', (data) => {
      this.typingCallbacks.forEach(callback => callback(data));
    });

    this.socket.on('user_stopped_typing', (data) => {
      this.typingCallbacks.forEach(callback => callback({ ...data, stopped: true }));
    });

    this.socket.on('user_online', (data) => {
      this.onlineCallbacks.forEach(callback => callback({ ...data, online: true }));
    });

    this.socket.on('user_offline', (data) => {
      this.onlineCallbacks.forEach(callback => callback({ ...data, online: false }));
    });

    this.socket.on('online_users', (data) => {
      console.log('Received online users:', data);
      // Emit online status for each user
      if (data.userIds && Array.isArray(data.userIds)) {
        data.userIds.forEach((userId: string) => {
          this.onlineCallbacks.forEach(callback => callback({ userId, online: true }));
        });
      }
    });

    this.socket.on('error', (error) => {
      console.error('Chat error:', error);
    });

    this.socket.on('call:incoming', (data) => {
      this.incomingCallCallbacks.forEach(callback => callback(data));
    });

    this.socket.on('call:initiated', (data) => {
      this.callInitiatedCallbacks.forEach(callback => callback(data));
    });

    this.socket.on('call:accepted', (data) => {
      this.callAcceptedCallbacks.forEach(callback => callback(data));
    });

    this.socket.on('call:rejected', (data) => {
      this.callRejectedCallbacks.forEach(callback => callback(data));
    });

    this.socket.on('call:ended', (data) => {
      this.callEndedCallbacks.forEach(callback => callback(data));
    });

    this.socket.on('call:offer', (data) => {
      this.callOfferCallbacks.forEach(callback => callback(data));
    });

    this.socket.on('call:answer', (data) => {
      this.callAnswerCallbacks.forEach(callback => callback(data));
    });

    this.socket.on('call:ice_candidate', (data) => {
      this.callIceCandidateCallbacks.forEach(callback => callback(data));
    });

    this.socket.on('call:error', (data) => {
      this.callErrorCallbacks.forEach(callback => callback(data));
    });
  }

  sendMessage(conversationId: string, content: string, type: string = 'text') {
    if (!this.socket) {
      throw new Error('Socket not initialized');
    }

    this.socket.emit('send_message', {
      conversationId,
      content,
      type,
    });
  }

  joinConversation(conversationId: string) {
    if (!this.socket) return;
    this.socket.emit('join_conversation', { conversationId });
  }

  leaveConversation(conversationId: string) {
    if (!this.socket) return;
    this.socket.emit('leave_conversation', { conversationId });
  }

  startTyping(conversationId: string) {
    if (!this.socket) return;
    this.socket.emit('typing', { conversationId });
  }

  stopTyping(conversationId: string) {
    if (!this.socket) return;
    this.socket.emit('stop_typing', { conversationId });
  }

  markAsRead(conversationId: string, messageId: string) {
    if (!this.socket) return;
    this.socket.emit('mark_as_read', { conversationId, messageId });
  }

  getOnlineUsers() {
    if (!this.socket) return;
    this.socket.emit('get_online_users');
  }

  onNewMessage(callback: (data: any) => void) {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  onTyping(callback: (data: any) => void) {
    this.typingCallbacks.push(callback);
    return () => {
      this.typingCallbacks = this.typingCallbacks.filter(cb => cb !== callback);
    };
  }

  onUserStatusChange(callback: (data: any) => void) {
    this.onlineCallbacks.push(callback);
    return () => {
      this.onlineCallbacks = this.onlineCallbacks.filter(cb => cb !== callback);
    };
  }

  initiateCall(calleeId: string, conversationId: string, callType: 'audio' | 'video' = 'audio') {
    if (!this.socket) return;
    this.socket.emit('call:initiate', { calleeId, conversationId, callType });
  }

  acceptCall(callId: string) {
    if (!this.socket) return;
    this.socket.emit('call:accept', { callId });
  }

  rejectCall(callId: string) {
    if (!this.socket) return;
    this.socket.emit('call:reject', { callId });
  }

  endCall(callId: string) {
    if (!this.socket) return;
    this.socket.emit('call:end', { callId });
  }

  sendCallOffer(callId: string, offer: RTCSessionDescriptionInit) {
    if (!this.socket) return;
    this.socket.emit('call:offer', { callId, offer });
  }

  sendCallAnswer(callId: string, answer: RTCSessionDescriptionInit) {
    if (!this.socket) return;
    this.socket.emit('call:answer', { callId, answer });
  }

  sendIceCandidate(callId: string, candidate: RTCIceCandidateInit, targetUserId: string) {
    if (!this.socket) return;
    this.socket.emit('call:ice_candidate', { callId, candidate, targetUserId });
  }

  onIncomingCall(callback: (data: any) => void) {
    this.incomingCallCallbacks.push(callback);
    return () => {
      this.incomingCallCallbacks = this.incomingCallCallbacks.filter(cb => cb !== callback);
    };
  }

  onCallInitiated(callback: (data: any) => void) {
    this.callInitiatedCallbacks.push(callback);
    return () => {
      this.callInitiatedCallbacks = this.callInitiatedCallbacks.filter(cb => cb !== callback);
    };
  }

  onCallAccepted(callback: (data: any) => void) {
    this.callAcceptedCallbacks.push(callback);
    return () => {
      this.callAcceptedCallbacks = this.callAcceptedCallbacks.filter(cb => cb !== callback);
    };
  }

  onCallRejected(callback: (data: any) => void) {
    this.callRejectedCallbacks.push(callback);
    return () => {
      this.callRejectedCallbacks = this.callRejectedCallbacks.filter(cb => cb !== callback);
    };
  }

  onCallEnded(callback: (data: any) => void) {
    this.callEndedCallbacks.push(callback);
    return () => {
      this.callEndedCallbacks = this.callEndedCallbacks.filter(cb => cb !== callback);
    };
  }

  onCallOffer(callback: (data: any) => void) {
    this.callOfferCallbacks.push(callback);
    return () => {
      this.callOfferCallbacks = this.callOfferCallbacks.filter(cb => cb !== callback);
    };
  }

  onCallAnswer(callback: (data: any) => void) {
    this.callAnswerCallbacks.push(callback);
    return () => {
      this.callAnswerCallbacks = this.callAnswerCallbacks.filter(cb => cb !== callback);
    };
  }

  onCallIceCandidate(callback: (data: any) => void) {
    this.callIceCandidateCallbacks.push(callback);
    return () => {
      this.callIceCandidateCallbacks = this.callIceCandidateCallbacks.filter(cb => cb !== callback);
    };
  }

  onCallError(callback: (data: any) => void) {
    this.callErrorCallbacks.push(callback);
    return () => {
      this.callErrorCallbacks = this.callErrorCallbacks.filter(cb => cb !== callback);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.messageCallbacks = [];
    this.typingCallbacks = [];
    this.onlineCallbacks = [];
    this.incomingCallCallbacks = [];
    this.callInitiatedCallbacks = [];
    this.callAcceptedCallbacks = [];
    this.callRejectedCallbacks = [];
    this.callEndedCallbacks = [];
    this.callOfferCallbacks = [];
    this.callAnswerCallbacks = [];
    this.callIceCandidateCallbacks = [];
    this.callErrorCallbacks = [];
  }

  // REST API methods
  async getConversations() {
    try {
      console.log('Fetching conversations from API...');
      const response = await api.get('/chat/conversations');
      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  async getMessages(conversationId: string, limit: number = 100) {
    const response = await api.get(`/chat/conversations/${conversationId}/messages`, {
      params: { limit },
    });
    return response.data;
  }

  async createConversation(participants: string[], participantDetails: any[], type: string = 'direct') {
    const response = await api.post('/chat/conversations', {
      participants,
      participantDetails,
      type,
    });
    return response.data;
  }

  async getConversation(conversationId: string) {
    const response = await api.get(`/chat/conversations/${conversationId}`);
    return response.data;
  }

  // Get current user ID from token or localStorage
  getCurrentUserId(): string | null {
    // Try to get from user object in localStorage first
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        return user.id || user._id || null;
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
    
    // Fallback: try to decode from accessToken
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub || payload.id || payload.userId || null;
      } catch (e) {
        console.error('Error decoding token:', e);
      }
    }
    
    return null;
  }
}

export default new ChatService();
