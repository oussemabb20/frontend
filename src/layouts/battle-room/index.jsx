import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Grid, Card, LinearProgress, Dialog, DialogContent, Tabs, Tab } from "@mui/material";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiButton from "components/VuiButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import CodeEditor from "components/CodeEditor";
import { 
  IoGameController, 
  IoTime, 
  IoCheckmarkCircle, 
  IoCloseCircle, 
  IoTrophy,
  IoFlag,
  IoPlay,
  IoArrowBack,
  IoMic,
  IoMicOff,
  IoCall,
  IoCallOutline
} from "react-icons/io5";
import battleService from "services/battle.service";
import { runCode } from "services/codeExecution.service";

const WIN_BASE_XP = 100;
const FIRST_SOLVER_BONUS_XP = 30;

const STARTER_TEMPLATES = {
  javascript: 'const lines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\\n");\n// your code here\nconsole.log();',
  typescript: 'const lines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\\n");\n// your code here\nconsole.log();',
  python: '# Write your solution here\nimport sys\n\ndef main():\n    data = sys.stdin.read().split()\n    # your code here\n\nif __name__ == "__main__":\n    main()',
  java: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // your code here\n    }\n}',
  cpp: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // your code here\n    return 0;\n}',
  csharp: 'using System;\n\nclass Solution {\n    static void Main(string[] args) {\n        // your code here\n    }\n}',
  go: 'package main\n\nimport (\n    "bufio"\n    "fmt"\n    "os"\n)\n\nfunc main() {\n    reader := bufio.NewReader(os.Stdin)\n    _ = reader\n    // your code here\n    fmt.Println()\n}',
  rust: 'use std::io::{self, BufRead};\n\nfn main() {\n    let stdin = io::stdin();\n    let mut lines = stdin.lock().lines();\n    // your code here\n}',
};

