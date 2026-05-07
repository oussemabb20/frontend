import React, { useState, useEffect, useRef, useCallback } from "react";
import { Grid, Card, TextField, IconButton, List, ListItem, ListItemText, Avatar, Badge, Box as MuiBox, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab } from "@mui/material";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiButton from "components/VuiButton";
import VuiInput from "components/VuiInput";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { IoChatbubbles, IoSend, IoPeople, IoSearch, IoPersonAdd, IoCheckmark, IoClose, IoPersonCircle, IoMic, IoStop, IoPlay, IoPause, IoCall, IoVideocam, IoTrash } from "react-icons/io5";
import chatService from "services/chat.service";
import tokenRefreshService from "services/tokenRefresh.service";
import api from "services/api";
import { useVisionUIController } from "context";

function Chat() {
  const [controller] = useVisionUIController();
  const { darkMode } = controller;
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingAudio, setPlayingAudio] = useState(null); // Track which audio is playing
  const [incomingCall, setIncomingCall] = useState(null);
  const [currentCallId, setCurrentCallId] = useState(null);
  const [callPeerUserId, setCallPeerUserId] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [callType, setCallType] = useState("audio");
  const [callStatus, setCallStatus] = useState("Idle");
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const audioRefs = useRef({}); // Store audio element refs
  const currentConversationRef = useRef(null); // Ref to track current conversation
  const incomingCallRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const currentCallIdRef = useRef(null);
  const callPeerUserIdRef = useRef(null);
  const isInCallRef = useRef(false);
  const callTypeRef = useRef("audio");
  const pendingCalleeIdRef = useRef(null);
  const outgoingCallTimeoutRef = useRef(null);
  const localAudioElementRef = useRef(null);
  const remoteAudioElementRef = useRef(null);
  const localVideoElementRef = useRef(null);
  const remoteVideoElementRef = useRef(null);

  const panelBackground = darkMode
    ? "linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.49) 76.65%)"
    : "linear-gradient(180deg, rgba(255, 255, 255, 0.97) 0%, rgba(241, 245, 249, 0.94) 100%)";
  const panelBorder = darkMode ? "1px solid rgba(255, 255, 255, 0.125)" : "1px solid rgba(148, 163, 184, 0.18)";
  const dividerBorder = darkMode ? "1px solid rgba(255, 255, 255, 0.125)" : "1px solid rgba(148, 163, 184, 0.16)";
  const cardText = darkMode ? "white" : "dark";
  const subduedText = darkMode ? "text" : "dark";
  const primaryTextCss = darkMode ? "#f8fafc" : "#0f172a";
  const tabBackground = darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.84)";
  const tabSelectedBackground = darkMode
    ? "rgba(0, 117, 255, 0.2)"
    : "linear-gradient(135deg, rgba(0, 117, 255, 0.14), rgba(0, 198, 255, 0.12))";
  const tabContainerBackground = darkMode ? "rgba(9, 14, 46, 0.72)" : "rgba(255, 255, 255, 0.9)";
  const tabTextColor = darkMode ? "rgba(226, 232, 240, 0.9)" : "rgba(15, 23, 42, 0.78)";
  const tabSelectedTextColor = darkMode ? "#ffffff" : "#0f172a";
  const listItemBackground = darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.9)";
  const listItemSelectedBackground = darkMode ? "rgba(0, 117, 255, 0.2)" : "rgba(0, 117, 255, 0.12)";
  const messageBubbleBackground = darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(248, 250, 252, 0.96)";
  const messageBodyColor = darkMode ? "white" : "dark";
  const inputWrapBackground = darkMode ? "transparent" : "rgba(255, 255, 255, 0.65)";

  const createPeerConnection = useCallback((callId, targetUserId) => {
    if (peerConnectionRef.current) {
      return peerConnectionRef.current;
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && targetUserId) {
        chatService.sendIceCandidate(callId, event.candidate.toJSON(), targetUserId);
      }
    };

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      if (stream) {
        remoteStreamRef.current = stream;
        setRemoteStream(stream);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
        setCallStatus("Call ended");
      }
    };

    const local = localStreamRef.current;
    if (local) {
      local.getTracks().forEach((track) => {
        const alreadyAdded = pc.getSenders().some((sender) => sender.track === track);
        if (!alreadyAdded) {
          pc.addTrack(track, local);
        }
      });
    }

    peerConnectionRef.current = pc;
    return pc;
  }, []);

  const startLocalMedia = useCallback(async (mode = "audio") => {
    if (localStreamRef.current) {
      return localStreamRef.current;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: mode === "video",
    });
    localStreamRef.current = stream;
    setLocalStream(stream);
    return stream;
  }, []);

  const resetCallState = useCallback(() => {
    if (outgoingCallTimeoutRef.current) {
      clearTimeout(outgoingCallTimeoutRef.current);
      outgoingCallTimeoutRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => track.stop());
      remoteStreamRef.current = null;
    }

    setLocalStream(null);
    setRemoteStream(null);
    setIncomingCall(null);
    setCurrentCallId(null);
    setCallPeerUserId(null);
    setIsCalling(false);
    setIsInCall(false);
    setCallType("audio");
    setCallStatus("Idle");
    pendingCalleeIdRef.current = null;
    currentCallIdRef.current = null;
    callPeerUserIdRef.current = null;
    isInCallRef.current = false;
    callTypeRef.current = "audio";
  }, []);

  const handleEndCall = useCallback(() => {
    if (currentCallIdRef.current) {
      chatService.endCall(currentCallIdRef.current);
    }
    resetCallState();
  }, [resetCallState]);

  const handleStartCall = useCallback((mode = "audio") => {
    if (!currentConversation) return;
    if (isCalling || isInCall) return;

    const otherUser = getOtherParticipant(currentConversation);
    if (!otherUser?.userId) return;

    pendingCalleeIdRef.current = otherUser.userId;
    setCallPeerUserId(otherUser.userId);
    callPeerUserIdRef.current = otherUser.userId;
    setCallType(mode);
    callTypeRef.current = mode;
    setIsCalling(true);
    setCallStatus(`${mode === "video" ? "Video" : "Voice"} calling ${otherUser.username || "user"}...`);
    chatService.initiateCall(otherUser.userId, currentConversation._id, mode);

    if (outgoingCallTimeoutRef.current) {
      clearTimeout(outgoingCallTimeoutRef.current);
    }

    outgoingCallTimeoutRef.current = setTimeout(() => {
      if (currentCallIdRef.current && !isInCallRef.current) {
        chatService.endCall(currentCallIdRef.current);
      }
      alert('Call timeout: no answer');
      resetCallState();
    }, 30000);
  }, [currentConversation, isCalling, isInCall]);

  const handleAcceptIncomingCall = useCallback(async () => {
    if (!incomingCall) return;
    try {
      const incomingType = incomingCall.callType || "audio";
      setIncomingCall(null);
      setCurrentCallId(incomingCall.callId);
      currentCallIdRef.current = incomingCall.callId;
      setCallPeerUserId(incomingCall.callerId);
      callPeerUserIdRef.current = incomingCall.callerId;
      setCallType(incomingType);
      callTypeRef.current = incomingType;
      setIsInCall(true);
      isInCallRef.current = true;
      setCallStatus(`Connecting to ${incomingCall.callerUsername}...`);

      await startLocalMedia(incomingType);
      createPeerConnection(incomingCall.callId, incomingCall.callerId);
      chatService.acceptCall(incomingCall.callId);
    } catch (error) {
      console.error("Error accepting call:", error);
      resetCallState();
    }
  }, [incomingCall, createPeerConnection, resetCallState, startLocalMedia]);

  const handleRejectIncomingCall = useCallback(() => {
    if (!incomingCall) return;
    chatService.rejectCall(incomingCall.callId);
    setIncomingCall(null);
  }, [incomingCall]);

  useEffect(() => {
    // Socket is already initialized in App.tsx, so we don't need to initialize it here
    // Just load initial data
    const loadInitialData = async () => {
      try {
        await loadConversations();
        await loadFriends();
        await loadFriendRequests();
      } catch (error) {
        console.error('Error loading initial data:', error);
        // Retry after 2 seconds
        setTimeout(loadInitialData, 2000);
      }
    };
    
    loadInitialData();

    // Check for pending call from notification (user accepted call from another page)
    const pendingCallData = sessionStorage.getItem('pendingCall');
    const callAlreadyAccepted = sessionStorage.getItem('callAccepted') === 'true';
    
    if (pendingCallData) {
      try {
        const callData = JSON.parse(pendingCallData);
        console.log('Found pending call:', callData);
        console.log('Call already accepted:', callAlreadyAccepted);
        
        // Clear the session storage
        sessionStorage.removeItem('pendingCall');
        sessionStorage.removeItem('callAccepted');
        
        if (callAlreadyAccepted) {
          // Call was already accepted in App.tsx, set up WebRTC WITHOUT calling acceptCall again
          console.log('Call already accepted, setting up WebRTC connection...');
          
          const incomingType = callData.callType || "audio";
          setCurrentCallId(callData.callId);
          currentCallIdRef.current = callData.callId;
          setCallPeerUserId(callData.callerId);
          callPeerUserIdRef.current = callData.callerId;
          setCallType(incomingType);
          callTypeRef.current = incomingType;
          setIsInCall(true);
          isInCallRef.current = true;
          setCallStatus(`Connecting to ${callData.callerUsername}...`);

          // Set up WebRTC connection (don't call acceptCall again!)
          setTimeout(async () => {
            try {
              console.log('Starting local media...');
              await startLocalMedia(incomingType);
              console.log('Creating peer connection...');
              createPeerConnection(callData.callId, callData.callerId);
              console.log('WebRTC setup complete, waiting for offer...');
              
              // Find and select the conversation with this user
              const conv = conversations.find(c => 
                c.participantDetails && c.participantDetails.some(p => p.userId === callData.callerId)
              );
              if (conv) {
                console.log('Selecting conversation:', conv._id);
                setCurrentConversation(conv);
                chatService.joinConversation(conv._id);
              }
            } catch (error) {
              console.error('Error setting up WebRTC:', error);
              resetCallState();
            }
          }, 1000); // Increased delay to ensure conversations are loaded
        } else {
          // Call not yet accepted, show incoming call UI
          console.log('Showing incoming call UI...');
          setIncomingCall(callData);
        }
      } catch (error) {
        console.error('Error handling pending call:', error);
        sessionStorage.removeItem('pendingCall');
        sessionStorage.removeItem('callAccepted');
      }
    }

    // Request current online users (socket is already connected from App.tsx)
    setTimeout(() => {
      console.log('Requesting online users from chat page...');
      chatService.getOnlineUsers();
    }, 1000);

    // Setup event listeners
    const unsubscribeMessage = chatService.onNewMessage(handleNewMessage);
    const unsubscribeTyping = chatService.onTyping(handleTyping);
    const unsubscribeStatus = chatService.onUserStatusChange(handleUserStatus);
    const unsubscribeIncomingCall = chatService.onIncomingCall((data) => {
      if (isInCallRef.current) {
        chatService.rejectCall(data.callId);
        return;
      }
      setIncomingCall(data);
      setCallStatus(`Incoming ${data.callType === 'video' ? 'video' : 'voice'} call from ${data.callerUsername}`);
    });
    const unsubscribeCallInitiated = chatService.onCallInitiated((data) => {
      setCurrentCallId(data.callId);
      currentCallIdRef.current = data.callId;
    });
    const unsubscribeCallAccepted = chatService.onCallAccepted(async (data) => {
      try {
        if (outgoingCallTimeoutRef.current) {
          clearTimeout(outgoingCallTimeoutRef.current);
          outgoingCallTimeoutRef.current = null;
        }

        const callId = data.callId || currentCallIdRef.current;
        const targetUserId = data.calleeId || pendingCalleeIdRef.current || callPeerUserIdRef.current;
        const activeType = data.callType || callTypeRef.current || 'audio';

        if (!callId || !targetUserId) return;

        setCurrentCallId(callId);
        currentCallIdRef.current = callId;
        setCallPeerUserId(targetUserId);
        callPeerUserIdRef.current = targetUserId;
        setCallType(activeType);
        callTypeRef.current = activeType;
        setIsCalling(false);
        setIsInCall(true);
        isInCallRef.current = true;
        setCallStatus('Connected, establishing audio...');

        await startLocalMedia(activeType);
        const pc = createPeerConnection(callId, targetUserId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        chatService.sendCallOffer(callId, offer);
      } catch (error) {
        console.error('Error handling accepted call:', error);
        resetCallState();
      }
    });
    const unsubscribeCallRejected = chatService.onCallRejected(() => {
      if (outgoingCallTimeoutRef.current) {
        clearTimeout(outgoingCallTimeoutRef.current);
        outgoingCallTimeoutRef.current = null;
      }
      alert('Call rejected');
      resetCallState();
    });
    const unsubscribeCallEnded = chatService.onCallEnded(() => {
      if (outgoingCallTimeoutRef.current) {
        clearTimeout(outgoingCallTimeoutRef.current);
        outgoingCallTimeoutRef.current = null;
      }
      resetCallState();
    });
    const unsubscribeCallOffer = chatService.onCallOffer(async (data) => {
      try {
        const callId = data.callId || currentCallIdRef.current;
        const targetUserId = callPeerUserIdRef.current || (incomingCallRef.current ? incomingCallRef.current.callerId : null);

        if (!callId || !targetUserId) return;

        await startLocalMedia(callTypeRef.current || 'audio');
        const pc = createPeerConnection(callId, targetUserId);
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        chatService.sendCallAnswer(callId, answer);
        setCallStatus('In call');
      } catch (error) {
        console.error('Error handling WebRTC offer:', error);
        resetCallState();
      }
    });
    const unsubscribeCallAnswer = chatService.onCallAnswer(async (data) => {
      try {
        const pc = peerConnectionRef.current;
        if (!pc) return;
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        setCallStatus('In call');
      } catch (error) {
        console.error('Error handling WebRTC answer:', error);
      }
    });
    const unsubscribeCallIce = chatService.onCallIceCandidate(async (data) => {
      try {
        const pc = peerConnectionRef.current;
        if (!pc || !data.candidate) return;
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (error) {
        console.error('Error handling ICE candidate:', error);
      }
    });
    const unsubscribeCallError = chatService.onCallError((data) => {
      if (outgoingCallTimeoutRef.current) {
        clearTimeout(outgoingCallTimeoutRef.current);
        outgoingCallTimeoutRef.current = null;
      }
      alert(data?.message || 'Call error');
      resetCallState();
    });

    // Listen for token refresh events to rejoin current conversation
    const handleTokenRefresh = (event) => {
      console.log('Token refreshed in chat page, rejoining conversation...');
      
      // Rejoin current conversation if any
      if (currentConversationRef.current) {
        setTimeout(() => {
          chatService.joinConversation(currentConversationRef.current._id);
          // Request online users again after reconnect
          chatService.getOnlineUsers();
        }, 1000);
      }
    };

    window.addEventListener('tokenRefreshed', handleTokenRefresh);

    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
      unsubscribeStatus();
      unsubscribeIncomingCall();
      unsubscribeCallInitiated();
      unsubscribeCallAccepted();
      unsubscribeCallRejected();
      unsubscribeCallEnded();
      unsubscribeCallOffer();
      unsubscribeCallAnswer();
      unsubscribeCallIce();
      unsubscribeCallError();
      resetCallState();
      // Don't disconnect socket here - it's managed by App.tsx
      window.removeEventListener('tokenRefreshed', handleTokenRefresh);
    };
  }, [createPeerConnection, resetCallState, startLocalMedia]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Sync currentConversation with ref
  useEffect(() => {
    currentConversationRef.current = currentConversation;
  }, [currentConversation]);

  useEffect(() => {
    incomingCallRef.current = incomingCall;
  }, [incomingCall]);

  useEffect(() => {
    currentCallIdRef.current = currentCallId;
  }, [currentCallId]);

  useEffect(() => {
    callPeerUserIdRef.current = callPeerUserId;
  }, [callPeerUserId]);

  useEffect(() => {
    isInCallRef.current = isInCall;
  }, [isInCall]);

  useEffect(() => {
    callTypeRef.current = callType;
  }, [callType]);

  useEffect(() => {
    if (localAudioElementRef.current) {
      localAudioElementRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteAudioElementRef.current) {
      remoteAudioElementRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (localVideoElementRef.current) {
      localVideoElementRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoElementRef.current) {
      remoteVideoElementRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const loadConversations = async () => {
    try {
      console.log('Loading conversations...');
      const data = await chatService.getConversations();
      console.log('Conversations data received:', data);
      
      const conversationsArray = data.conversations || data || [];
      console.log('Conversations array:', conversationsArray);
      
      // Filter out battle conversations - only show direct messages
      const directConversations = conversationsArray.filter(conv => conv.type === 'direct');
      console.log('Filtered to direct conversations:', directConversations.length, 'from', conversationsArray.length);
      
      // Deduplicate conversations by _id AND by participant combination
      const uniqueConversations = directConversations.reduce((acc, conv) => {
        // Check if conversation with same _id already exists
        if (acc.find(c => c._id === conv._id)) {
          return acc;
        }
        
        // For direct conversations, also check if conversation with same participants exists
        if (conv.type === 'direct' && conv.participants && conv.participants.length === 2) {
          const hasSameParticipants = acc.find(c => 
            c.type === 'direct' &&
            c.participants &&
            c.participants.length === 2 &&
            c.participants.every(p => conv.participants.includes(p))
          );
          
          if (hasSameParticipants) {
            // Keep the one with more recent lastMessage
            const existingIndex = acc.findIndex(c => 
              c.type === 'direct' &&
              c.participants &&
              c.participants.length === 2 &&
              c.participants.every(p => conv.participants.includes(p))
            );
            
            const existingTimestamp = acc[existingIndex].lastMessage?.timestamp || 0;
            const newTimestamp = conv.lastMessage?.timestamp || 0;
            
            if (new Date(newTimestamp) > new Date(existingTimestamp)) {
              acc[existingIndex] = conv; // Replace with newer one
            }
            return acc;
          }
        }
        
        acc.push(conv);
        return acc;
      }, []);
      
      console.log('Setting conversations:', uniqueConversations.length, '(deduplicated from', directConversations.length, 'direct conversations)');
      setConversations(uniqueConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      console.error('Error details:', error.response?.data);
      setConversations([]); // Set empty array on error
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      console.log('Loading messages for conversation:', conversationId);
      const data = await chatService.getMessages(conversationId, 100); // Load last 100 messages
      console.log('Messages loaded:', data.messages?.length || 0);
      
      // Sort messages so oldest is first, newest is last
      const sortedMessages = (data.messages || []).sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      setMessages(sortedMessages);
      
      // Scroll to bottom to show latest messages
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]); // Clear messages on error
    }
  };

  const handleNewMessage = (data) => {
    console.log('New message received:', data);
    console.log('Current conversation ID:', currentConversationRef.current?._id);
    console.log('Message conversation ID:', data.conversationId);
    
    // Update messages in current conversation
    if (data.conversationId === currentConversationRef.current?._id) {
      console.log('Adding message to current conversation');
      setMessages(prev => {
        // Check if real message already exists
        const exists = prev.some(msg => msg._id === data.message._id);
        if (exists) {
          console.log('Message already exists, skipping');
          return prev;
        }
        
        // Remove temporary message if this is the real version
        // For audio messages, we can't compare content easily, so just remove temp messages from same sender around same time
        const filtered = prev.filter(msg => {
          if (!msg._id.startsWith('temp-')) return true;
          
          // If it's a temp message from the same sender within 10 seconds, remove it
          const timeDiff = Math.abs(new Date(msg.createdAt).getTime() - new Date(data.message.createdAt).getTime());
          const sameSender = msg.senderId === data.message.senderId;
          const sameType = (msg.type || 'text') === (data.message.type || 'text');
          
          return !(sameSender && sameType && timeDiff < 10000);
        });
        
        // Add new message and sort by timestamp
        const updated = [...filtered, data.message].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        console.log('Updated messages:', updated.length);
        return updated;
      });
    } else {
      console.log('Message is for a different conversation');
    }
    
    // Update conversation list to show latest message
    setConversations(prev => {
      return prev.map(conv => {
        if (conv._id === data.conversationId) {
          // Show appropriate preview based on message type
          const isAudio = data.message.type === 'audio' || 
            (typeof data.message.content === 'string' && data.message.content.startsWith('data:audio/'));
          
          return {
            ...conv,
            lastMessage: {
              content: isAudio ? '🎤 Voice message' : data.message.content,
              senderId: data.message.senderId,
              timestamp: data.message.createdAt
            }
          };
        }
        return conv;
      });
    });
  };

  const handleTyping = (data) => {
    if (data.conversationId === currentConversation?._id) {
      if (data.stopped) {
        setTypingUsers(prev => prev.filter(u => u !== data.username));
      } else {
        setTypingUsers(prev => [...new Set([...prev, data.username])]);
      }
    }
  };

  const handleUserStatus = (data) => {
    console.log('User status update:', data);
    // Ensure userId is a string for comparison
    const userIdStr = String(data.userId);
    if (data.online) {
      setOnlineUsers(prev => {
        const newSet = new Set([...prev, userIdStr]);
        console.log('Online users after adding:', Array.from(newSet));
        return Array.from(newSet);
      });
    } else {
      setOnlineUsers(prev => {
        const filtered = prev.filter(id => String(id) !== userIdStr);
        console.log('Online users after removing:', filtered);
        return filtered;
      });
    }
  };

  const handleSelectConversation = (conversation) => {
    // Leave previous conversation if any
    if (currentConversation && currentConversation._id !== conversation._id) {
      chatService.leaveConversation(currentConversation._id);
    }
    
    // Set new conversation and join it
    setCurrentConversation(conversation);
    chatService.joinConversation(conversation._id);
    
    // Load messages
    loadMessages(conversation._id);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentConversation) return;

    const currentUserId = chatService.getCurrentUserId();
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Create optimistic message (show immediately)
    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      conversationId: currentConversation._id,
      senderId: currentUserId,
      senderUsername: currentUser.username || currentUser.email || 'You',
      content: newMessage,
      type: 'text',
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    // Add message to UI immediately
    setMessages(prev => {
      const updated = [...prev, optimisticMessage].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      return updated;
    });

    // Update conversation list preview
    setConversations(prev => {
      return prev.map(conv => {
        if (conv._id === currentConversation._id) {
          return {
            ...conv,
            lastMessage: {
              content: newMessage,
              senderId: currentUserId,
              timestamp: new Date()
            }
          };
        }
        return conv;
      });
    });

    // Ensure we're joined to the conversation room, then send message via socket
    try {
      chatService.joinConversation(currentConversation._id);
    } catch (e) {
      console.warn('Error joining conversation before send:', e);
    }

    // Send message via socket
    chatService.sendMessage(currentConversation._id, newMessage);
    
    // Clear input immediately for better UX
    setNewMessage("");
    chatService.stopTyping(currentConversation._id);
  };

  const handleTypingInput = (e) => {
    setNewMessage(e.target.value);

    if (!currentConversation) return;

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing event
    chatService.startTyping(currentConversation._id);

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      chatService.stopTyping(currentConversation._id);
    }, 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const isUserOnline = (userId) => {
    if (!userId) return false;
    const userIdStr = String(userId);
    const isOnline = onlineUsers.some(id => String(id) === userIdStr);
    // console.log(`Checking if user ${userIdStr} is online:`, isOnline, 'Online users:', onlineUsers);
    return isOnline;
  };

  // User search functionality
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await api.get(`/users/search?q=${query}`);
      setSearchResults(response.data.users || []);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  // Load friends list
  const loadFriends = async () => {
    try {
      const userId = chatService.getCurrentUserId();
      const response = await api.get(`/users/friends?userId=${userId}`);
      setFriends(response.data.friends || []);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  // Load friend requests
  const loadFriendRequests = async () => {
    try {
      const userId = chatService.getCurrentUserId();
      const response = await api.get(`/users/friend-requests?userId=${userId}`);
      setFriendRequests(response.data.requests || []);
    } catch (error) {
      console.error('Error loading friend requests:', error);
    }
  };

  // Send friend request
  const handleSendFriendRequest = async (userId) => {
    try {
      const currentUserId = chatService.getCurrentUserId();
      await api.post('/users/friend-request', { 
        fromUserId: currentUserId,
        toUserId: userId 
      });
      alert('Friend request sent!');
      setShowUserProfile(false);
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert(error.response?.data?.message || 'Failed to send friend request');
    }
  };

  // Accept friend request
  const handleAcceptFriendRequest = async (requestId) => {
    try {
      await api.post(`/users/friend-request/${requestId}/accept`);
      loadFriendRequests();
      loadFriends();
      loadConversations();
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  // Reject friend request
  const handleRejectFriendRequest = async (requestId) => {
    try {
      await api.post(`/users/friend-request/${requestId}/reject`);
      loadFriendRequests();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  // View user profile
  const handleViewProfile = (user) => {
    setSelectedUser(user);
    setShowUserProfile(true);
  };

  // Start conversation with friend (Messenger-style)
  const handleStartConversation = async (friend) => {
    try {
      const currentUserId = chatService.getCurrentUserId();
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Check if conversation already exists in local state
      const existingConv = conversations.find(conv => 
        conv.participants.includes(friend._id) && conv.participants.includes(currentUserId)
      );
      
      if (existingConv) {
        // Conversation exists, just open it
        setCurrentConversation(existingConv);
        chatService.joinConversation(existingConv._id);
        await loadMessages(existingConv._id);
        setActiveTab(0);
        return;
      }
      
      // Create new conversation
      const response = await chatService.createConversation(
        [currentUserId, friend._id],
        [
          { userId: currentUserId, username: currentUser.username || 'You', avatar: currentUser.profile?.avatar },
          { userId: friend._id, username: friend.username, avatar: friend.profile?.avatar }
        ],
        'direct'
      );
      
      const conversation = response.conversation || response;
      if (conversation && conversation._id) {
        // Add to conversations list immediately
        setConversations(prev => {
          // Check if already exists
          if (prev.find(c => c._id === conversation._id)) {
            return prev;
          }
          return [conversation, ...prev];
        });
        
        // Set as current and join
        setCurrentConversation(conversation);
        chatService.joinConversation(conversation._id);
        
        // Load any existing messages
        await loadMessages(conversation._id);
        
        // Switch to conversations tab
        setActiveTab(0);
      } else {
        console.error('Invalid conversation response:', response);
        alert('Invalid response from server');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert(error.response?.data?.message || error.message || 'Failed to start conversation');
    }
  };

  // Delete conversation
  const handleDeleteConversation = async (conversationId, event) => {
    // Prevent triggering the conversation selection
    event.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    try {
      const currentUserId = chatService.getCurrentUserId();
      await api.delete(`/chat/conversations/${conversationId}?userId=${currentUserId}`);
      
      // Remove from local state
      setConversations(prev => prev.filter(c => c._id !== conversationId));
      
      // If this was the current conversation, clear it
      if (currentConversation?._id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
      
      console.log('Conversation deleted:', conversationId);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Failed to delete conversation: ' + (error.response?.data?.message || error.message));
    }
  };

  // Helper function to get the other participant in a conversation
  const getOtherParticipant = (conversation) => {
    if (!conversation || !conversation.participantDetails) return null;
    
    const currentUserId = chatService.getCurrentUserId();
    return conversation.participantDetails.find(p => p.userId !== currentUserId) || conversation.participantDetails[0];
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        sendAudioMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Update recording time every second
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
      audioChunksRef.current = [];
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      // Stop all tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  const sendAudioMessage = (audioBlob) => {
    if (!currentConversation) return;

    const currentUserId = chatService.getCurrentUserId();
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Convert blob to base64
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = () => {
      const base64Audio = reader.result;
      
      // Create optimistic message
      const optimisticMessage = {
        _id: `temp-${Date.now()}`,
        conversationId: currentConversation._id,
        senderId: currentUserId,
        senderUsername: currentUser.username || currentUser.email || 'You',
        content: base64Audio,
        type: 'audio',
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      // Add message to UI immediately
      setMessages(prev => {
        const updated = [...prev, optimisticMessage].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        return updated;
      });

      // Update conversation list preview
      setConversations(prev => {
        return prev.map(conv => {
          if (conv._id === currentConversation._id) {
            return {
              ...conv,
              lastMessage: {
                content: '🎤 Voice message',
                senderId: currentUserId,
                timestamp: new Date()
              }
            };
          }
          return conv;
        });
      });

      // Send via socket
      chatService.sendMessage(currentConversation._id, base64Audio, 'audio');
    };
  };

  // Handle audio playback
  const handlePlayAudio = useCallback((messageId, audioSrc) => {
    // If this audio is already playing, pause it
    if (playingAudio === messageId) {
      const audio = audioRefs.current[messageId];
      if (audio) {
        audio.pause();
        setPlayingAudio(null);
      }
      return;
    }

    // Pause any currently playing audio
    if (playingAudio && audioRefs.current[playingAudio]) {
      audioRefs.current[playingAudio].pause();
    }

    // Create or get audio element
    if (!audioRefs.current[messageId]) {
      const audio = new Audio(audioSrc);
      audio.onended = () => setPlayingAudio(null);
      audio.onerror = () => {
        console.error('Error playing audio');
        setPlayingAudio(null);
      };
      audioRefs.current[messageId] = audio;
    }

    // Play the audio
    const audio = audioRefs.current[messageId];
    audio.play()
      .then(() => setPlayingAudio(messageId))
      .catch(err => {
        console.error('Error playing audio:', err);
        setPlayingAudio(null);
      });
  }, [playingAudio]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <VuiBox py={3} sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <VuiBox mb={3} sx={{ flexShrink: 0 }}>
          <VuiTypography variant="h1" color={cardText} fontWeight="bold" display="flex" alignItems="center" gap={2} sx={{ fontSize: "1.875rem" }}>
            <IoChatbubbles size="36px" color="#0075FF" />
            Chat
          </VuiTypography>
          <VuiTypography variant="body2" color={subduedText}>
            Connect with other developers
          </VuiTypography>
        </VuiBox>

        <Grid container spacing={3} sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Left Sidebar with Tabs */}
          <Grid item xs={12} md={4} sx={{ height: '100%', minHeight: 0 }}>
            <Card
              sx={{
                background: panelBackground,
                border: panelBorder,
                borderRadius: "20px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* Tabs - Fixed */}
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{
                  background: tabContainerBackground,
                  borderRadius: "12px",
                  borderBottom: dividerBorder,
                  flexShrink: 0,
                  minHeight: "48px",
                  p: "4px",
                  "& .MuiTab-root": { 
                    color: `${tabTextColor} !important`,
                    fontWeight: "500",
                    fontSize: "0.875rem",
                    textTransform: "none",
                    minHeight: "48px",
                    background: tabBackground,
                    borderRadius: "10px",
                    "&:hover": {
                      background: darkMode ? "rgba(0, 117, 255, 0.1)" : "rgba(0, 117, 255, 0.08)",
                      color: `${tabSelectedTextColor} !important`,
                    }
                  },
                  "& .Mui-selected": { 
                    color: `${tabSelectedTextColor} !important`,
                    fontWeight: "600",
                    background: tabSelectedBackground,
                  },
                  "& .MuiTabs-indicator": {
                    backgroundColor: "#0075FF",
                    height: "3px",
                  }
                }}
              >
                <Tab label="Chats" />
                <Tab label="Friends" />
                <Tab label={`Requests (${friendRequests.length})`} />
              </Tabs>

              {/* Scrollable Content Area */}
              <VuiBox 
                p={2} 
                flex={1} 
                sx={{ 
                  overflowY: "auto",
                  overflowX: "hidden",
                  minHeight: 0,
                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "10px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "rgba(0, 117, 255, 0.5)",
                    borderRadius: "10px",
                    "&:hover": {
                      background: "rgba(0, 117, 255, 0.7)",
                    }
                  }
                }}
              >
                {/* Tab 0: Conversations */}
                {activeTab === 0 && (
                  <>
                    <VuiTypography variant="h2" color={cardText} fontWeight="bold" mb={2} sx={{ fontSize: "1.25rem" }}>
                      Conversations
                    </VuiTypography>
                    
                    {conversations.length === 0 ? (
                        <VuiTypography variant="body2" color={subduedText} textAlign="center" mt={4}>
                        No conversations yet. Add friends to start chatting!
                      </VuiTypography>
                    ) : (
                      <List>
                        {conversations.map((conv) => {
                          const otherUser = getOtherParticipant(conv);
                          // Check if last message is audio
                          const isLastMessageAudio = conv.lastMessage?.content && 
                            (typeof conv.lastMessage.content === 'string' && 
                             conv.lastMessage.content.startsWith('data:audio/'));
                          const displayContent = isLastMessageAudio 
                            ? '🎤 Voice message' 
                            : (conv.lastMessage?.content || 'No messages yet');
                          
                          return (
                            <ListItem
                              key={conv._id}
                              button
                              onClick={() => handleSelectConversation(conv)}
                              selected={currentConversation?._id === conv._id}
                              sx={{
                                borderRadius: "10px",
                                mb: 1,
                                background: currentConversation?._id === conv._id 
                                  ? listItemSelectedBackground 
                                  : listItemBackground,
                                border: currentConversation?._id === conv._id 
                                  ? "1px solid rgba(0, 117, 255, 0.2)" 
                                  : "1px solid transparent",
                                "&:hover": {
                                  background: darkMode ? "rgba(0, 117, 255, 0.1)" : "rgba(0, 117, 255, 0.08)",
                                },
                                "&:hover .delete-button": {
                                  opacity: 1,
                                }
                              }}
                            >
                              <Badge
                                color="success"
                                variant="dot"
                                invisible={!isUserOnline(otherUser?.userId)}
                                sx={{ mr: 2 }}
                              >
                                <Avatar sx={{ bgcolor: "#0075FF" }}>
                                  {otherUser?.username?.charAt(0).toUpperCase() || '?'}
                                </Avatar>
                              </Badge>
                              <ListItemText
                                primary={
                                  <VuiTypography variant="button" color={cardText}>
                                    {otherUser?.username || 'Unknown'}
                                  </VuiTypography>
                                }
                                secondary={
                                  <VuiTypography variant="caption" color={subduedText}>
                                    {displayContent}
                                  </VuiTypography>
                                }
                              />
                              <IconButton
                                className="delete-button"
                                aria-label="Delete conversation"
                                onClick={(e) => handleDeleteConversation(conv._id, e)}
                                sx={{
                                  opacity: 0,
                                  transition: "opacity 0.2s",
                                  color: "#FF0000",
                                  "&:hover": {
                                    background: "rgba(255, 0, 0, 0.1)",
                                  }
                                }}
                              >
                                <IoTrash size="18px" />
                              </IconButton>
                            </ListItem>
                          );
                        })}
                      </List>
                    )}
                  </>
                )}

                {/* Tab 1: Friends & Search */}
                {activeTab === 1 && (
                  <>
                    <VuiBox
                      mb={2}
                      sx={{
                        "& > div": {
                          background: darkMode ? "rgba(15, 21, 53, 0.96) !important" : "rgba(255, 255, 255, 0.96) !important",
                          border: darkMode
                            ? "1px solid rgba(226, 232, 240, 0.28) !important"
                            : "1px solid rgba(148, 163, 184, 0.45) !important",
                        },
                        "& .MuiInputBase-root": {
                          background: "transparent !important",
                        },
                        "& .MuiInputBase-input": {
                          color: darkMode ? "#f8fafc !important" : "#0f172a !important",
                        },
                        "& .MuiInputBase-input::placeholder": {
                          color: darkMode ? "rgba(203, 213, 225, 0.72) !important" : "rgba(71, 85, 105, 0.9) !important",
                          opacity: 1,
                        },
                        "& svg": {
                          color: darkMode ? "rgba(226, 232, 240, 0.88) !important" : "rgba(51, 65, 85, 0.9) !important",
                        },
                      }}
                    >
                      <VuiInput
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        icon={{ component: <IoSearch />, direction: "left" }}
                      />
                    </VuiBox>

                    {searchQuery.trim().length >= 2 && searchResults.length > 0 && (
                      <VuiBox mb={3}>
                        <VuiTypography variant="caption" color="text" mb={1}>
                          Search Results
                        </VuiTypography>
                        <List>
                          {searchResults.map((user) => (
                            <ListItem
                              key={user._id}
                              button
                              onClick={() => handleViewProfile(user)}
                              sx={{
                                borderRadius: "10px",
                                mb: 1,
                                background: listItemBackground,
                                border: darkMode ? "none" : "1px solid rgba(148, 163, 184, 0.14)",
                                "&:hover": {
                                  background: darkMode ? "rgba(0, 117, 255, 0.1)" : "rgba(0, 117, 255, 0.08)",
                                }
                              }}
                            >
                              <Avatar sx={{ bgcolor: "#0075FF", mr: 2 }}>
                                {user.username?.charAt(0).toUpperCase()}
                              </Avatar>
                              <ListItemText
                                primary={
                                  <VuiTypography variant="button" color={cardText}>
                                    {user.username}
                                  </VuiTypography>
                                }
                                secondary={
                                  <VuiTypography variant="caption" color={subduedText}>
                                    Level {user.profile?.level || 1}
                                  </VuiTypography>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </VuiBox>
                    )}

                    <VuiTypography variant="h2" color={cardText} fontWeight="bold" mb={2} sx={{ fontSize: "1.25rem" }}>
                      Friends ({friends.length})
                    </VuiTypography>
                    
                    {friends.length === 0 ? (
                        <VuiTypography variant="body2" color={subduedText} textAlign="center" mt={4}>
                        No friends yet. Search for users to add!
                      </VuiTypography>
                    ) : (
                      <List>
                        {friends.map((friend) => (
                          <ListItem
                            key={friend._id}
                            sx={{
                              borderRadius: "10px",
                              mb: 1,
                              background: listItemBackground,
                            }}
                          >
                            <Badge
                              color="success"
                              variant="dot"
                              invisible={!isUserOnline(friend._id)}
                              sx={{ mr: 2 }}
                            >
                              <Avatar sx={{ bgcolor: "#0075FF" }}>
                                {friend.username?.charAt(0).toUpperCase()}
                              </Avatar>
                            </Badge>
                            <ListItemText
                              primary={
                                  <VuiTypography variant="button" color={cardText}>
                                  {friend.username}
                                </VuiTypography>
                              }
                              secondary={
                                  <VuiTypography variant="caption" color={subduedText}>
                                  {isUserOnline(friend._id) ? 'Online' : 'Offline'}
                                </VuiTypography>
                              }
                            />
                            <VuiButton
                              color="info"
                              size="small"
                              onClick={() => handleStartConversation(friend)}
                            >
                              <IoChatbubbles size="16px" />
                            </VuiButton>
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </>
                )}

                {/* Tab 2: Friend Requests */}
                {activeTab === 2 && (
                  <>
                    <VuiTypography variant="h2" color={cardText} fontWeight="bold" mb={2} sx={{ fontSize: "1.25rem" }}>
                      Friend Requests
                    </VuiTypography>
                    
                    {friendRequests.length === 0 ? (
                        <VuiTypography variant="body2" color={subduedText} textAlign="center" mt={4}>
                        No pending friend requests
                      </VuiTypography>
                    ) : (
                      <List>
                        {friendRequests.map((request) => (
                          <ListItem
                            key={request._id}
                            sx={{
                              borderRadius: "10px",
                              mb: 1,
                              background: darkMode ? "rgba(255, 165, 0, 0.1)" : "rgba(255, 255, 255, 0.9)",
                              border: darkMode ? "1px solid rgba(255, 165, 0, 0.3)" : "1px solid rgba(245, 158, 11, 0.2)",
                            }}
                          >
                            <Avatar sx={{ bgcolor: "#FFA500", mr: 2 }}>
                              {request.from?.username?.charAt(0).toUpperCase()}
                            </Avatar>
                            <ListItemText
                              primary={
                                <VuiTypography variant="button" color={cardText}>
                                  {request.from?.username}
                                </VuiTypography>
                              }
                              secondary={
                                <VuiTypography variant="caption" color={subduedText}>
                                  Wants to be your friend
                                </VuiTypography>
                              }
                            />
                            <VuiBox display="flex" gap={1}>
                              <IconButton
                                aria-label="Accept friend request"
                                onClick={() => handleAcceptFriendRequest(request._id)}
                                sx={{ color: "#00FF00" }}
                              >
                                <IoCheckmark size="20px" />
                              </IconButton>
                              <IconButton
                                aria-label="Reject friend request"
                                onClick={() => handleRejectFriendRequest(request._id)}
                                sx={{ color: "#FF0000" }}
                              >
                                <IoClose size="20px" />
                              </IconButton>
                            </VuiBox>
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </>
                )}
              </VuiBox>
            </Card>
          </Grid>

          {/* Chat Window */}
          <Grid item xs={12} md={8} sx={{ height: '100%', minHeight: 0 }}>
            <Card
              sx={{
                background: panelBackground,
                border: panelBorder,
                borderRadius: "20px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {currentConversation ? (
                <>
                  {/* Chat Header - Fixed */}
                  <VuiBox 
                    p={2} 
                      borderBottom={dividerBorder}
                    sx={{ flexShrink: 0 }}
                  >
                    <VuiBox display="flex" alignItems="center" justifyContent="space-between" gap={2}>
                      {(() => {
                        const otherUser = getOtherParticipant(currentConversation);
                        return (
                          <VuiBox display="flex" alignItems="center" justifyContent="space-between" width="100%">
                            <VuiBox display="flex" alignItems="center" gap={2}>
                              <Badge
                                color="success"
                                variant="dot"
                                invisible={!isUserOnline(otherUser?.userId)}
                              >
                                <Avatar sx={{ bgcolor: "#0075FF" }}>
                                  {otherUser?.username?.charAt(0).toUpperCase() || '?'}
                                </Avatar>
                              </Badge>
                              <VuiBox>
                                <VuiTypography variant="h6" color={cardText} fontWeight="bold">
                                  {otherUser?.username || 'Unknown'}
                                </VuiTypography>
                                <VuiTypography variant="caption" color={subduedText}>
                                  {isUserOnline(otherUser?.userId) ? 'Online' : 'Offline'}
                                </VuiTypography>
                              </VuiBox>
                            </VuiBox>

                            <VuiButton
                              color="success"
                              size="small"
                              onClick={() => handleStartCall('audio')}
                              disabled={isCalling || isInCall || !otherUser?.userId}
                              sx={{ minWidth: "44px", width: "44px", height: "44px", p: 0 }}
                            >
                              <IoCall size="20px" />
                            </VuiButton>

                            <VuiButton
                              color="info"
                              size="small"
                              onClick={() => handleStartCall('video')}
                              disabled={isCalling || isInCall || !otherUser?.userId}
                              sx={{ minWidth: "44px", width: "44px", height: "44px", p: 0, ml: 1 }}
                            >
                              <IoVideocam size="20px" />
                            </VuiButton>
                          </VuiBox>
                        );
                      })()}
                    </VuiBox>
                  </VuiBox>

                  {/* Media elements for calls */}
                  <audio ref={localAudioElementRef} autoPlay muted aria-label="Your audio" />
                  <audio ref={remoteAudioElementRef} autoPlay aria-label="Friend's audio" />

                  {/* Messages - Scrollable Area */}
                  <VuiBox 
                    flex={1} 
                    p={2} 
                    sx={{ 
                      overflowY: "auto",
                      overflowX: "hidden",
                      minHeight: 0,
                      display: "flex",
                      flexDirection: "column", // Normal direction
                      "&::-webkit-scrollbar": {
                        width: "8px",
                      },
                      "&::-webkit-scrollbar-track": {
                        background: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(148, 163, 184, 0.12)",
                        borderRadius: "10px",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        background: "rgba(0, 117, 255, 0.5)",
                        borderRadius: "10px",
                        "&:hover": {
                          background: "rgba(0, 117, 255, 0.7)",
                        }
                      }
                    }}
                  >
                    <VuiBox>
                      {messages.map((msg, index) => {
                        const currentUserId = chatService.getCurrentUserId();
                        const isOwn = msg.senderId === currentUserId;
                        
                        // Detect if content is audio (base64 audio data)
                        const isAudioMessage = msg.type === 'audio' || 
                          (typeof msg.content === 'string' && msg.content.startsWith('data:audio/'));
                        
                        return (
                          <VuiBox
                            key={index}
                            display="flex"
                            justifyContent={isOwn ? "flex-end" : "flex-start"}
                            mb={2}
                          >
                            <VuiBox
                              sx={{
                                maxWidth: "70%",
                                padding: "12px 16px",
                                borderRadius: isOwn ? "15px 15px 0 15px" : "15px 15px 15px 0",
                                background: isOwn
                                  ? "linear-gradient(135deg, #0075FF, #00C6FF)"
                                    : messageBubbleBackground,
                                border: isOwn ? "none" : (darkMode ? "none" : "1px solid rgba(148, 163, 184, 0.12)"),
                              }}
                            >
                              {!isOwn && (
                                  <VuiTypography variant="caption" color="info" fontWeight="bold" display="block" mb={0.5}>
                                  {msg.senderUsername}
                                </VuiTypography>
                              )}
                              
                              {/* Render audio message or text message */}
                              {isAudioMessage ? (
                                <VuiBox display="flex" alignItems="center" gap={2}>
                                  <IconButton
                                    aria-label={playingAudio === msg._id ? "Pause audio message" : "Play audio message"}
                                    onClick={() => handlePlayAudio(msg._id, msg.content)}
                                    sx={{
                                      background: isOwn 
                                        ? "rgba(255, 255, 255, 0.2)" 
                                        : "rgba(0, 117, 255, 0.3)",
                                      color: "white",
                                      width: "48px",
                                      height: "48px",
                                      "&:hover": {
                                        background: isOwn 
                                          ? "rgba(255, 255, 255, 0.3)" 
                                          : "rgba(0, 117, 255, 0.5)",
                                      }
                                    }}
                                  >
                                    {playingAudio === msg._id ? (
                                      <IoPause size="24px" />
                                    ) : (
                                      <IoPlay size="24px" />
                                    )}
                                  </IconButton>
                                  <VuiBox>
                                    <VuiTypography variant="button" color={messageBodyColor}>
                                      🎤 Voice message
                                    </VuiTypography>
                                      <VuiTypography variant="caption" color="text" display="block">
                                      {playingAudio === msg._id ? 'Playing...' : 'Click to play'}
                                    </VuiTypography>
                                  </VuiBox>
                                </VuiBox>
                              ) : (
                                  <VuiTypography variant="body2" color={messageBodyColor} sx={{ wordBreak: "break-word" }}>
                                  {msg.content}
                                </VuiTypography>
                              )}
                              
                                <VuiTypography variant="caption" color="text" display="block" textAlign="right" mt={0.5}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </VuiTypography>
                            </VuiBox>
                          </VuiBox>
                        );
                      })}
                      
                      {/* Typing Indicator */}
                      {typingUsers.length > 0 && (
                        <VuiBox display="flex" alignItems="center" gap={1} mb={2}>
                          <VuiTypography variant="caption" color={subduedText} fontStyle="italic">
                            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                          </VuiTypography>
                        </VuiBox>
                      )}
                      
                      {/* Scroll anchor */}
                      <div ref={messagesEndRef} />
                    </VuiBox>
                  </VuiBox>

                  {/* Message Input - Fixed */}
                  <VuiBox 
                    p={2} 
                    borderTop={dividerBorder}
                    sx={{ flexShrink: 0, background: inputWrapBackground }}
                  >
                    {/* Recording Indicator */}
                    {isRecording && (
                      <VuiBox 
                        display="flex" 
                        alignItems="center" 
                        gap={2} 
                        mb={2}
                        p={2}
                        sx={{
                          background: "rgba(255, 0, 0, 0.1)",
                          borderRadius: "10px",
                          border: "1px solid rgba(255, 0, 0, 0.3)",
                        }}
                      >
                        <VuiBox
                          sx={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            background: "#FF0000",
                            animation: "pulse 1.5s ease-in-out infinite",
                            "@keyframes pulse": {
                              "0%, 100%": { opacity: 1 },
                              "50%": { opacity: 0.3 },
                            }
                          }}
                        />
                        <VuiTypography variant="button" color={cardText} flex={1}>
                          Recording... {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                        </VuiTypography>
                        <VuiButton
                          color="error"
                          size="small"
                          onClick={cancelRecording}
                          sx={{ minWidth: "auto", padding: "8px 16px" }}
                        >
                          <IoClose size="18px" style={{ marginRight: "4px" }} />
                          Cancel
                        </VuiButton>
                        <VuiButton
                          color="success"
                          size="small"
                          onClick={stopRecording}
                          sx={{ minWidth: "auto", padding: "8px 16px" }}
                        >
                          <IoStop size="18px" style={{ marginRight: "4px" }} />
                          Send
                        </VuiButton>
                      </VuiBox>
                    )}

                    {/* Message Input Row */}
                    <VuiBox display="flex" gap={2} alignItems="center">
                      <VuiInput
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={handleTypingInput}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={isRecording}
                        sx={{ flex: 1 }}
                      />
                      
                      {/* Voice Message Button */}
                      {!isRecording && (
                        <VuiButton
                          color="warning"
                          onClick={startRecording}
                          sx={{
                            minWidth: "50px",
                            background: "linear-gradient(135deg, #FF6B00, #FFA500)",
                          }}
                        >
                          <IoMic size="20px" />
                        </VuiButton>
                      )}
                      
                      {/* Send Text Message Button */}
                      <VuiButton
                        color="info"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isRecording}
                        sx={{
                          minWidth: "50px",
                          background: "linear-gradient(135deg, #0075FF, #00C6FF)",
                        }}
                      >
                        <IoSend size="20px" />
                      </VuiButton>
                    </VuiBox>
                  </VuiBox>
                </>
              ) : (
                <VuiBox display="flex" alignItems="center" justifyContent="center" height="100%">
                  <VuiBox textAlign="center">
                    <IoChatbubbles size="80px" color={darkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(15, 23, 42, 0.22)"} />
                    <VuiTypography variant="h5" color={subduedText} mt={2}>
                      Select a conversation to start chatting
                    </VuiTypography>
                  </VuiBox>
                </VuiBox>
              )}
            </Card>
          </Grid>
        </Grid>

        {/* Incoming Call Dialog */}
        <Dialog
          open={Boolean(incomingCall)}
          onClose={handleRejectIncomingCall}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              background: panelBackground,
              border: darkMode ? "1px solid rgba(0, 198, 255, 0.6)" : "1px solid rgba(148, 163, 184, 0.2)",
            },
          }}
        >
          <DialogTitle>
            <VuiTypography variant="h5" color={cardText} fontWeight="bold" textAlign="center">
              {incomingCall?.callType === 'video' ? 'Incoming Video Call' : 'Incoming Call'}
            </VuiTypography>
          </DialogTitle>
          <DialogContent>
            <VuiTypography color={subduedText} textAlign="center">
              {incomingCall?.callerUsername || "Someone"} is calling you.
            </VuiTypography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
            <VuiButton color="error" onClick={handleRejectIncomingCall}>
              <IoClose size="18px" style={{ marginRight: "6px" }} />
              Reject
            </VuiButton>
            <VuiButton color="success" onClick={handleAcceptIncomingCall}>
              <IoCall size="18px" style={{ marginRight: "6px" }} />
              Accept
            </VuiButton>
          </DialogActions>
        </Dialog>

        {/* Active Call Dialog */}
        <Dialog
          open={isCalling || isInCall}
          onClose={handleEndCall}
          maxWidth={callType === 'video' ? 'md' : 'xs'}
          fullWidth
          PaperProps={{
            sx: {
              background: panelBackground,
              border: darkMode ? "1px solid rgba(0, 198, 255, 0.6)" : "1px solid rgba(148, 163, 184, 0.2)",
            },
          }}
        >
          <DialogTitle>
            <VuiTypography variant="h5" color={cardText} fontWeight="bold" textAlign="center">
              {isCalling ? "Calling" : (callType === 'video' ? "Video Call" : "Voice Call")}
            </VuiTypography>
          </DialogTitle>
          <DialogContent>
            <VuiTypography color={subduedText} textAlign="center">
              {callStatus}
            </VuiTypography>
            {callType === 'video' && (
              <VuiBox mt={2}>
                <VuiBox
                  sx={{
                    width: '100%',
                    height: '220px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.75)',
                    border: darkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(148,163,184,0.2)',
                    mb: 2,
                  }}
                >
                  <video
                    aria-label="Friend's video feed"
                    autoPlay
                    playsInline
                    ref={remoteVideoElementRef}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </VuiBox>
                <VuiBox
                  sx={{
                    width: '140px',
                    height: '92px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.8)',
                    border: darkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(148,163,184,0.2)',
                  }}
                >
                  <video
                    aria-label="Your video feed"
                    autoPlay
                    muted
                    playsInline
                    ref={localVideoElementRef}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </VuiBox>
              </VuiBox>
            )}
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
            <VuiButton color="error" onClick={handleEndCall}>
              <IoClose size="18px" style={{ marginRight: "6px" }} />
              End Call
            </VuiButton>
          </DialogActions>
        </Dialog>

        {/* User Profile Dialog */}
        <Dialog
          open={showUserProfile}
          onClose={() => setShowUserProfile(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: panelBackground,
              border: darkMode ? "2px solid #0075FF" : "1px solid rgba(148, 163, 184, 0.2)",
            }
          }}
        >
          <DialogTitle>
            <VuiTypography variant="h5" color={cardText} fontWeight="bold">
              User Profile
            </VuiTypography>
          </DialogTitle>
          <DialogContent>
            {selectedUser && (
              <VuiBox textAlign="center" py={2}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    bgcolor: "#0075FF",
                    margin: "0 auto 16px",
                    fontSize: "40px"
                  }}
                >
                  {selectedUser.username?.charAt(0).toUpperCase()}
                </Avatar>
                
                <VuiTypography variant="h4" color={cardText} fontWeight="bold" mb={1}>
                  {selectedUser.username}
                </VuiTypography>
                
                <VuiTypography variant="body2" color={subduedText} mb={2}>
                  {selectedUser.email}
                </VuiTypography>

                <VuiBox
                  display="flex"
                  justifyContent="center"
                  gap={4}
                  mb={3}
                  p={2}
                  sx={{
                    background: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.75)",
                    borderRadius: "15px",
                    border: darkMode ? "none" : "1px solid rgba(148,163,184,0.16)",
                  }}
                >
                  <VuiBox textAlign="center">
                    <VuiTypography variant="h5" color="info" fontWeight="bold">
                      {selectedUser.profile?.level || 1}
                    </VuiTypography>
                    <VuiTypography variant="caption" color={subduedText}>
                      Level
                    </VuiTypography>
                  </VuiBox>
                  <VuiBox textAlign="center">
                    <VuiTypography variant="h5" color="warning" fontWeight="bold">
                      {selectedUser.profile?.xp || 0}
                    </VuiTypography>
                    <VuiTypography variant="caption" color={subduedText}>
                      XP
                    </VuiTypography>
                  </VuiBox>
                  <VuiBox textAlign="center">
                    <VuiTypography variant="h5" color="success" fontWeight="bold">
                      {selectedUser.profile?.achievements?.length || 0}
                    </VuiTypography>
                    <VuiTypography variant="caption" color={subduedText}>
                      Badges
                    </VuiTypography>
                  </VuiBox>
                </VuiBox>

                {selectedUser.profile?.bio && (
                  <VuiBox mb={2}>
                    <VuiTypography variant="body2" color={subduedText}>
                      {selectedUser.profile.bio}
                    </VuiTypography>
                  </VuiBox>
                )}
              </VuiBox>
            )}
          </DialogContent>
          <DialogActions>
            <VuiButton
              color="secondary"
              onClick={() => setShowUserProfile(false)}
            >
              Close
            </VuiButton>
            <VuiButton
              color="info"
              onClick={() => handleSendFriendRequest(selectedUser._id)}
              sx={{
                background: "linear-gradient(135deg, #0075FF, #00C6FF)",
              }}
            >
              <IoPersonAdd size="18px" style={{ marginRight: "8px" }} />
              Add Friend
            </VuiButton>
          </DialogActions>
        </Dialog>
      </VuiBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Chat;
