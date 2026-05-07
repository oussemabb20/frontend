import React, { useState, useEffect, useMemo } from "react";
import {
  Grid,
  Card,
  Tabs,
  Tab,
  CircularProgress,
  Modal,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiButton from "components/VuiButton";
import VuiProgress from "components/VuiProgress";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import CodeEditor from "components/CodeEditor";
import { useVisionUIController } from "context";
import { 
  IoCheckmarkCircle, 
  IoCloseCircle, 
  IoPlaySharp, 
  IoSend,
  IoSparkles,
  IoTrophy,
  IoPeople,
  IoArrowBack,
  IoTerminal
} from "react-icons/io5";
import challengeService from "../../services/challenge.service";
import { runCode, submitCode } from "../../services/codeExecution.service";
import progressTrackerService from "../../services/progressTracker.service";
import apiClient from "../../services/api";
import { authService } from "../../services/auth.service";
import axios from 'axios';

const STARTER_TEMPLATES = {
  javascript: 'const lines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\\n");\n// your code here\nconsole.log();',
  typescript: 'const lines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\\n");\n// your code here\nconsole.log();',
  python: '# Write your solution here\nimport sys\n\ndef main():\n    data = sys.stdin.read().split()\n    # your code here\n    pass\n\nif __name__ == "__main__":\n    main()',
  java: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // your code here\n    }\n}',
  cpp: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // your code here\n    return 0;\n}',
  csharp: 'using System;\n\nclass Solution {\n    static void Main(string[] args) {\n        // your code here\n    }\n}',
  go: 'package main\n\nimport (\n    "bufio"\n    "fmt"\n    "os"\n)\n\nfunc main() {\n    reader := bufio.NewReader(os.Stdin)\n    _ = reader\n    // your code here\n    fmt.Println()\n}',
  rust: 'use std::io::{self, BufRead};\n\nfn main() {\n    let stdin = io::stdin();\n    let mut lines = stdin.lock().lines();\n    // your code here\n}',
};

function ChallengeDetail() {
  const [controller] = useVisionUIController();
  const { darkMode } = controller;
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(0);
  const [code, setCode] = useState('const lines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\\n");\n// your code here\nconsole.log();');
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [outputTab, setOutputTab] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState('javascript');

  const [isTranslating, setIsTranslating] = useState(false);
const [isTranslated, setIsTranslated] = useState(false);
const [translatedDescription, setTranslatedDescription] = useState('');
  

  // Challenge API states
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [isSolved, setIsSolved] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [playerProgress, setPlayerProgress] = useState(progressTrackerService.getLevelProgress());
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketUseCases, setTicketUseCases] = useState(["wrong_use_case"]);

  const availableTicketUseCases = useMemo(() => {
    const options = [{ value: "wrong_use_case", label: "Wrong use case" }];
    const testCases = challenge?.testCases || [];

    testCases.forEach((testCase, index) => {
      const exampleName = `Example ${index + 1}`;
      const details =
        typeof testCase?.description === "string" && testCase.description.trim().length > 0
          ? testCase.description.trim()
          : `Input: ${String(testCase?.input ?? "").slice(0, 36)} | Output: ${String(testCase?.expectedOutput ?? "").slice(0, 20)}`;

      options.push({
        value: `example_${index + 1}`,
        label: `${exampleName} - ${details}`,
      });
    });

    return options;
  }, [challenge]);

  const toggleTicketUseCase = (value) => {
    setTicketUseCases((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const handleLanguageChange = (lang) => {
    setCurrentLanguage(lang);
    setCode(STARTER_TEMPLATES[lang] || STARTER_TEMPLATES.javascript);
    setTestResults([]);
    setConsoleOutput([]);
  };

  const handleTranslateDescription = async () => {
  if (isTranslated) {
    setIsTranslated(false);
    return;
  }

  if (translatedDescription) {
    setIsTranslated(true);
    return;
  }

  setIsTranslating(true);
  try {
    const response = await axios.get('https://api.mymemory.translated.net/get', {
      params: {
        q: challenge.description,
        langpair: 'en|fr',
      },
      timeout: 8000,
    });

    const result = response.data?.responseData?.translatedText;
    if (!result || result === challenge.description) {
      throw new Error('Traduction invalide');
    }

    setTranslatedDescription(result);
    setIsTranslated(true);
  } catch (err) {
    console.error('Translation error:', err);
    setConsoleOutput((prev) => [
      ...prev,
      { type: 'error', text: 'Échec de la traduction. Réessayez plus tard.', timestamp: new Date().toLocaleTimeString() },
    ]);
  } finally {
    setIsTranslating(false);
  }
};

  const getLogType = (text) => {
    if (text.startsWith('✓')) return 'success';
    if (text.startsWith('✗') || text.toLowerCase().startsWith('error')) return 'error';
    return 'info';
  };

  const getConfettiColor = (position) => {
    const palette = ['#00ff99', '#00c7ff', '#ffcf5a', '#ff6b6b'];
    return palette[position % palette.length];
  };

  // Fetch challenge from API
  useEffect(() => {
    const fetchChallenge = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await challengeService.getChallengeById(challengeId);
        setChallenge(data);
        
        // Set starter code if available
        const jsStarter = data.starterCode?.find(s => s.language === 'javascript');
        if (jsStarter) {
          setCode(jsStarter.code);
        }
      } catch (err) {
        console.error('Error fetching challenge:', err);
        setError('Failed to load challenge. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (challengeId) {
      fetchChallenge();
    }
  }, [challengeId]);

  useEffect(() => {
    if (!challengeId) return;

    setSubmissionHistory(progressTrackerService.getChallengeSubmissions(challengeId));
    setIsSolved(progressTrackerService.isChallengeSolved(challengeId));
    setPlayerProgress(progressTrackerService.getLevelProgress());

    const refreshProgress = () => {
      setPlayerProgress(progressTrackerService.getLevelProgress());
    };

    const progressEvent = progressTrackerService.getProgressEventName();
    globalThis.addEventListener(progressEvent, refreshProgress);

    return () => {
      globalThis.removeEventListener(progressEvent, refreshProgress);
    };
  }, [challengeId]);

  // Get difficulty display value
  const getDifficultyDisplay = (diff) => {
    if (!diff) return 'Easy';
    return diff.charAt(0).toUpperCase() + diff.slice(1);
  };

  // Get acceptance rate
  const getAcceptanceRate = () => {
    if (!challenge || challenge.totalSubmissions === 0) return 0;
    return Math.round((challenge.successfulSubmissions / challenge.totalSubmissions) * 100 * 10) / 10;
  };

  const handleRunCode = async (codeToRun, language) => {
    setIsRunning(true);
    setCurrentLanguage(language);
    setConsoleOutput([
      { type: "info", text: `Running code in ${language}...`, timestamp: new Date().toLocaleTimeString() },
      { type: "info", text: "Executing test cases...", timestamp: new Date().toLocaleTimeString() }
    ]);

    try {
      const visibleTests = challenge?.testCases?.filter(tc => !tc.isHidden) || [];

      const executionResult = await runCode(codeToRun, language, visibleTests);

      const results = (executionResult.testResults || []).map((r) => ({
        input: r.input,
        expected: r.expectedOutput,
        actual: r.error ? `Error: ${r.error}` : r.actualOutput,
        passed: r.passed,
        time: `${r.executionTime}ms`,
      }));

      setTestResults(results);

      const logs = (executionResult.consoleOutput || []).map((text) => ({
        type: getLogType(text),
        text,
        timestamp: new Date().toLocaleTimeString(),
      }));

      setConsoleOutput(logs);
      setOutputTab(0);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err.message || 'Unknown error occurred';
      setConsoleOutput([
        { type: "error", text: `Error: ${errorMsg}`, timestamp: new Date().toLocaleTimeString() }
      ]);
      setTestResults([]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleOpenTicket = async () => {
    if (ticketUseCases.length === 0) {
      setConsoleOutput([
        { type: "error", text: "Please select at least one use case.", timestamp: new Date().toLocaleTimeString() }
      ]);
      return;
    }

    setTicketSubmitting(true);
    try {
      const selectedLabels = ticketUseCases.map(
        (value) => availableTicketUseCases.find((option) => option.value === value)?.label || value,
      );

      await challengeService.openTicket(challengeId, {
        subject: "Wrong use case report",
        useCase: ticketUseCases[0],
        useCases: ticketUseCases,
        description: `Selected problematic use cases: ${selectedLabels.join(", ")}`,
      });

      setTicketModalOpen(false);
      setTicketUseCases(["wrong_use_case"]);
      setConsoleOutput((prev) => [
        ...prev,
        { type: "success", text: "Ticket opened successfully. Admins will review it.", timestamp: new Date().toLocaleTimeString() },
      ]);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err.message || "Failed to open ticket";
      setConsoleOutput([
        { type: "error", text: `Error: ${errorMsg}`, timestamp: new Date().toLocaleTimeString() }
      ]);
    } finally {
      setTicketSubmitting(false);
    }
  };

  const syncAwardedXpToBackend = async (xpAwarded) => {
    if (!xpAwarded || xpAwarded <= 0) return;

    const currentUser = authService.getCurrentUser();
    const userId = currentUser?.id || currentUser?._id;
    if (!userId) return;

    const localStreak = progressTrackerService.getCurrentSolveStreak();
    const currentStreak = Number(currentUser?.statistics?.currentStreak || 0);
    const streakDelta = Math.max(0, localStreak - currentStreak);

    await apiClient.patch(`/users/${userId}/stats`, {
      xp: xpAwarded,
      totalPoints: xpAwarded,
      challengesCompleted: 1,
      challengesAttempted: 1,
      ...(streakDelta > 0 ? { currentStreak: streakDelta } : {}),
    });

    // Keep locally cached user stats in sync with backend increments.
    const completed = Number(currentUser?.statistics?.challengesCompleted || 0) + 1;
    const attempted = Number(currentUser?.statistics?.challengesAttempted || 0) + 1;
    const successRate = attempted > 0 ? Math.round((completed / attempted) * 100) : 0;

    const updatedUser = {
      ...currentUser,
      statistics: {
        ...(currentUser?.statistics || {}),
        xp: Number(currentUser?.statistics?.xp || 0) + xpAwarded,
        totalPoints: Number(currentUser?.statistics?.totalPoints || 0) + xpAwarded,
        challengesCompleted: completed,
        challengesAttempted: attempted,
        successRate: successRate,
        currentStreak: Math.max(currentStreak, localStreak),
      },
    };
    globalThis.localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const trackFailedAttempt = async () => {
    const currentUser = authService.getCurrentUser();
    const userId = currentUser?.id || currentUser?._id;
    if (!userId) return;

    try {
      await apiClient.patch(`/users/${userId}/stats`, {
        challengesAttempted: 1,
      });

      // Update local cache
      const attempted = Number(currentUser?.statistics?.challengesAttempted || 0) + 1;
      const completed = Number(currentUser?.statistics?.challengesCompleted || 0);
      const successRate = attempted > 0 ? Math.round((completed / attempted) * 100) : 0;

      const updatedUser = {
        ...currentUser,
        statistics: {
          ...(currentUser?.statistics || {}),
          challengesAttempted: attempted,
          successRate: successRate,
        },
      };
      globalThis.localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      console.warn('Could not track failed attempt:', err);
    }
  };

  const handleSubmit = async () => {
    setIsRunning(true);
    setConsoleOutput([
      { type: "info", text: "Submitting solution...", timestamp: new Date().toLocaleTimeString() },
    ]);

    try {
      const executionResult = await submitCode(code, currentLanguage, challengeId);

      const results = (executionResult.testResults || []).map((r) => ({
        input: r.input,
        expected: r.expectedOutput,
        actual: r.error ? `Error: ${r.error}` : r.actualOutput,
        passed: r.passed,
        time: `${r.executionTime}ms`,
      }));

      setTestResults(results);

      const logs = (executionResult.consoleOutput || []).map((text) => ({
        type: getLogType(text),
        text,
        timestamp: new Date().toLocaleTimeString(),
      }));

      setConsoleOutput(logs);
      setOutputTab(0);

      const totalTests = Number(executionResult.totalTests || 0);
      const passedTests = Number(executionResult.passedTests || 0);
      const allPassed = totalTests > 0 && passedTests === totalTests;

      const submissionRecord = {
        id: `${challengeId}-${Date.now()}`,
        challengeId,
        challengeTitle: challenge?.title || 'Challenge',
        language: currentLanguage,
        passedTests,
        totalTests,
        success: allPassed,
        submittedAt: new Date().toISOString(),
      };

      progressTrackerService.saveSubmission(submissionRecord);
      const latestSubmissions = progressTrackerService.getChallengeSubmissions(challengeId);
      setSubmissionHistory(latestSubmissions);

      if (allPassed) {
        const xpResult = progressTrackerService.awardXpForChallengeSolve(challengeId, challenge?.difficulty);
        progressTrackerService.markChallengeSolved(challengeId);

        if (xpResult.awarded) {
          try {
            await syncAwardedXpToBackend(xpResult.xpAwarded);
          } catch (statsErr) {
            console.warn('Could not sync XP stats to backend:', statsErr);
          }
        }

        setIsSolved(true);
        setPlayerProgress(xpResult.progress);
        setShowCelebration(true);

        setConsoleOutput((prev) => [
          ...prev,
          {
            type: 'success',
            text: xpResult.awarded
              ? `Perfect run! Challenge solved. +${xpResult.xpAwarded} XP earned.`
              : 'Perfect run! Challenge solved.',
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);

        globalThis.setTimeout(() => {
          setShowCelebration(false);
        }, 2800);
      } else {
        // Track failed attempt
        try {
          await trackFailedAttempt();
        } catch (statsErr) {
          console.warn('Could not track failed attempt:', statsErr);
        }
      }

      setChallenge((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          totalSubmissions: (prev.totalSubmissions || 0) + 1,
          successfulSubmissions: (prev.successfulSubmissions || 0) + (allPassed ? 1 : 0),
        };
      });

      try {
        await challengeService.recordSubmission(challengeId, allPassed);
      } catch (recordErr) {
        console.warn('Could not persist submission stats to backend:', recordErr);
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err.message || 'Unknown error occurred';
      setConsoleOutput([
        { type: "error", text: `Error: ${errorMsg}`, timestamp: new Date().toLocaleTimeString() }
      ]);
      setTestResults([]);
    } finally {
      setIsRunning(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <VuiBox py={3} display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress aria-label="Loading challenge details" sx={{ color: '#0075FF' }} />
        </VuiBox>
        <Footer />
      </DashboardLayout>
    );
  }
  if (error || !challenge) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <VuiBox py={3} textAlign="center">
          <VuiTypography variant="h5" color="error" mb={2}>
            {error || 'Challenge not found'}
          </VuiTypography>
          <VuiButton color="info" onClick={() => navigate('/challenges')}>
            Back to Challenges
          </VuiButton>
        </VuiBox>
        <Footer />
      </DashboardLayout>
    );
  }

  const difficultyDisplay = getDifficultyDisplay(challenge.difficulty);
  const acceptanceRate = getAcceptanceRate();
  const challengeXpReward = progressTrackerService.getChallengeXpByDifficulty(challenge?.difficulty);
  const headingColor = darkMode ? "white" : "dark";
  const bodyColor = darkMode ? "rgba(255, 255, 255, 0.85)" : "#334155";
  const mainPanelBg = darkMode
    ? "linear-gradient(135deg, rgba(5, 10, 35, 0.98) 0%, rgba(8, 13, 32, 0.96) 50%, rgba(4, 9, 28, 0.98) 100%)"
    : "linear-gradient(135deg, rgba(255, 255, 255, 0.99), rgba(241, 245, 249, 0.96))";
  const mainPanelBorder = darkMode ? "2px solid rgba(0, 117, 255, 0.28)" : "1px solid rgba(148, 163, 184, 0.35)";
  const mainPanelShadow = darkMode
    ? "0px 10px 40px rgba(0, 0, 0, 0.7), 0px 0px 80px rgba(0, 102, 219, 0.15)"
    : "0px 10px 32px rgba(15, 23, 42, 0.1)";
  const tabsShellBg = darkMode
    ? "linear-gradient(135deg, rgba(10, 14, 35, 0.95) 0%, rgba(15, 20, 40, 0.97) 100%)"
    : "linear-gradient(135deg, rgba(248, 250, 252, 0.98), rgba(241, 245, 249, 0.95))";
  const confettiPieces = Array.from({ length: 30 }, (_, pieceIndex) => ({
    id: `piece-${pieceIndex}-${(pieceIndex * 37) % 101}`,
    left: `${(pieceIndex * 3.3) % 100}%`,
    width: pieceIndex % 2 === 0 ? '10px' : '8px',
    height: pieceIndex % 3 === 0 ? '16px' : '12px',
    duration: 2 + (pieceIndex % 5) * 0.35,
    rotationStart: pieceIndex * 14,
    rotationEnd: pieceIndex * 120 + 180,
    color: getConfettiColor(pieceIndex),
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <VuiBox py={3}>
        {showCelebration && (
          <VuiBox
            sx={{
              position: 'fixed',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 1400,
              overflow: 'hidden',
            }}
          >
            {confettiPieces.map((piece) => (
              <VuiBox
                key={piece.id}
                sx={{
                  position: 'absolute',
                  top: '-10%',
                  left: piece.left,
                  width: piece.width,
                  height: piece.height,
                  borderRadius: '2px',
                  background: piece.color,
                  opacity: 0.95,
                  animation: `fall-${piece.id} ${piece.duration}s linear forwards`,
                  transform: `rotate(${piece.rotationStart}deg)`,
                  [`@keyframes fall-${piece.id}`]: {
                    '0%': { transform: `translateY(0) rotate(${piece.rotationStart}deg)`, opacity: 1 },
                    '100%': { transform: `translateY(110vh) rotate(${piece.rotationEnd}deg)`, opacity: 0.05 },
                  },
                }}
              />
            ))}

            <VuiBox
              sx={{
                position: 'absolute',
                top: '10%',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, rgba(0, 255, 153, 0.22), rgba(0, 170, 255, 0.2))',
                border: '1px solid rgba(0, 255, 153, 0.4)',
                borderRadius: '14px',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                boxShadow: '0 8px 28px rgba(0, 255, 153, 0.24)',
                animation: 'popIn 300ms ease-out',
                '@keyframes popIn': {
                  '0%': { opacity: 0, transform: 'translateX(-50%) translateY(-8px) scale(0.96)' },
                  '100%': { opacity: 1, transform: 'translateX(-50%) translateY(0) scale(1)' },
                },
              }}
            >
              <IoSparkles size="18px" color="#00ff99" />
              <VuiTypography variant="button" sx={{ color: '#e9fff6', fontWeight: 700 }}>
                Challenge Solved!
              </VuiTypography>
            </VuiBox>
          </VuiBox>
        )}

        {/* Header */}
        <VuiBox mb={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <VuiBox>
            <VuiBox display="flex" alignItems="center" gap={2} mb={1}>
              <VuiButton
                color="info"
                variant="outlined"
                onClick={() => navigate("/challenges")}
                aria-label="Back to challenges"
                sx={{ 
                  minWidth: "auto", 
                  padding: "10px 14px",
                  borderWidth: "2px",
                  borderColor: "rgba(0, 117, 255, 0.5)",
                  "&:hover": {
                    borderWidth: "2px",
                    borderColor: "#0075FF",
                    background: "rgba(0, 117, 255, 0.15)",
                    transform: "translateX(-3px)",
                  },
                  transition: "all 0.2s",
                }}
              >
                <IoArrowBack size="20px" />
              </VuiButton>
              <VuiTypography variant="h1" color={headingColor} fontWeight="bold" sx={{ fontSize: "1.875rem" }}>
                {challenge.title}
              </VuiTypography>
              <VuiBox
                sx={{
                  background: challengeService.getDifficultyGradient(challenge.difficulty),
                  padding: "8px 18px",
                  borderRadius: "12px",
                  boxShadow: difficultyDisplay === "Easy"
                    ? "0px 4px 15px rgba(0, 221, 0, 0.5)"
                    : difficultyDisplay === "Medium"
                    ? "0px 4px 15px rgba(255, 170, 0, 0.5)"
                    : "0px 4px 15px rgba(255, 51, 51, 0.5)",
                  border: "2px solid",
                  borderColor: difficultyDisplay === "Easy"
                    ? "rgba(0, 255, 0, 0.4)"
                    : difficultyDisplay === "Medium"
                    ? "rgba(255, 170, 0, 0.4)"
                    : "rgba(255, 51, 51, 0.4)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                }}
              >
                <VuiTypography variant="caption" color="white" fontWeight="bold" sx={{ fontSize: "0.9rem" }}>
                  {difficultyDisplay}
                </VuiTypography>
              </VuiBox>
              {isSolved && (
                <VuiBox
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, rgba(0, 255, 153, 0.25), rgba(0, 190, 120, 0.2))',
                    border: '2px solid rgba(0, 255, 153, 0.45)',
                    borderRadius: '12px',
                    padding: '8px 14px',
                    boxShadow: '0 4px 16px rgba(0, 255, 153, 0.25)',
                  }}
                >
                  <IoCheckmarkCircle size="18px" color="#00ff99" />
                  <VuiTypography variant="caption" sx={{ color: '#00ff99', fontWeight: 700, fontSize: '0.85rem' }}>
                    Solved
                  </VuiTypography>
                </VuiBox>
              )}
            </VuiBox>
            <VuiBox display="flex" gap={2} alignItems="center">
              <VuiBox display="flex" alignItems="center" gap={1}>
                <IoTrophy size="20px" color="#FFD700" />
                <VuiTypography variant="button" color={headingColor} fontWeight="medium">
                  {challengeXpReward} XP reward
                </VuiTypography>
              </VuiBox>
              <VuiBox display="flex" alignItems="center" gap={1}>
                <IoPeople size="20px" color="#0075FF" />
                <VuiTypography variant="button" sx={{ color: bodyColor }}>
                  {challenge.totalSubmissions} submissions
                </VuiTypography>
              </VuiBox>
              <VuiTypography 
                variant="button" 
                sx={{ 
                  color: "#00ff88",
                  fontWeight: "600",
                }}
              >
                {acceptanceRate}% acceptance
              </VuiTypography>
              <VuiButton
                color="warning"
                variant="outlined"
                onClick={() => setTicketModalOpen(true)}
                sx={{ ml: 1 }}
              >
                Report Challenge Issue
              </VuiButton>
            </VuiBox>

            <VuiBox
              mt={2}
              sx={{
                background: darkMode
                  ? 'linear-gradient(135deg, rgba(0, 117, 255, 0.12), rgba(67, 24, 255, 0.08))'
                  : 'linear-gradient(135deg, rgba(14, 165, 233, 0.12), rgba(37, 99, 235, 0.08))',
                border: darkMode ? '1px solid rgba(0, 117, 255, 0.35)' : '1px solid rgba(14, 165, 233, 0.35)',
                borderRadius: '12px',
                padding: '10px 12px',
                maxWidth: 420,
              }}
            >
              <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb={0.8}>
                <VuiTypography variant="caption" sx={{ color: darkMode ? 'rgba(255,255,255,0.9)' : '#0f172a', fontWeight: 700 }}>
                  Level {playerProgress.level}
                </VuiTypography>
                <VuiTypography variant="caption" sx={{ color: darkMode ? 'rgba(255,255,255,0.7)' : '#475569' }}>
                  {playerProgress.xpIntoLevel}/{playerProgress.xpForNextLevel} XP
                </VuiTypography>
              </VuiBox>
              <VuiProgress 
                value={playerProgress.progressPercent} 
                color="info" 
                sx={{ height: '8px' }}
                aria-label={`Level progress: ${playerProgress.xpIntoLevel} out of ${playerProgress.xpForNextLevel} XP`}
              />
            </VuiBox>
          </VuiBox>
        </VuiBox>

        <Grid container spacing={3}>
          {/* Left Panel - Problem Description */}
          <Grid item xs={12} lg={5}>
            <Card
              sx={{
                background: mainPanelBg,
                backdropFilter: "blur(60px)",
                border: mainPanelBorder,
                borderRadius: "20px",
                height: "calc(100vh - 200px)",
                overflowY: "auto",
                boxShadow: mainPanelShadow,
                position: "relative",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: darkMode
                    ? "0px 12px 48px rgba(0, 0, 0, 0.8), 0px 0px 100px rgba(0, 102, 219, 0.2)"
                    : "0px 14px 36px rgba(15, 23, 42, 0.14)",
                },
                /* Custom Scrollbar */
                "&::-webkit-scrollbar": {
                  width: "10px",
                },
                "&::-webkit-scrollbar-track": {
                  background: darkMode ? "rgba(0, 0, 0, 0.3)" : "rgba(203, 213, 225, 0.45)",
                  borderRadius: "10px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "linear-gradient(135deg, rgba(0, 117, 255, 0.6), rgba(67, 24, 255, 0.6))",
                  borderRadius: "10px",
                  "&:hover": {
                    background: "linear-gradient(135deg, rgba(0, 117, 255, 0.8), rgba(67, 24, 255, 0.8))",
                  }
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background: "linear-gradient(90deg, transparent 0%, #0066db 50%, transparent 100%)",
                  opacity: 0.6,
                },
              }}
            >
              <VuiBox p={3}>
                <VuiBox
                  sx={{
                    background: tabsShellBg,
                    borderRadius: "12px",
                    padding: "8px",
                    marginBottom: "20px",
                    border: darkMode ? "2px solid rgba(0, 117, 255, 0.3)" : "1px solid rgba(148, 163, 184, 0.35)",
                    boxShadow: darkMode ? "0px 3px 10px rgba(0, 0, 0, 0.3)" : "none",
                  }}
                >
                  <Tabs
                    value={selectedTab}
                    onChange={(e, val) => setSelectedTab(val)}
                    sx={{
                      background: "transparent",
                      backgroundColor: "transparent",
                      borderBottom: "none",
                      "& .MuiTab-root": { 
                        color: darkMode ? "#7b8ba8" : "#475569",
                        fontWeight: "700",
                        fontSize: "0.95rem",
                        textTransform: "none",
                        minHeight: "48px",
                        minWidth: "120px",
                        padding: "10px 20px",
                        marginRight: "8px",
                        borderRadius: "10px",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          color: darkMode ? "#b3d9ff" : "#0f172a",
                          background: darkMode
                            ? "linear-gradient(135deg, rgba(0, 117, 255, 0.2) 0%, rgba(67, 24, 255, 0.15) 100%)"
                            : "rgba(14, 165, 233, 0.12)",
                        }
                      },
                      "& .Mui-selected": { 
                        color: darkMode ? "#66b3ff !important" : "#075985 !important",
                        fontWeight: "bold",
                        background: darkMode
                          ? "linear-gradient(135deg, rgba(0, 117, 255, 0.4) 0%, rgba(67, 24, 255, 0.3) 100%) !important"
                          : "linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(37, 99, 235, 0.16) 100%) !important",
                        boxShadow: darkMode ? "0px 3px 10px rgba(0, 117, 255, 0.3)" : "none",
                      },
                      "& .MuiTabs-indicator": { 
                        display: "none",
                      },
                    }}
                  >
                  <Tab label="Description" />
                  <Tab label="Hints" />
                  <Tab label="Submissions" />
                </Tabs>                </VuiBox>
                {selectedTab === 0 && (
                  <VuiBox>
                      {/* ✅ BOUTON TRADUCTION ICI */}
    <VuiBox display="flex" alignItems="center" gap={1.5} mb={2.5}>
      <VuiButton
        color={isTranslated ? "success" : "info"}
        variant="outlined"
        onClick={handleTranslateDescription}
        disabled={isTranslating}
        sx={{
          fontSize: "0.82rem",
          fontWeight: 700,
          padding: "7px 16px",
          borderWidth: "2px",
          borderColor: isTranslated ? "rgba(0,200,120,0.5)" : "rgba(0,117,255,0.5)",
          color: isTranslated ? "#00dd99" : "#66b3ff",
          background: isTranslated ? "rgba(0,200,120,0.1)" : "rgba(0,117,255,0.1)",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          "&:hover": {
            borderWidth: "2px",
            background: isTranslated ? "rgba(0,200,120,0.2)" : "rgba(0,117,255,0.2)",
          },
          "&:disabled": { opacity: 0.5 },
          transition: "all 0.25s",
        }}
      >
        {isTranslating ? "⏳ Traduction..." : isTranslated ? "🇫🇷 return To English" : "🌐 Traduire en français"}
      </VuiButton>
      {isTranslated && (
        <VuiBox
          sx={{
            fontSize: "11px",
            padding: "3px 10px",
            borderRadius: "20px",
            background: "rgba(0,200,120,0.15)",
            border: "1px solid rgba(0,200,120,0.4)",
            color: "#00cc88",
            fontWeight: 600,
          }}
        >
          FR
        </VuiBox>
      )}
    </VuiBox>
                       {/* Description (originale ou traduite) */}
    <VuiTypography
      variant="body1"
      color={headingColor}
      mb={3}
      sx={{
        lineHeight: 1.9,
        fontSize: "0.95rem",
        color: darkMode ? "rgba(255, 255, 255, 0.95)" : "#1e293b",
        fontWeight: "400",
        transition: "opacity 0.3s",
      }}
    >
      {(isTranslated ? translatedDescription : challenge.description)
        .split('\n')
        .map((line, i) => (
          <span key={i}>{line}<br /></span>
        ))}
    </VuiTypography>

                    {/* Examples / Test Cases */}
                    <VuiTypography 
                      variant="h2" 
                      color={headingColor}
                      fontWeight="bold" 
                      mb={2}
                      sx={{ fontSize: "1.25rem" }}
                    >
                      Examples
                    </VuiTypography>
                    {(challenge.testCases?.filter(tc => !tc.isHidden) || []).map((testCase, index) => (
                      <VuiBox
                        key={index}
                        sx={{
                          background: "linear-gradient(135deg, rgba(0, 117, 255, 0.15) 0%, rgba(67, 24, 255, 0.12) 100%)",
                          padding: "18px",
                          borderRadius: "15px",
                          border: "2px solid rgba(0, 117, 255, 0.5)",
                          marginBottom: "18px",
                          boxShadow: "0px 5px 20px rgba(0, 117, 255, 0.15), inset 0px 1px 0px rgba(255, 255, 255, 0.1)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0px 8px 25px rgba(0, 117, 255, 0.25)",
                            borderColor: "rgba(0, 117, 255, 0.7)",
                          },
                        }}
                      >
                        <VuiTypography 
                          variant="button" 
                          fontWeight="bold" 
                          mb={1}
                          sx={{ color: "#4da6ff", fontSize: "0.9rem" }}
                        >
                          Example {index + 1}:
                        </VuiTypography>
                        <VuiBox 
                          component="pre" 
                          sx={{ 
                            margin: 0, 
                            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                            background: "rgba(0, 0, 0, 0.3)",
                            padding: "12px",
                            borderRadius: "8px",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          <VuiTypography 
                            variant="caption" 
                            sx={{ 
                              color: "rgba(255, 255, 255, 0.95)",
                              fontSize: "0.85rem",
                              lineHeight: 1.8,
                            }}
                          >
                            Input: {testCase.input}{'\n'}
                            Output: {testCase.expectedOutput}
                            {testCase.description && `\n${testCase.description}`}
                          </VuiTypography>
                        </VuiBox>
                      </VuiBox>
                    ))}

                    {/* Constraints */}
                    {challenge.constraints && (
                      <>
                        <VuiTypography 
                          variant="h6" 
                          color={headingColor}
                          fontWeight="bold" 
                          mb={2} 
                          mt={3}
                          sx={{ fontSize: "1.1rem" }}
                        >
                          Constraints
                        </VuiTypography>
                        <VuiBox 
                          sx={{ 
                            background: darkMode ? "rgba(0, 0, 0, 0.2)" : "rgba(248, 250, 252, 0.95)",
                            padding: "15px",
                            borderRadius: "10px",
                            border: darkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(148, 163, 184, 0.3)",
                          }}
                        >
                          <VuiTypography 
                            variant="button" 
                            sx={{ 
                              color: darkMode ? "rgba(255, 255, 255, 0.85)" : "#334155",
                              fontSize: "0.875rem",
                              fontWeight: "400",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {challenge.constraints}
                          </VuiTypography>
                        </VuiBox>
                      </>
                    )}

                    {/* Tags */}
                    <VuiBox mt={3}>
                      <VuiTypography 
                        variant="h2" 
                        color={headingColor}
                        fontWeight="bold" 
                        mb={2}
                        sx={{ fontSize: "1.25rem" }}
                      >
                        Topics
                      </VuiTypography>
                      <VuiBox display="flex" gap={1.5} flexWrap="wrap">
                        {challenge.tags.map((tag, index) => (
                          <VuiBox
                            key={index}
                            sx={{
                              background: "linear-gradient(135deg, rgba(0, 117, 255, 0.25) 0%, rgba(67, 24, 255, 0.2) 100%)",
                              padding: "10px 18px",
                              borderRadius: "10px",
                              border: "2px solid rgba(0, 117, 255, 0.6)",
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                background: "linear-gradient(135deg, rgba(0, 117, 255, 0.4) 0%, rgba(67, 24, 255, 0.35) 100%)",
                                transform: "translateY(-3px) scale(1.05)",
                                boxShadow: "0px 6px 20px rgba(0, 117, 255, 0.4)",
                                borderColor: "#0075ff",
                              }
                            }}
                          >
                            <VuiTypography 
                              variant="caption" 
                              fontWeight="medium"
                              sx={{ 
                                color: "#66b3ff",
                                fontSize: "0.85rem",
                              }}
                            >
                              {tag}
                            </VuiTypography>
                          </VuiBox>
                        ))}
                      </VuiBox>
                    </VuiBox>
                  </VuiBox>
                )}

                {selectedTab === 1 && (
                  <VuiBox>
                    <VuiTypography 
                      variant="body2" 
                      mb={3}
                      sx={{ 
                        color: darkMode ? "rgba(255, 255, 255, 0.85)" : "#334155",
                        fontSize: "0.95rem",
                      }}
                    >
                      Here are some hints to help you solve this problem:
                    </VuiTypography>
                    {challenge.hints.map((hint, index) => (
                      <VuiBox
                        key={index}
                        sx={{
                          background: "linear-gradient(135deg, rgba(255, 215, 0, 0.18) 0%, rgba(255, 180, 0, 0.15) 100%)",
                          padding: "18px",
                          borderRadius: "15px",
                          border: "2px solid rgba(255, 215, 0, 0.5)",
                          marginBottom: "18px",
                          boxShadow: "0px 5px 20px rgba(255, 215, 0, 0.15), inset 0px 1px 0px rgba(255, 255, 255, 0.1)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0px 8px 25px rgba(255, 215, 0, 0.25)",
                            borderColor: "rgba(255, 215, 0, 0.7)",
                          },
                        }}
                      >
                        <VuiTypography 
                          variant="button" 
                          fontWeight="bold" 
                          mb={1}
                          sx={{ 
                            color: "#ffd700",
                            fontSize: "0.9rem",
                          }}
                        >
                          Hint {index + 1}:
                        </VuiTypography>
                        <VuiTypography 
                          variant="body2" 
                          sx={{ 
                            color: darkMode ? "rgba(255, 255, 255, 0.9)" : "#1e293b",
                            lineHeight: 1.7,
                            fontSize: "0.9rem",
                          }}
                        >
                          {hint}
                        </VuiTypography>
                      </VuiBox>
                    ))}
                  </VuiBox>
                )}

                {selectedTab === 2 && (
                  <VuiBox>
                    {submissionHistory.length === 0 ? (
                      <VuiBox textAlign="center" py={5}>
                        <VuiTypography 
                          variant="body2" 
                          sx={{ 
                            color: darkMode ? "rgba(255, 255, 255, 0.7)" : "#475569",
                            fontSize: "0.95rem",
                          }}
                        >
                          No submissions yet. Submit a solution to build your history.
                        </VuiTypography>
                      </VuiBox>
                    ) : (
                      <VuiBox display="flex" flexDirection="column" gap={1.4}>
                        {submissionHistory.map((submission, index) => (
                          <VuiBox
                            key={submission.id}
                            sx={{
                              background: submission.success
                                ? 'linear-gradient(135deg, rgba(0, 255, 153, 0.15), rgba(0, 180, 120, 0.14))'
                                : 'linear-gradient(135deg, rgba(255, 86, 86, 0.16), rgba(215, 38, 38, 0.14))',
                              border: `1px solid ${submission.success ? 'rgba(0, 255, 153, 0.3)' : 'rgba(255, 86, 86, 0.3)'}`,
                              borderRadius: '12px',
                              padding: '12px 14px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: 2,
                              flexWrap: 'wrap',
                            }}
                          >
                            <VuiBox display="flex" alignItems="center" gap={1.2}>
                              {submission.success ? (
                                <IoCheckmarkCircle size="18px" color="#00ff99" />
                              ) : (
                                <IoCloseCircle size="18px" color="#ff6b6b" />
                              )}
                              <VuiTypography variant="caption" sx={{ color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>
                                #{submissionHistory.length - index} • {submission.language}
                              </VuiTypography>
                            </VuiBox>

                            <VuiTypography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.82rem' }}>
                              {submission.passedTests}/{submission.totalTests} tests passed
                            </VuiTypography>

                            <VuiTypography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem' }}>
                              {new Date(submission.submittedAt).toLocaleString()}
                            </VuiTypography>
                          </VuiBox>
                        ))}
                      </VuiBox>
                    )}
                  </VuiBox>
                )}
              </VuiBox>
            </Card>
          </Grid>

          {/* Right Panel - Code Editor & Results */}
          <Grid item xs={12} lg={7}>
            <Grid container spacing={3}>
              {/* Code Editor */}
              <Grid item xs={12}>
                <CodeEditor
                  key={currentLanguage}
                  initialCode={code}
                  language={currentLanguage}
                  onCodeChange={setCode}
                  onRunCode={handleRunCode}
                  onLanguageChange={handleLanguageChange}
                  height="calc(50vh - 80px)"
                />
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <VuiBox display="flex" gap={2}>
                  <VuiButton
                    color="info"
                    variant="outlined"
                    onClick={() => handleRunCode(code, currentLanguage)}
                    disabled={isRunning}
                    sx={{
                      borderWidth: "2px",
                      borderColor: "#0075FF",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "0.95rem",
                      padding: "12px 24px",
                      background: "rgba(0, 117, 255, 0.1)",
                      "&:hover": {
                        borderWidth: "2px",
                        borderColor: "#0088FF",
                        background: "rgba(0, 117, 255, 0.2)",
                        boxShadow: "0px 5px 20px rgba(0, 117, 255, 0.3)",
                        transform: "translateY(-2px)",
                      },
                      "&:disabled": {
                        opacity: 0.5,
                        borderColor: "rgba(0, 117, 255, 0.3)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    <IoPlaySharp size="18px" style={{ marginRight: "8px" }} />
                    Run Tests
                  </VuiButton>
                  <VuiButton
                    color="success"
                    onClick={handleSubmit}
                    disabled={isRunning}
                    sx={{
                      background: "linear-gradient(135deg, #00dd00 0%, #00aa00 100%)",
                      fontWeight: "bold",
                      fontSize: "0.95rem",
                      padding: "12px 28px",
                      boxShadow: "0px 5px 20px rgba(0, 221, 0, 0.4)",
                      border: "2px solid rgba(0, 255, 0, 0.3)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #00ff00 0%, #00cc00 100%)",
                        boxShadow: "0px 7px 25px rgba(0, 221, 0, 0.5)",
                        transform: "translateY(-2px)",
                        border: "2px solid rgba(0, 255, 0, 0.5)",
                      },
                      "&:disabled": {
                        opacity: 0.5,
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    <IoSend size="16px" style={{ marginRight: "8px" }} />
                    Submit Solution
                  </VuiButton>
                </VuiBox>
              </Grid>

              {/* Output Panel with Tabs */}
              <Grid item xs={12}>
                <Card
                  sx={{
                    background: mainPanelBg,
                    backdropFilter: "blur(60px)",
                    border: mainPanelBorder,
                    borderRadius: "20px",
                    boxShadow: mainPanelShadow,
                    position: "relative",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: darkMode
                        ? "0px 12px 48px rgba(0, 0, 0, 0.8), 0px 0px 100px rgba(0, 117, 255, 0.2)"
                        : "0px 14px 36px rgba(15, 23, 42, 0.14)",
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "2px",
                      background: "linear-gradient(90deg, transparent 0%, #0075ff 50%, transparent 100%)",
                      opacity: 0.6,
                    },
                  }}
                >
                  <VuiBox p={3}>
                    {/* Tabs for Test Results and Console */}
                    <VuiBox
                      sx={{
                        background: tabsShellBg,
                        borderRadius: "12px",
                        padding: "8px",
                        marginBottom: "20px",
                        border: darkMode ? "2px solid rgba(0, 117, 255, 0.3)" : "1px solid rgba(148, 163, 184, 0.35)",
                        boxShadow: darkMode ? "0px 3px 10px rgba(0, 0, 0, 0.3)" : "none",
                      }}
                    >
                      <Tabs
                        value={outputTab}
                        onChange={(e, val) => setOutputTab(val)}
                        sx={{
                          background: "transparent",
                          backgroundColor: "transparent",
                          borderBottom: "none",
                          "& .MuiTab-root": { 
                            color: darkMode ? "#7b8ba8" : "#475569",
                            minHeight: "48px",
                            fontWeight: "700",
                            fontSize: "0.95rem",
                            textTransform: "none",
                            padding: "10px 20px",
                            marginRight: "8px",
                            borderRadius: "10px",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              color: darkMode ? "#b3d9ff" : "#0f172a",
                              background: darkMode
                                ? "linear-gradient(135deg, rgba(0, 117, 255, 0.2) 0%, rgba(67, 24, 255, 0.15) 100%)"
                                : "rgba(14, 165, 233, 0.12)",
                            }
                          },
                          "& .Mui-selected": { 
                            color: darkMode ? "#66b3ff !important" : "#075985 !important",
                            fontWeight: "bold",
                            background: darkMode
                              ? "linear-gradient(135deg, rgba(0, 117, 255, 0.4) 0%, rgba(67, 24, 255, 0.3) 100%) !important"
                              : "linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(37, 99, 235, 0.16) 100%) !important",
                            boxShadow: darkMode ? "0px 3px 10px rgba(0, 117, 255, 0.3)" : "none",
                          },
                          "& .MuiTabs-indicator": { 
                            display: "none",
                          },
                        }}
                      >
                      <Tab label="Test Results" />
                      <Tab label="Console Output" icon={<IoTerminal size="16px" />} iconPosition="start" />
                    </Tabs>                    </VuiBox>
                    {/* Test Results Panel */}
                    {outputTab === 0 && (
                      <VuiBox>
                        {testResults.length > 0 ? (
                          <>
                            {testResults.map((result, index) => (
                              <VuiBox
                                key={index}
                                sx={{
                                  background: result.passed 
                                    ? "linear-gradient(135deg, rgba(0, 255, 136, 0.18) 0%, rgba(0, 187, 102, 0.15) 100%)" 
                                    : "linear-gradient(135deg, rgba(255, 68, 68, 0.18) 0%, rgba(227, 26, 26, 0.15) 100%)",
                                  padding: "18px",
                                  borderRadius: "15px",
                                  border: "2px solid",
                                  borderColor: result.passed 
                                    ? "rgba(0, 255, 136, 0.5)" 
                                    : "rgba(255, 68, 68, 0.5)",
                                  marginBottom: "16px",
                                  boxShadow: result.passed
                                    ? "0px 5px 20px rgba(0, 255, 136, 0.2), inset 0px 1px 0px rgba(255, 255, 255, 0.1)"
                                    : "0px 5px 20px rgba(255, 68, 68, 0.2), inset 0px 1px 0px rgba(255, 255, 255, 0.1)",
                                  transition: "all 0.3s ease",
                                  "&:hover": {
                                    transform: "translateY(-2px)",
                                    boxShadow: result.passed
                                      ? "0px 8px 25px rgba(0, 255, 136, 0.3)"
                                      : "0px 8px 25px rgba(255, 68, 68, 0.3)",
                                  },
                                }}
                              >
                                <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                                  <VuiBox display="flex" alignItems="center" gap={1}>
                                    {result.passed ? (
                                      <IoCheckmarkCircle size="22px" color="#00ff00" />
                                    ) : (
                                      <IoCloseCircle size="22px" color="#ff0000" />
                                    )}
                                    <VuiTypography 
                                      variant="button" 
                                      color={headingColor}
                                      fontWeight="bold"
                                      sx={{ fontSize: "0.95rem" }}
                                    >
                                      Test Case {index + 1}
                                    </VuiTypography>
                                  </VuiBox>
                                  <VuiTypography 
                                    variant="caption" 
                                    sx={{ 
                                      color: darkMode ? "rgba(255, 255, 255, 0.7)" : "#475569",
                                      fontSize: "0.8rem",
                                    }}
                                  >
                                    {result.time}
                                  </VuiTypography>
                                </VuiBox>
                                <VuiBox 
                                  sx={{
                                    background: "rgba(0, 0, 0, 0.3)",
                                    padding: "12px",
                                    borderRadius: "8px",
                                    fontFamily: "'JetBrains Mono', monospace",
                                  }}
                                >
                                  <VuiTypography 
                                    variant="caption" 
                                    component="div" 
                                    sx={{ 
                                      color: darkMode ? "rgba(255, 255, 255, 0.85)" : "#334155",
                                      fontSize: "0.85rem",
                                      marginBottom: "4px",
                                    }}
                                  >
                                    <strong style={{ color: "#66b3ff" }}>Input:</strong> {result.input}
                                  </VuiTypography>
                                  <VuiTypography 
                                    variant="caption" 
                                    component="div" 
                                    sx={{ 
                                      color: darkMode ? "rgba(255, 255, 255, 0.85)" : "#334155",
                                      fontSize: "0.85rem",
                                      marginBottom: "4px",
                                    }}
                                  >
                                    <strong style={{ color: "#66b3ff" }}>Expected:</strong> {result.expected}
                                  </VuiTypography>
                                  <VuiTypography 
                                    variant="caption" 
                                    component="div"
                                    sx={{ 
                                      color: result.passed ? "#00ff00" : "#ff6666",
                                      fontSize: "0.85rem",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    <strong>Actual:</strong> {result.actual}
                                  </VuiTypography>
                                </VuiBox>
                              </VuiBox>
                            ))}
                          </>
                        ) : (
                          <VuiBox 
                            textAlign="center" 
                            py={4}
                            sx={{
                              background: "linear-gradient(135deg, rgba(0, 117, 255, 0.08) 0%, rgba(67, 24, 255, 0.06) 100%)",
                              borderRadius: "15px",
                              border: "2px dashed rgba(0, 117, 255, 0.3)",
                              boxShadow: "inset 0px 2px 10px rgba(0, 0, 0, 0.2)",
                            }}
                          >
                            <IoPlaySharp size="56px" color="rgba(0, 117, 255, 0.5)" style={{ marginBottom: "16px" }} />
                            <VuiTypography 
                              variant="button" 
                              sx={{ 
                                color: darkMode ? "rgba(255, 255, 255, 0.8)" : "#334155",
                                fontSize: "1rem",
                                fontWeight: "600",
                              }}
                            >
                              Run your code to see test results
                            </VuiTypography>
                          </VuiBox>
                        )}
                      </VuiBox>
                    )}

                    {/* Console Output Panel */}
                    {outputTab === 1 && (
                      <VuiBox
                        sx={{
                          background: "linear-gradient(135deg, rgba(0, 10, 25, 0.8) 0%, rgba(5, 15, 30, 0.9) 100%)",
                          borderRadius: "15px",
                          padding: "18px",
                          minHeight: "200px",
                          maxHeight: "300px",
                          overflowY: "auto",
                          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                          border: "2px solid rgba(0, 117, 255, 0.3)",
                          boxShadow: "inset 0px 3px 15px rgba(0, 0, 0, 0.5), 0px 2px 10px rgba(0, 117, 255, 0.1)",
                          position: "relative",
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "4px",
                            height: "100%",
                            background: "linear-gradient(180deg, #0075ff 0%, #4318ff 100%)",
                            borderRadius: "2px 0 0 2px",
                          },
                          "&::-webkit-scrollbar": {
                            width: "8px",
                          },
                          "&::-webkit-scrollbar-track": {
                            background: "rgba(0, 0, 0, 0.3)",
                          },
                          "&::-webkit-scrollbar-thumb": {
                            background: "rgba(0, 117, 255, 0.5)",
                            borderRadius: "4px",
                            "&:hover": {
                              background: "rgba(0, 117, 255, 0.7)",
                            },
                          },
                        }}
                      >
                        {consoleOutput.length > 0 ? (
                          consoleOutput.map((log, index) => (
                            <VuiBox key={index} display="flex" gap={2} mb={0.8}>
                              <VuiTypography 
                                variant="caption" 
                                sx={{ 
                                  color: darkMode ? "rgba(255, 255, 255, 0.5)" : "#64748b",
                                  minWidth: "85px",
                                  fontSize: "0.75rem",
                                }}
                              >
                                [{log.timestamp}]
                              </VuiTypography>
                              <VuiTypography 
                                variant="caption" 
                                sx={{
                                  color: log.type === "error" 
                                    ? "#ff6666" 
                                    : log.type === "success" 
                                    ? "#66ff66" 
                                    : darkMode
                                      ? "rgba(255, 255, 255, 0.9)"
                                      : "#0f172a",
                                  fontFamily: "'JetBrains Mono', monospace",
                                  fontSize: "0.85rem",
                                  lineHeight: 1.6,
                                }}
                              >
                                {log.text}
                              </VuiTypography>
                            </VuiBox>
                          ))
                        ) : (
                          <VuiBox 
                            display="flex" 
                            alignItems="center" 
                            justifyContent="center" 
                            height="180px"
                          >
                            <VuiBox textAlign="center">
                              <IoTerminal size="56px" color="rgba(0, 117, 255, 0.4)" style={{ marginBottom: "16px" }} />
                              <VuiTypography 
                                variant="caption" 
                                sx={{ 
                                  color: darkMode ? "rgba(255, 255, 255, 0.6)" : "#64748b",
                                  fontSize: "0.95rem",
                                  fontWeight: "500",
                                }}
                              >
                                Console output will appear here...
                              </VuiTypography>
                            </VuiBox>
                          </VuiBox>
                        )}
                      </VuiBox>
                    )}
                    
                    {isRunning && (
                      <VuiBox 
                        textAlign="center" 
                        py={3} 
                        mt={2}
                        sx={{
                          background: "linear-gradient(135deg, rgba(0, 117, 255, 0.15) 0%, rgba(67, 24, 255, 0.12) 100%)",
                          borderRadius: "15px",
                          border: "2px solid rgba(0, 117, 255, 0.4)",
                          boxShadow: "0px 5px 20px rgba(0, 117, 255, 0.2), inset 0px 1px 0px rgba(255, 255, 255, 0.1)",
                          position: "relative",
                          overflow: "hidden",
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: "-100%",
                            width: "100%",
                            height: "2px",
                            background: "linear-gradient(90deg, transparent 0%, #0075ff 50%, transparent 100%)",
                            animation: "slide 1.5s linear infinite",
                          },
                          "@keyframes slide": {
                            "0%": { left: "-100%" },
                            "100%": { left: "100%" },
                          },
                        }}
                      >
                        <VuiTypography 
                          variant="button" 
                          sx={{ 
                            color: "#66b3ff",
                            fontWeight: "bold",
                            fontSize: "1rem",
                          }}
                        >
                          ⚡ Running tests...
                        </VuiTypography>
                        <VuiProgress 
                          value={50} 
                          color="info" 
                          sx={{ 
                            marginTop: "14px",
                            height: "8px",
                            borderRadius: "4px",
                            background: "rgba(0, 0, 0, 0.3)",
                          }}
                          aria-label="Running tests, 50% complete"
                        />
                      </VuiBox>
                    )}
                  </VuiBox>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </VuiBox>

      <Modal open={ticketModalOpen} onClose={() => setTicketModalOpen(false)}>
        <VuiBox
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "calc(100vw - 32px)", md: 560 },
            background: darkMode
              ? "linear-gradient(127.09deg, rgba(6, 11, 40, 0.97) 19.41%, rgba(10, 14, 35, 0.94) 76.65%)"
              : "linear-gradient(127.09deg, rgba(255, 255, 255, 0.99), rgba(241, 245, 249, 0.97))",
            border: darkMode ? "1px solid rgba(255,255,255,0.16)" : "1px solid rgba(148, 163, 184, 0.4)",
            borderRadius: "18px",
            boxShadow: darkMode ? "0 18px 40px rgba(0, 0, 0, 0.5)" : "0 14px 30px rgba(15, 23, 42, 0.18)",
            p: 3,
          }}
        >
          <VuiTypography variant="h5" color={headingColor} fontWeight="bold" mb={2}>
            Open Ticket for This Challenge
          </VuiTypography>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <VuiTypography variant="button" color={headingColor} sx={{ mb: 1 }}>
              Select what has a problem
            </VuiTypography>
            <FormGroup>
              {availableTicketUseCases.map((option) => (
                <FormControlLabel
                  key={option.value}
                  control={
                    <Checkbox
                      checked={ticketUseCases.includes(option.value)}
                      onChange={() => toggleTicketUseCase(option.value)}
                    />
                  }
                  label={option.label}
                />
              ))}
            </FormGroup>
          </FormControl>

          <VuiBox display="flex" justifyContent="flex-end" gap={1}>
            <VuiButton color="secondary" onClick={() => setTicketModalOpen(false)}>
              Cancel
            </VuiButton>
            <VuiButton color="info" onClick={handleOpenTicket} disabled={ticketSubmitting}>
              {ticketSubmitting ? "Opening..." : "Open Ticket"}
            </VuiButton>
          </VuiBox>
        </VuiBox>
      </Modal>
      <Footer />
    </DashboardLayout>
  );
}

export default ChallengeDetail;