function BattleRoom() {
  const { battleId } = useParams();
  const navigate = useNavigate();
  const [battle, setBattle] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [battleCompleted, setBattleCompleted] = useState(false);
  const [winner, setWinner] = useState(null);
  const [winnerTeam, setWinnerTeam] = useState(null);
  const [winnerRewardXp, setWinnerRewardXp] = useState(0);
  const [participantRewards, setParticipantRewards] = useState([]);
  const [opponentProgress, setOpponentProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [showForfeitDialog, setShowForfeitDialog] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("Run code to see output.");
  const timerRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const pendingIceCandidatesRef = useRef([]);
  const makingOfferRef = useRef(false);
  const ignoreOfferRef = useRef(false);
  const [voiceSupported] = useState(
    typeof window !== "undefined" &&
      Boolean(window.RTCPeerConnection) &&
      Boolean(navigator?.mediaDevices?.getUserMedia),
  );
  const [voiceConnecting, setVoiceConnecting] = useState(false);
  const [voiceConnected, setVoiceConnected] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [opponentMuted, setOpponentMuted] = useState(false);
  const [voiceError, setVoiceError] = useState("");

  useEffect(() => {
    initializeBattle();
    
    // Setup event listeners
    const unsubscribeProgress = battleService.onProgressUpdate(handleProgressUpdate);
    const unsubscribeCompleted = battleService.onBattleCompleted(handleBattleCompleted);
    const unsubscribeVoiceOffer = battleService.onVoiceOffer(handleVoiceOffer);
    const unsubscribeVoiceAnswer = battleService.onVoiceAnswer(handleVoiceAnswer);
    const unsubscribeVoiceIceCandidate = battleService.onVoiceIceCandidate(handleVoiceIceCandidate);
    const unsubscribeVoiceEnd = battleService.onVoiceEnd(handleVoiceEnd);
    const unsubscribeVoiceMuteChanged = battleService.onVoiceMuteChanged(handleVoiceMuteChanged);

    return () => {
      unsubscribeProgress();
      unsubscribeCompleted();
      unsubscribeVoiceOffer();
      unsubscribeVoiceAnswer();
      unsubscribeVoiceIceCandidate();
      unsubscribeVoiceEnd();
      unsubscribeVoiceMuteChanged();
      cleanupVoiceConnection(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [battleId]);

  const initializeBattle = async () => {
    try {
      setLoading(true);
      setWinnerRewardXp(0);
      setWinnerTeam(null);
      setParticipantRewards([]);
      
      // Initialize socket if not already done
      const token = localStorage.getItem('accessToken');
      battleService.initializeSocket(token);

      // Join battle room
      const battleData = await battleService.joinBattleRoom(battleId);
      setBattle(battleData);
      
      const challengeLanguage = battleData.challenge?.language || 'javascript';
      setLanguage(challengeLanguage);

      // Set initial code with robust fallback
      const starterCode = battleData.challenge?.starterCode;
      if (typeof starterCode === 'object' && starterCode !== null) {
        setCode(
          starterCode[challengeLanguage] ||
          starterCode.javascript ||
          STARTER_TEMPLATES[challengeLanguage] ||
          STARTER_TEMPLATES.javascript,
        );
      } else if (typeof starterCode === 'string' && starterCode.trim().length > 0) {
        setCode(starterCode);
      } else {
        setCode(STARTER_TEMPLATES[challengeLanguage] || STARTER_TEMPLATES.javascript);
      }

      // Calculate time left
      if (battleData.startTime && battleData.timeLimit) {
        const startTime = new Date(battleData.startTime).getTime();
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const remaining = Math.max(0, battleData.timeLimit - elapsed);
        setTimeLeft(Math.floor(remaining / 1000));
        
        // Start countdown timer
        startTimer();
      }

      setLoading(false);
    } catch (error) {
      console.error('Error initializing battle:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleProgressUpdate = (data) => {
    console.log('Progress update:', data);
    const currentUserId = battleService.getCurrentUserId();

    setBattle((currentBattle) => {
      if (!currentBattle) return currentBattle;

      return {
        ...currentBattle,
        players: (currentBattle.players || []).map((player) => (
          String(player.userId) === String(data.userId)
            ? {
                ...player,
                progress: data.progress,
                score: data.score,
                submissions: data.submissions,
              }
            : player
        )),
      };
    });
    
    if (data.userId !== currentUserId && battle?.mode !== 'team') {
      setOpponentProgress({
        username: data.username,
        progress: data.progress,
        score: data.score,
        submissions: data.submissions,
      });
    }
  };

  const handleBattleCompleted = (data) => {
    console.log('Battle completed:', data);
    setBattleCompleted(true);
    setWinner(data.winner);
    setWinnerTeam(data.winnerTeam || null);
    setParticipantRewards(Array.isArray(data.participantRewards) ? data.participantRewards : []);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const winnerId = String(data?.winner?.userId || '');
    const currentUserId = String(battleService.getCurrentUserId() || '');
    const isCurrentUserWinner = winnerId && currentUserId && winnerId === currentUserId;
    const serverRewardXp = Number(data?.winnerRewardXp || 0);
    const bonusXp = Number(data?.firstSolverBonusXp || 0);

    if (!isCurrentUserWinner) {
      setWinnerRewardXp(0);
      return;
    }

    const fallbackReward = WIN_BASE_XP + (bonusXp || FIRST_SOLVER_BONUS_XP);
    const winnerXpReward = serverRewardXp > 0 ? serverRewardXp : fallbackReward;

    setWinnerRewardXp(winnerXpReward);

    setSubmissionMessage(
      `Victory bonus awarded: +${winnerXpReward} XP.`,
    );
  };

  const handleSubmitCode = async () => {
    if (!code.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const result = await battleService.submitCode(battleId, code, language);

      setSubmissionMessage(
        `Submitted to battle successfully${result.completed ? " - challenge solved" : ""}.`,
      );
      
      if (result.completed) {
        // Battle completed for this user
        console.log('All test cases passed!');
      }
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmissionMessage(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRunCode = async (codeToRun, langToRun) => {
    if (!codeToRun?.trim() || isRunning) return;

    try {
      setIsRunning(true);
      setSubmissionMessage("Running code...");

      const executionResult = await runCode(
        codeToRun,
        langToRun,
        battle?.challenge?.testCases || [],
      );

      setTestResults(executionResult.testResults || []);
      const passedTests = Number(executionResult.passedTests || 0);
      const totalTests = Number(executionResult.totalTests || 0);
      const allPassed = totalTests > 0 && passedTests === totalTests;

      setSubmissionMessage(
        `Run complete: ${passedTests}/${totalTests} tests passed.${allPassed ? " Finalizing battle result..." : ""}`,
      );

      // If solution is complete, finalize immediately so winner is revealed without extra submit step.
      if (allPassed) {
        setIsSubmitting(true);
        try {
          const submitResult = await battleService.submitCode(battleId, codeToRun, langToRun);
          setSubmissionMessage(
            `All tests passed. ${submitResult.completed ? "Battle completed - waiting for winner announcement." : "Progress submitted."}`,
          );
        } catch (submitError) {
          setSubmissionMessage(`All tests passed locally, but failed to finalize battle: ${submitError?.message || "unknown error"}`);
        } finally {
          setIsSubmitting(false);
        }
      }
    } catch (runError) {
      console.error("Error running code:", runError);
      setSubmissionMessage(`Error: ${runError?.message || "Failed to run code."}`);
      setTestResults([]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleForfeit = async () => {
    setShowForfeitDialog(true);
  };

  const confirmForfeit = async () => {
    try {
      await battleService.forfeitBattle(battleId);
      setShowForfeitDialog(false);
      navigate('/battles');
    } catch (error) {
      console.error('Error forfeiting battle:', error);
      setShowForfeitDialog(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (progress, total) => {
    return total > 0 ? (progress / total) * 100 : 0;
  };

  const currentUserId = String(battleService.getCurrentUserId() || "");
  const opponentPlayer = (battle?.players || []).find(
    (player) => String(player.userId) !== currentUserId,
  );
  const voiceChatAvailable = battle?.mode !== "team" && Boolean(opponentPlayer);

  const stopLocalStream = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
  };

  const cleanupVoiceConnection = (keepLocalStream = false) => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onconnectionstatechange = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    pendingIceCandidatesRef.current = [];
    makingOfferRef.current = false;
    ignoreOfferRef.current = false;

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }

    if (!keepLocalStream) {
      stopLocalStream();
      setVoiceMuted(false);
    }

    setVoiceConnecting(false);
    setVoiceConnected(false);
    setOpponentMuted(false);
  };

  const ensureLocalAudio = async () => {
    if (localStreamRef.current) {
      return localStreamRef.current;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    });

    localStreamRef.current = stream;
    setVoiceMuted(stream.getAudioTracks().every((track) => !track.enabled));
    return stream;
  };

  const createPeerConnection = (targetUserId) => {
    if (peerConnectionRef.current) {
      return peerConnectionRef.current;
    }

    const connection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    connection.onicecandidate = (event) => {
      if (event.candidate) {
        battleService.sendVoiceIceCandidate(battleId, targetUserId, event.candidate.toJSON());
      }
    };

    connection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteAudioRef.current && remoteStream) {
        remoteAudioRef.current.srcObject = remoteStream;
        remoteAudioRef.current.play().catch(() => null);
      }
      setVoiceConnecting(false);
      setVoiceConnected(true);
      setVoiceError("");
    };

    connection.onconnectionstatechange = () => {
      const state = connection.connectionState;

      if (state === "connected") {
        setVoiceConnecting(false);
        setVoiceConnected(true);
        setVoiceError("");
      }

      if (state === "failed" || state === "disconnected" || state === "closed") {
        cleanupVoiceConnection(true);
        if (state === "failed") {
          setVoiceError("Voice chat connection failed. Try starting the mic again.");
        }
      }
    };

    peerConnectionRef.current = connection;
    return connection;
  };

  const attachLocalTracks = async (connection) => {
    const stream = await ensureLocalAudio();
    const existingTrackIds = new Set(
      connection.getSenders().map((sender) => sender.track?.id).filter(Boolean),
    );

    stream.getTracks().forEach((track) => {
      if (!existingTrackIds.has(track.id)) {
        connection.addTrack(track, stream);
      }
    });
  };

  const flushPendingIceCandidates = async (connection) => {
    for (const candidate of pendingIceCandidatesRef.current) {
      try {
        await connection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (iceError) {
        console.error("Error applying queued ICE candidate:", iceError);
      }
    }
    pendingIceCandidatesRef.current = [];
  };

  const startVoiceChat = async () => {
    if (!voiceSupported || !opponentPlayer || !battleId) {
      console.log('❌ [BattleRoom] Cannot start voice chat:', {
        voiceSupported,
        hasOpponent: !!opponentPlayer,
        hasBattleId: !!battleId,
      });
      return;
    }

    try {
      console.log('🎤 [BattleRoom] Starting voice chat');
      console.log('  - Opponent:', opponentPlayer.username, '(', opponentPlayer.userId, ')');
      console.log('  - Battle ID:', battleId);
      
      setVoiceError("");
      setVoiceConnecting(true);
      const connection = createPeerConnection(String(opponentPlayer.userId));
      await attachLocalTracks(connection);

      makingOfferRef.current = true;
      console.log('  - Creating offer');
      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);
      
      console.log('✅ [BattleRoom] Sending voice offer to:', opponentPlayer.username);
      battleService.sendVoiceOffer(
        battleId,
        String(opponentPlayer.userId),
        connection.localDescription || offer,
      );
    } catch (voiceStartError) {
      console.error("❌ [BattleRoom] Error starting voice chat:", voiceStartError);
      cleanupVoiceConnection(false);
      setVoiceError(
        voiceStartError?.name === "NotAllowedError"
          ? "Microphone access was blocked. Please allow the mic and try again."
          : voiceStartError?.message || "Unable to start voice chat.",
      );
    } finally {
      makingOfferRef.current = false;
    }
  };

  const endVoiceChat = (notifyPeer = true) => {
    if (notifyPeer && opponentPlayer && battleId) {
      try {
        battleService.sendVoiceEnd(battleId, String(opponentPlayer.userId));
      } catch (voiceEndError) {
        console.error("Error notifying voice end:", voiceEndError);
      }
    }

    cleanupVoiceConnection(false);
  };

  const toggleMicrophone = () => {
    const stream = localStreamRef.current;
    if (!stream || !opponentPlayer || !battleId) {
      return;
    }

    const nextMuted = !voiceMuted;
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });
    setVoiceMuted(nextMuted);
    battleService.sendVoiceMuteChanged(
      battleId,
      String(opponentPlayer.userId),
      nextMuted,
    );
  };

  const handleVoiceOffer = async (data) => {
    console.log('🎤 [BattleRoom] Received voice offer:', data);
    console.log('  - Battle ID:', data?.battleId);
    console.log('  - Current Battle ID:', battleId);
    console.log('  - Sender User ID:', data?.userId);
    console.log('  - Sender Username:', data?.username);
    
    if (!battleId || data?.battleId !== battleId) {
      console.log('❌ [BattleRoom] Battle ID mismatch, ignoring offer');
      return;
    }

    try {
      setVoiceError("");
      setVoiceConnecting(true);

      const senderId = String(data.userId || "");
      console.log('  - Creating peer connection for sender:', senderId);
      const connection = createPeerConnection(senderId);
      const offerCollision =
        makingOfferRef.current || connection.signalingState !== "stable";
      const polite = currentUserId > senderId;

      console.log('  - Offer collision:', offerCollision);
      console.log('  - Polite:', polite);

      ignoreOfferRef.current = !polite && offerCollision;
      if (ignoreOfferRef.current) {
        console.log('⚠️ [BattleRoom] Ignoring offer due to collision');
        return;
      }

      if (offerCollision) {
        console.log('  - Handling collision with rollback');
        await Promise.all([
          connection.setLocalDescription({ type: "rollback" }),
          connection.setRemoteDescription(new RTCSessionDescription(data.offer)),
        ]);
      } else {
        console.log('  - Setting remote description');
        await connection.setRemoteDescription(new RTCSessionDescription(data.offer));
      }

      console.log('  - Attaching local tracks');
      await attachLocalTracks(connection);
      console.log('  - Flushing pending ICE candidates');
      await flushPendingIceCandidates(connection);

      console.log('  - Creating answer');
      const answer = await connection.createAnswer();
      await connection.setLocalDescription(answer);
      
      console.log('✅ [BattleRoom] Sending voice answer to:', senderId);
      battleService.sendVoiceAnswer(
        battleId,
        senderId,
        connection.localDescription || answer,
      );
    } catch (voiceOfferError) {
      console.error("❌ [BattleRoom] Error handling voice offer:", voiceOfferError);
      cleanupVoiceConnection(false);
      setVoiceError(
        voiceOfferError?.name === "NotAllowedError"
          ? "Microphone access is needed to answer voice chat."
          : voiceOfferError?.message || "Unable to answer voice chat.",
      );
    }
  };

  const handleVoiceAnswer = async (data) => {
    console.log('🎤 [BattleRoom] Received voice answer:', data);
    console.log('  - Battle ID:', data?.battleId);
    console.log('  - Current Battle ID:', battleId);
    console.log('  - Sender User ID:', data?.userId);
    console.log('  - Sender Username:', data?.username);
    
    if (!peerConnectionRef.current || !battleId || data?.battleId !== battleId) {
      console.log('❌ [BattleRoom] Cannot handle answer - peer connection or battle ID issue');
      return;
    }

    try {
      console.log('  - Setting remote description from answer');
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(data.answer),
      );
      console.log('  - Flushing pending ICE candidates');
      await flushPendingIceCandidates(peerConnectionRef.current);
      setVoiceConnecting(false);
      setVoiceConnected(true);
      console.log('✅ [BattleRoom] Voice answer handled successfully');
    } catch (voiceAnswerError) {
      console.error("❌ [BattleRoom] Error handling voice answer:", voiceAnswerError);
      setVoiceError("Unable to connect the voice chat.");
    }
  };

  const handleVoiceIceCandidate = async (data) => {
    if (!battleId || data?.battleId !== battleId || ignoreOfferRef.current) {
      return;
    }

    const connection = peerConnectionRef.current;
    if (!connection) {
      pendingIceCandidatesRef.current.push(data.candidate);
      return;
    }

    if (!connection.remoteDescription) {
      pendingIceCandidatesRef.current.push(data.candidate);
      return;
    }

    try {
      await connection.addIceCandidate(new RTCIceCandidate(data.candidate));
    } catch (iceError) {
      console.error("Error adding ICE candidate:", iceError);
    }
  };

  const handleVoiceEnd = (data) => {
    if (!battleId || data?.battleId !== battleId) {
      return;
    }

    cleanupVoiceConnection(false);
    setVoiceError(`${data?.username || "Your opponent"} ended the voice chat.`);
  };

  const handleVoiceMuteChanged = (data) => {
    if (!battleId || data?.battleId !== battleId) {
      return;
    }

    setOpponentMuted(Boolean(data?.muted));
  };

  const teamPlayers = (teamSide) => (battle?.players || []).filter((player) => player.team === teamSide);

  const teamProgress = (teamSide) => {
    const players = teamPlayers(teamSide);
    if (players.length === 0) return 0;
    const totalProgress = players.reduce((sum, player) => sum + Number(player.progress || 0), 0);
    const totalTests = Number(battle?.challenge?.testCases?.length || 0);
    return totalTests > 0 ? (totalProgress / (players.length * totalTests)) * 100 : 0;
  };

  const handleLanguageChange = (nextLanguage) => {
    setLanguage(nextLanguage);
    setCode(STARTER_TEMPLATES[nextLanguage] || STARTER_TEMPLATES.javascript);
    setTestResults([]);
    setSubmissionMessage("Language changed. Run code to see output.");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <VuiBox py={3} display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <VuiTypography variant="h4" color="white">
            Loading battle room...
          </VuiTypography>
        </VuiBox>
        <Footer />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <VuiBox py={3}>
          <Card sx={{ background: "rgba(255, 0, 0, 0.1)", border: "1px solid #FF0000" }}>
            <VuiBox p={3} textAlign="center">
              <VuiTypography variant="h4" color="error" mb={2}>
                Error Loading Battle
              </VuiTypography>
              <VuiTypography variant="body1" color="text" mb={3}>
                {error}
              </VuiTypography>
              <VuiButton color="info" onClick={() => navigate('/battles')}>
                Back to Battles
              </VuiButton>
            </VuiBox>
          </Card>
        </VuiBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <VuiBox py={3}>
        {/* Battle Header */}
        <VuiBox mb={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <VuiBox>
            <VuiBox display="flex" alignItems="center" gap={2} mb={1}>
              <VuiButton
                color="info"
                variant="outlined"
                onClick={() => navigate('/battles')}
                sx={{
                  minWidth: "auto",
                  padding: "10px 14px",
                  borderWidth: "2px",
                  borderColor: "rgba(0, 117, 255, 0.5)",
                }}
              >
                <IoArrowBack size="20px" />
              </VuiButton>
              <IoGameController size="30px" color="#FF4500" />
              <VuiTypography variant="h3" color="white" fontWeight="bold">
                {battle?.challenge?.title || `${battle?.mode} Battle`}
              </VuiTypography>
            </VuiBox>
            <VuiTypography variant="button" color="text">
              {battle?.mode} battle in progress
            </VuiTypography>
          </VuiBox>

          <VuiBox textAlign={{ xs: "left", md: "right" }}>
            <VuiBox display="flex" alignItems="center" justifyContent={{ xs: "flex-start", md: "flex-end" }} gap={1} mb={0.5}>
              <IoTime size="18px" color="#FF4500" />
              <VuiTypography variant="h5" color="white" fontWeight="bold">
                {formatTime(timeLeft)}
              </VuiTypography>
            </VuiBox>
            <VuiTypography variant="caption" color="text">
              Time Remaining
            </VuiTypography>
          </VuiBox>
        </VuiBox>

        {voiceChatAvailable && (
          <VuiBox mb={3}>
            <Card
              sx={{
                background: "linear-gradient(127.09deg, rgba(0, 117, 255, 0.14) 19.41%, rgba(0, 198, 255, 0.08) 76.65%)",
                border: "1px solid rgba(0, 117, 255, 0.35)",
                borderRadius: "16px",
              }}
            >
              <VuiBox
                p={2}
                display="flex"
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
                flexDirection={{ xs: "column", md: "row" }}
                gap={2}
              >
                <VuiBox>
                  <VuiTypography variant="h6" color="white" fontWeight="bold" mb={0.5}>
                    Voice Chat
                  </VuiTypography>
                  <VuiTypography variant="caption" color="text">
                    Talk with {opponentPlayer?.username || "your opponent"} while you battle.
                  </VuiTypography>
                  <VuiTypography
                    variant="caption"
                    sx={{
                      display: "block",
                      mt: 1,
                      color: voiceError
                        ? "#ff9a9a"
                        : voiceConnected
                          ? "#98ffd7"
                          : voiceConnecting
                            ? "#9cc7ff"
                            : opponentMuted
                              ? "#ffd37a"
                              : "rgba(255,255,255,0.7)",
                    }}
                  >
                    {voiceError ||
                      (voiceConnected
                        ? opponentMuted
                          ? `${opponentPlayer?.username || "Opponent"} muted their microphone.`
                          : `Connected with ${opponentPlayer?.username || "your opponent"}.`
                        : voiceConnecting
                          ? "Connecting microphone..."
                          : voiceSupported
                            ? "Start the microphone to begin talking."
                            : "This browser does not support in-battle voice chat.")}
                  </VuiTypography>
                </VuiBox>

                <VuiBox display="flex" gap={1.5} flexWrap="wrap">
                  <VuiButton
                    color="info"
                    onClick={startVoiceChat}
                    disabled={!voiceSupported || voiceConnecting || voiceConnected}
                    sx={{ minWidth: "160px" }}
                  >
                    <IoCallOutline size="16px" style={{ marginRight: "8px" }} />
                    {voiceConnecting ? "Connecting..." : voiceConnected ? "Voice Active" : "Start Voice"}
                  </VuiButton>
                  <VuiButton
                    color={voiceMuted ? "warning" : "secondary"}
                    onClick={toggleMicrophone}
                    disabled={!voiceConnected}
                    sx={{ minWidth: "140px" }}
                  >
                    {voiceMuted ? (
                      <IoMicOff size="16px" style={{ marginRight: "8px" }} />
                    ) : (
                      <IoMic size="16px" style={{ marginRight: "8px" }} />
                    )}
                    {voiceMuted ? "Unmute" : "Mute"}
                  </VuiButton>
                  <VuiButton
                    color="error"
                    onClick={() => endVoiceChat(true)}
                    disabled={!voiceConnected && !voiceConnecting}
                    sx={{ minWidth: "140px" }}
                  >
                    <IoCall size="16px" style={{ marginRight: "8px" }} />
                    End Voice
                  </VuiButton>
                </VuiBox>
              </VuiBox>
            </Card>
            <audio ref={remoteAudioRef} autoPlay aria-label="Remote participant audio" />
          </VuiBox>
        )}

        {/* Progress Section */}
        <VuiBox mb={3}>
          {battle?.mode === 'team' ? (
            <>
              <Card
                sx={{
                  mb: 2,
                  background: 'linear-gradient(127.09deg, rgba(255, 69, 0, 0.16) 19.41%, rgba(0, 117, 255, 0.16) 76.65%)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '15px',
                }}
              >
                <VuiBox
                  p={2}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  gap={2}
                  flexDirection={{ xs: 'column', md: 'row' }}
                >
                  <VuiBox flex={1}>
                    <VuiTypography variant="button" color="warning" fontWeight="bold" display="block" mb={0.5}>
                      Team B
                    </VuiTypography>
                    <VuiTypography variant="caption" color="text" display="block">
                      {teamPlayers('B').map((player) => player.username).join(', ') || 'No players'}
                    </VuiTypography>
                  </VuiBox>
                  <VuiTypography variant="h6" color="white" fontWeight="bold">
                    Team B vs Team A
                  </VuiTypography>
                  <VuiBox flex={1} textAlign={{ xs: 'left', md: 'right' }}>
                    <VuiTypography variant="button" color="info" fontWeight="bold" display="block" mb={0.5}>
                      Team A
                    </VuiTypography>
                    <VuiTypography variant="caption" color="text" display="block">
                      {teamPlayers('A').map((player) => player.username).join(', ') || 'No players'}
                    </VuiTypography>
                  </VuiBox>
                </VuiBox>
              </Card>
              <Grid container spacing={3}>
              {(['B', 'A']).map((teamSide) => {
                const players = teamPlayers(teamSide);
                const progress = teamProgress(teamSide);

                return (
                  <Grid item xs={12} md={6} key={teamSide}>
                    <Card
                      sx={{
                        background: teamSide === 'A'
                          ? 'linear-gradient(127.09deg, rgba(0, 117, 255, 0.22) 19.41%, rgba(0, 198, 255, 0.12) 76.65%)'
                          : 'linear-gradient(127.09deg, rgba(255, 69, 0, 0.22) 19.41%, rgba(255, 140, 0, 0.12) 76.65%)',
                        border: teamSide === 'A' ? '2px solid #0075FF' : '2px solid #FF4500',
                        borderRadius: '15px',
                      }}
                    >
                      <VuiBox p={2}>
                        <VuiTypography variant="h6" color="white" fontWeight="bold" mb={1}>
                          Team {teamSide}
                        </VuiTypography>
                        <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <VuiTypography variant="body2" color="text">
                            {players.length} players
                          </VuiTypography>
                          <VuiTypography variant="body2" color={teamSide === 'A' ? 'info' : 'warning'}>
                            {progress.toFixed(0)}%
                          </VuiTypography>
                        </VuiBox>
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: teamSide === 'A' ? '#0075FF' : '#FF4500',
                            },
                          }}
                        />
                        <VuiBox mt={2} display="flex" flexDirection="column" gap={1}>
                          {players.map((player) => (
                            <VuiBox key={player.userId} display="flex" justifyContent="space-between" alignItems="center">
                              <VuiTypography variant="caption" color="text">
                                {player.username}
                              </VuiTypography>
                              <VuiTypography variant="caption" color="white" fontWeight="bold">
                                {Number(player.progress || 0)}/{Number(battle?.challenge?.testCases?.length || 0)}
                              </VuiTypography>
                            </VuiBox>
                          ))}
                        </VuiBox>
                      </VuiBox>
                    </Card>
                  </Grid>
                );
              })}
              </Grid>
            </>
          ) : (
            <Grid container spacing={3}>
              {/* Your Progress */}
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    background: "linear-gradient(127.09deg, rgba(0, 117, 255, 0.2) 19.41%, rgba(0, 198, 255, 0.1) 76.65%)",
                    border: "2px solid #0075FF",
                    borderRadius: "15px",
                  }}
                >
                  <VuiBox p={2}>
                    <VuiTypography variant="h6" color="white" fontWeight="bold" mb={1}>
                      Your Progress
                    </VuiTypography>
                    <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <VuiTypography variant="body2" color="text">
                        Test Cases: {testResults.filter(r => r.passed).length}/{battle?.challenge?.testCases?.length || 0}
                      </VuiTypography>
                      <VuiTypography variant="body2" color="info">
                        {getProgressPercentage(testResults.filter(r => r.passed).length, battle?.challenge?.testCases?.length || 0).toFixed(0)}%
                      </VuiTypography>
                    </VuiBox>
                    <LinearProgress
                      variant="determinate"
                      value={getProgressPercentage(testResults.filter(r => r.passed).length, battle?.challenge?.testCases?.length || 0)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: "#0075FF",
                        }
                      }}
                    />
                  </VuiBox>
                </Card>
              </Grid>

              {/* Opponent Progress */}
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    background: "linear-gradient(127.09deg, rgba(255, 69, 0, 0.2) 19.41%, rgba(255, 140, 0, 0.1) 76.65%)",
                    border: "2px solid #FF4500",
                    borderRadius: "15px",
                  }}
                >
                  <VuiBox p={2}>
                    <VuiTypography variant="h6" color="white" fontWeight="bold" mb={1}>
                      Opponent: {opponentProgress.username || 'Waiting...'}
                    </VuiTypography>
                    <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <VuiTypography variant="body2" color="text">
                        Test Cases: {opponentProgress.progress || 0}/{battle?.challenge?.testCases?.length || 0}
                      </VuiTypography>
                      <VuiTypography variant="body2" color="warning">
                        {getProgressPercentage(opponentProgress.progress || 0, battle?.challenge?.testCases?.length || 0).toFixed(0)}%
                      </VuiTypography>
                    </VuiBox>
                    <LinearProgress
                      variant="determinate"
                      value={getProgressPercentage(opponentProgress.progress || 0, battle?.challenge?.testCases?.length || 0)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: "#FF4500",
                        }
                      }}
                    />
                  </VuiBox>
                </Card>
              </Grid>
            </Grid>
          )}
        </VuiBox>

        {/* Main Battle Area */}
        <Grid container spacing={3}>
          {/* Challenge Panel */}
          <Grid item xs={12} lg={5}>
            <Card
              sx={{
                background: "linear-gradient(135deg, rgba(5, 10, 35, 0.98) 0%, rgba(8, 13, 32, 0.96) 50%, rgba(4, 9, 28, 0.98) 100%)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "20px",
                height: "calc(100vh - 210px)",
                overflowY: "auto",
              }}
            >
              <VuiBox p={3}>
                <VuiBox
                  sx={{
                    background: "linear-gradient(135deg, rgba(10, 14, 35, 0.95) 0%, rgba(15, 20, 40, 0.97) 100%)",
                    borderRadius: "12px",
                    padding: "8px",
                    marginBottom: "20px",
                    border: "2px solid rgba(0, 117, 255, 0.3)",
                    boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.3)",
                    overflow: "hidden",
                  }}
                >
                  <Tabs
                    value={selectedTab}
                    onChange={(e, val) => setSelectedTab(val)}
                    sx={{
                      background: "transparent",
                      backgroundColor: "transparent",
                      minHeight: "auto",
                      borderBottom: "none",
                      "& .MuiTab-root": {
                        color: "#7b8ba8",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        textTransform: "none",
                        minHeight: "48px",
                        minWidth: "120px",
                        padding: "10px 20px",
                        marginRight: "8px",
                        borderRadius: "10px",
                        transition: "all 0.3s ease",
                        opacity: 1,
                        "&:hover": {
                          color: "#b3d9ff",
                          background: "linear-gradient(135deg, rgba(0, 117, 255, 0.2) 0%, rgba(67, 24, 255, 0.15) 100%)",
                        },
                      },
                      "& .Mui-selected": {
                        color: "#66b3ff !important",
                        fontWeight: "bold",
                        background: "linear-gradient(135deg, rgba(0, 117, 255, 0.4) 0%, rgba(67, 24, 255, 0.3) 100%) !important",
                        boxShadow: "0px 3px 10px rgba(0, 117, 255, 0.3)",
                      },
                      "& .MuiTabs-indicator": {
                        display: "none",
                      },
                    }}
                  >
                    <Tab label="Description" />
                    <Tab label="Results" />
                  </Tabs>
                </VuiBox>

                {selectedTab === 0 && (
                  <VuiBox>
                    <VuiTypography variant="h5" color="white" fontWeight="bold" mb={2}>
                      Challenge
                    </VuiTypography>
                    <VuiTypography variant="body2" color="text" mb={3} sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
                      {battle?.challenge?.description}
                    </VuiTypography>

                    <VuiTypography variant="h6" color="white" fontWeight="bold" mb={1.5}>
                      Examples
                    </VuiTypography>
                    {(battle?.challenge?.testCases || []).map((testCase, index) => (
                      <VuiBox
                        key={index}
                        sx={{
                          background: "rgba(0, 117, 255, 0.12)",
                          border: "1px solid rgba(0, 117, 255, 0.35)",
                          borderRadius: "10px",
                          p: 1.5,
                          mb: 1.2,
                        }}
                      >
                        <VuiTypography variant="caption" color="info" fontWeight="bold" mb={0.6} display="block">
                          Example {index + 1}
                        </VuiTypography>
                        <VuiTypography variant="caption" color="text" sx={{ whiteSpace: "pre-wrap" }}>
                          Input: {String(testCase.input || "")}\nOutput: {String(testCase.expectedOutput || "")}
                        </VuiTypography>
                      </VuiBox>
                    ))}
                  </VuiBox>
                )}

                {selectedTab === 1 && (
                  <VuiBox>
                    <VuiTypography variant="h6" color="white" fontWeight="bold" mb={2}>
                      Test Results
                    </VuiTypography>
                    {testResults.length === 0 && (
                      <VuiTypography variant="caption" color="text">
                        Run code to see test results.
                      </VuiTypography>
                    )}
                    {testResults.map((result, index) => (
                      <VuiBox key={index} display="flex" alignItems="center" gap={1} mb={1}>
                        {result.passed ? (
                          <IoCheckmarkCircle size="16px" color="#00FF00" />
                        ) : (
                          <IoCloseCircle size="16px" color="#FF0000" />
                        )}
                        <VuiTypography variant="caption" color="text">
                          Test {index + 1}: {result.passed ? 'Passed' : 'Failed'}
                        </VuiTypography>
                      </VuiBox>
                    ))}
                  </VuiBox>
                )}

                <VuiBox mt={3}>
                  <VuiButton
                    color="error"
                    onClick={handleForfeit}
                    sx={{ width: "100%" }}
                  >
                    <IoFlag size="16px" style={{ marginRight: "8px" }} />
                    Forfeit
                  </VuiButton>
                </VuiBox>
              </VuiBox>
            </Card>
          </Grid>

          {/* Code Editor */}
          <Grid item xs={12} lg={7}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <CodeEditor
                  key={language}
                  initialCode={code}
                  language={language}
                  onCodeChange={setCode}
                  onLanguageChange={handleLanguageChange}
                  onRunCode={handleRunCode}
                  height="calc(52vh - 90px)"
                />
              </Grid>
              <Grid item xs={12}>
                <VuiBox display="flex" justifyContent="flex-end">
                  <VuiButton
                    color="success"
                    onClick={handleSubmitCode}
                    disabled={isSubmitting || !code || (typeof code === 'string' && !code.trim())}
                    sx={{
                      background: "linear-gradient(135deg, #00FF00, #00CC00)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #00DD00, #00AA00)",
                      }
                    }}
                  >
                    <IoPlay size="16px" style={{ marginRight: "8px" }} />
                    {isSubmitting ? 'Running...' : 'Submit Code'}
                  </VuiButton>
                </VuiBox>
              </Grid>

              <Grid item xs={12}>
                <Card
                  sx={{
                    background: "linear-gradient(135deg, rgba(5, 10, 35, 0.98) 0%, rgba(8, 13, 32, 0.96) 50%, rgba(4, 9, 28, 0.98) 100%)",
                    border: "1px solid rgba(0, 117, 255, 0.3)",
                    borderRadius: "14px",
                  }}
                >
                  <VuiBox p={2.5}>
                    <VuiTypography variant="button" color="white" fontWeight="bold" mb={1} display="block">
                      Output
                    </VuiTypography>

                    <VuiTypography
                      variant="caption"
                      sx={{
                        color: submissionMessage.startsWith("Error") ? "#ff7b7b" : "rgba(220, 236, 255, 0.9)",
                        display: "block",
                        mb: 1.5,
                      }}
                    >
                      {submissionMessage}
                    </VuiTypography>

                    {testResults.length > 0 && (
                      <VuiBox display="flex" flexDirection="column" gap={1}>
                        {testResults.map((result, index) => (
                          <VuiBox
                            key={index}
                            sx={{
                              background: result.passed
                                ? "rgba(0, 255, 153, 0.09)"
                                : "rgba(255, 86, 86, 0.1)",
                              border: result.passed
                                ? "1px solid rgba(0, 255, 153, 0.3)"
                                : "1px solid rgba(255, 86, 86, 0.35)",
                              borderRadius: "10px",
                              p: 1.2,
                            }}
                          >
                            <VuiBox display="flex" alignItems="center" gap={1} mb={0.4}>
                              {result.passed ? (
                                <IoCheckmarkCircle size="15px" color="#00ff99" />
                              ) : (
                                <IoCloseCircle size="15px" color="#ff6b6b" />
                              )}
                              <VuiTypography variant="caption" color="white" fontWeight="bold">
                                Test {index + 1}
                              </VuiTypography>
                            </VuiBox>
                            <VuiTypography variant="caption" color="text" sx={{ display: "block" }}>
                              Expected: {String(result.expectedOutput ?? result.expected ?? "")}
                            </VuiTypography>
                            <VuiTypography
                              variant="caption"
                              sx={{
                                display: "block",
                                color: result.passed ? "#a8ffd6" : "#ffb3b3",
                              }}
                            >
                              Actual: {String(result.actualOutput ?? result.actual ?? result.error ?? "")}
                            </VuiTypography>
                          </VuiBox>
                        ))}
                      </VuiBox>
                    )}
                  </VuiBox>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Battle Completed Modal */}
        <Dialog
          open={battleCompleted}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: "linear-gradient(127.09deg, rgba(6, 11, 40, 0.98) 19.41%, rgba(10, 14, 35, 0.95) 76.65%)",
              border: "2px solid #FFD700",
            }
          }}
        >
          <DialogContent>
            <VuiBox textAlign="center" py={4}>
              <IoTrophy size="80px" color="#FFD700" />
              <VuiTypography variant="h3" color="white" fontWeight="bold" mt={2} mb={1}>
                Battle Complete!
              </VuiTypography>
              
              {winner && (
                <VuiBox>
                  <VuiTypography variant="h5" color="warning" fontWeight="bold" mb={1}>
                    {battle?.mode === 'team' && winnerTeam ? `Winning Team: ${winnerTeam}` : `Winner: ${winner.username}`}
                  </VuiTypography>
                  {battle?.mode === 'team' && winner && (
                    <VuiTypography variant="body2" color="text" mb={2}>
                      First solver: {winner.username}
                    </VuiTypography>
                  )}
                  
                  {(() => {
                    const currentUserId = String(battleService.getCurrentUserId() || '');
                    const currentUserReward = participantRewards.find(
                      (reward) => String(reward.userId) === currentUserId,
                    );
                    const wonBattle = currentUserReward?.isWinner || String(winner.userId) === currentUserId;

                    return wonBattle ? (
                    <VuiBox>
                      <VuiTypography variant="h6" color="success" mb={1}>
                        🎉 Congratulations! You won! 🎉
                      </VuiTypography>
                      <VuiTypography variant="button" color="warning" mb={3} display="block">
                        {currentUserReward
                          ? `Your reward: +${currentUserReward.totalXp} XP`
                          : `Winner reward: +${winnerRewardXp} XP`}
                      </VuiTypography>
                    </VuiBox>
                    ) : (
                    <VuiTypography variant="h6" color="text" mb={3}>
                      Better luck next time!
                    </VuiTypography>
                    );
                  })()}

                  {participantRewards.length > 0 && (
                    <VuiBox mt={3} textAlign="left">
                      <VuiTypography variant="button" color="white" fontWeight="bold" mb={1} display="block">
                        XP breakdown
                      </VuiTypography>
                      {participantRewards.map((reward) => (
                        <VuiBox
                          key={reward.userId}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            py: 1,
                            px: 1.5,
                            borderRadius: '10px',
                            mb: 1,
                            background: reward.isWinner ? 'rgba(16, 185, 129, 0.12)' : 'rgba(148, 163, 184, 0.1)',
                          }}
                        >
                          <VuiTypography variant="caption" color="text">
                            {reward.username}{reward.isFirstSolver ? ' (first solver)' : ''}
                          </VuiTypography>
                          <VuiTypography variant="caption" color="white" fontWeight="bold">
                            +{reward.totalXp} XP
                          </VuiTypography>
                        </VuiBox>
                      ))}
                    </VuiBox>
                  )}
                </VuiBox>
              )}

              <VuiBox display="flex" gap={2} justifyContent="center" mt={4}>
                <VuiButton
                  color="info"
                  onClick={() => navigate('/battles')}
                >
                  Back to Battles
                </VuiButton>
                <VuiButton
                  color="success"
                  onClick={() => navigate('/battles')}
                >
                  Play Again
                </VuiButton>
              </VuiBox>
            </VuiBox>
          </DialogContent>
        </Dialog>

        {/* Forfeit Confirmation Dialog */}
        <Dialog
          open={showForfeitDialog}
          onClose={() => setShowForfeitDialog(false)}
          PaperProps={{
            sx: {
              background: "linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.49) 76.65%)",
              backdropFilter: "blur(42px)",
              border: "2px solid rgba(255, 255, 255, 0.125)",
              borderRadius: "20px",
              padding: "24px",
              minWidth: "400px",
            }
          }}
        >
          <DialogContent>
            <VuiBox textAlign="center">
              <IoFlag size="64px" color="#FF6B6B" style={{ marginBottom: "16px" }} />
              <VuiTypography variant="h4" color="white" fontWeight="bold" mb={2}>
                Forfeit Battle?
              </VuiTypography>
              <VuiTypography variant="body2" color="text" mb={3}>
                Are you sure you want to forfeit this battle? This action cannot be undone and you will lose the match.
              </VuiTypography>
              <VuiBox display="flex" gap={2} justifyContent="center">
                <VuiButton
                  color="secondary"
                  onClick={() => setShowForfeitDialog(false)}
                  sx={{ minWidth: "120px" }}
                >
                  Cancel
                </VuiButton>
                <VuiButton
                  color="error"
                  onClick={confirmForfeit}
                  sx={{ minWidth: "120px" }}
                >
                  Forfeit
                </VuiButton>
              </VuiBox>
            </VuiBox>
          </DialogContent>
        </Dialog>
      </VuiBox>
      <Footer />
    </DashboardLayout>
  );
}

export default BattleRoom;
