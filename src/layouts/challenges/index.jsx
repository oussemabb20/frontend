  // Regular modal/input styles (adapted for light/dark mode)
  const getModalStyle = (isLightMode) => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: 800,
    maxHeight: '90vh',
    overflowY: 'auto',
    bgcolor: isLightMode ? '#ffffff' : '#0a0e23',
    backgroundImage: isLightMode
      ? 'linear-gradient(127.09deg, rgba(255, 255, 255, 0.98) 19.41%, rgba(241, 245, 249, 0.98) 76.65%)'
      : 'linear-gradient(127.09deg, rgba(6, 11, 40, 0.98) 19.41%, rgba(10, 14, 35, 0.98) 76.65%)',
    border: isLightMode ? '2px solid rgba(148, 163, 184, 0.25)' : '2px solid rgba(0, 117, 255, 0.3)',
    borderRadius: '20px',
    boxShadow: isLightMode ? '0px 10px 40px rgba(15, 23, 42, 0.1)' : '0px 20px 60px rgba(0, 0, 0, 0.8)',
    p: 4,
  });

  const getInputStyle = (isLightMode) => ({
    '& .MuiInputBase-root': {
      borderRadius: '10px',
      color: isLightMode ? '#1a202c' : 'white',
    },
    '& .MuiOutlinedInput-root': {
      background: isLightMode ? '#f5f7fa !important' : 'rgba(14, 21, 58, 0.68) !important',
      color: isLightMode ? '#1a202c !important' : '#e9f2ff !important',
    },
    '& .MuiInputBase-input': {
      color: isLightMode ? '#1a202c !important' : '#e9f2ff !important',
      fontSize: '0.95rem',
      lineHeight: 1.35,
    },
    '& .MuiInputBase-input::placeholder': {
      color: isLightMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(209, 222, 246, 0.58)',
      opacity: 1,
      fontSize: '0.9rem',
    },
    '& .MuiInputBase-input:-webkit-autofill, & .MuiInputBase-input:-webkit-autofill:hover, & .MuiInputBase-input:-webkit-autofill:focus': {
      WebkitTextFillColor: isLightMode ? '#1a202c' : '#e9f2ff',
      WebkitBoxShadow: isLightMode ? '0 0 0 1000px #f5f7fa inset' : '0 0 0 1000px rgba(14, 21, 58, 0.68) inset',
      transition: 'background-color 9999s ease-out 0s',
      borderRadius: '10px',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: isLightMode ? 'rgba(148, 163, 184, 0.35)' : 'rgba(255, 255, 255, 0.2)',
    },
    '& .MuiInputLabel-root': {
      color: isLightMode ? 'rgba(55, 65, 81, 0.8)' : 'rgba(255, 255, 255, 0.6)',
      fontSize: '0.95rem',
    },
    '& .MuiInputLabel-shrink': {
      fontSize: '0.82rem',
      letterSpacing: '0.01em',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#0075FF',
    },
    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: isLightMode ? 'rgba(148, 163, 184, 0.6)' : 'rgba(255, 255, 255, 0.3)',
    },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#0075FF',
    },
    marginBottom: 2,
  });
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Grid, styled, Card, Select, MenuItem, FormControl, CircularProgress, Pagination, Modal, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import VuiInput from "components/VuiInput";
import VuiButton from "components/VuiButton";
import VuiProgress from "components/VuiProgress";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ChallengeCard from "components/ChallengeCard";
import { useVisionUIController } from "context";
import { IoSearchSharp, IoAdd, IoClose, IoTrash, IoCreate, IoFlash } from "react-icons/io5";
import challengeService from "../../services/challenge.service";
import progressTrackerService from "../../services/progressTracker.service";
import mlGenerationService from "../../services/ml-generation.service";
import { authService } from "../../services/auth.service";

const DarkSelect = styled(Select)(({ theme }) => {
  const isLightMode = theme.palette.mode === "light";

  return {
    color: isLightMode ? "#1a202c !important" : "white !important",
    height: "50px",
    borderRadius: "12px",
    backgroundColor: isLightMode ? "#ffffff !important" : "#0e1a3a !important",
    cursor: "pointer",
    width: "100%",
    pointerEvents: "auto !important",
    "& .MuiSelect-select": {
      backgroundColor: "transparent !important",
      padding: "14px 14px",
      color: isLightMode ? "#1a202c !important" : "white !important",
      cursor: "pointer",
      width: "100%",
      display: "flex",
      alignItems: "center",
      pointerEvents: "auto !important",
    },
    "& .MuiOutlinedInput-input": {
      backgroundColor: "transparent !important",
      color: isLightMode ? "#1a202c !important" : "white !important",
      cursor: "pointer",
      padding: "14px 14px",
      pointerEvents: "auto !important",
    },
    "& .MuiInputBase-input": {
      color: isLightMode ? "#1a202c !important" : "white !important",
      cursor: "pointer",
      pointerEvents: "auto !important",
    },
    "& .MuiOutlinedInput-root": {
      pointerEvents: "auto !important",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: isLightMode ? "rgba(148, 163, 184, 0.35)" : "rgba(255, 255, 255, 0.1)",
      borderRadius: "12px",
      pointerEvents: "none",
    },
    "&:hover": {
      cursor: "pointer",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: isLightMode ? "rgba(148, 163, 184, 0.6)" : "rgba(255, 255, 255, 0.2)",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(0, 117, 255, 0.5)",
    },
    "& .MuiSvgIcon-root": {
      color: isLightMode ? "#64748b !important" : "white !important",
      cursor: "pointer",
      pointerEvents: "auto !important",
    },
    "& fieldset": {
      borderColor: isLightMode ? "rgba(148, 163, 184, 0.35) !important" : "rgba(255, 255, 255, 0.1) !important",
      pointerEvents: "none",
    },
    "& legend": {
      pointerEvents: "none",
    },
  };
});



const darkMenuProps = {
  MenuListProps: {
    sx: (theme) => {
      const isLightMode = theme.palette.mode === "light";
      return {
        background: isLightMode
          ? "linear-gradient(127.09deg, rgba(255, 255, 255, 0.98) 19.41%, rgba(241, 245, 249, 0.98) 76.65%)"
          : "linear-gradient(127.09deg, rgba(6, 11, 40, 0.98) 19.41%, rgba(10, 14, 35, 0.98) 76.65%)",
        color: isLightMode ? "#1a202c !important" : "#ffffff !important",
        "& .MuiMenuItem-root, & .MuiMenuItem-root .MuiTypography-root": {
          color: isLightMode ? "#1a202c !important" : "#ffffff !important",
          opacity: "1 !important",
        },
        "& .MuiMenuItem-root.Mui-selected, & .MuiMenuItem-root.Mui-selected .MuiTypography-root": {
          color: isLightMode ? "#0f172a !important" : "#ffffff !important",
        },
      };
    },
  },
  PaperProps: {
    sx: (theme) => {
      const isLightMode = theme.palette.mode === "light";
      return {
        bgcolor: isLightMode ? "#ffffff" : "#0a0e23",
        backgroundImage: isLightMode
          ? "linear-gradient(127.09deg, rgba(255, 255, 255, 0.98) 19.41%, rgba(241, 245, 249, 0.98) 76.65%)"
          : "linear-gradient(127.09deg, rgba(6, 11, 40, 0.98) 19.41%, rgba(10, 14, 35, 0.98) 76.65%)",
        border: isLightMode ? "1px solid rgba(148, 163, 184, 0.25)" : "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "12px",
        mt: 1,
        boxShadow: isLightMode ? "0px 8px 24px rgba(15, 23, 42, 0.12)" : "0px 8px 24px rgba(0, 0, 0, 0.4)",
        "&& .MuiMenuItem-root, && .MuiMenuItem-root .MuiTypography-root": {
          color: isLightMode ? "#1a202c !important" : "#ffffff !important",
          opacity: "1 !important",
          padding: "12px 16px",
          "&:hover": {
            bgcolor: "rgba(0, 117, 255, 0.12)",
            color: isLightMode ? "#1a202c !important" : "#ffffff !important",
          },
          "&.Mui-selected": {
            bgcolor: "rgba(0, 117, 255, 0.25) !important",
            color: isLightMode ? "#0f172a !important" : "#ffffff !important",
            fontWeight: 600,
            "&:hover": {
              bgcolor: "rgba(0, 117, 255, 0.35) !important",
              color: isLightMode ? "#0f172a !important" : "#ffffff !important",
            },
          },
        },
      };
    },
  },
};

function Challenges() {
  const [controller] = useVisionUIController();
  const { darkMode } = controller;
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyOpen, setDifficultyOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  
  // API states
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [activeTicketCountByChallenge, setActiveTicketCountByChallenge] = useState({});
  const [solvedChallengeIds, setSolvedChallengeIds] = useState([]);
  const [playerProgress, setPlayerProgress] = useState(progressTrackerService.getLevelProgress());

  const pageTitleColor = darkMode ? "white" : "dark";
  const pageTextColor = darkMode ? "text" : "dark";
  const filterCardBg = darkMode
    ? "linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.49) 76.65%)"
    : "linear-gradient(127.09deg, rgba(255, 255, 255, 0.98) 19.41%, rgba(241, 245, 249, 0.95) 76.65%)";
  const filterCardBorder = darkMode ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(148, 163, 184, 0.25)";
  const filterMenuItemSx = {
    color: darkMode ? "#ffffff" : "#1a202c",
    "&:hover": {
      backgroundColor: "rgba(0, 117, 255, 0.12)",
      color: darkMode ? "#ffffff" : "#1a202c",
    },
    "&.Mui-selected": {
      backgroundColor: "rgba(0, 117, 255, 0.25)",
      color: darkMode ? "#ffffff" : "#0f172a",
      fontWeight: 600,
    },
    "&.Mui-selected:hover": {
      backgroundColor: "rgba(0, 117, 255, 0.35)",
      color: darkMode ? "#ffffff" : "#0f172a",
    },
  };

  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingChallengeId, setEditingChallengeId] = useState(null);
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    categories: ['algorithms'],
    supportedLanguages: ['javascript', 'python'],
    constraints: '',
    hints: [''],
    tags: [''],
    testCases: [{ input: '', expectedOutput: '', isHidden: false }],
    starterCode: [{ language: 'javascript', code: '// Write your solution here\nfunction solution() {\n  \n}' }],
  });

  // AI Generation state
  const [openAiModal, setOpenAiModal] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiParams, setAiParams] = useState({
    difficulty: 'medium',
    topic: '',
    supportedLanguages: ['python', 'javascript'],
    tags: '',
  });
  const [aiError, setAiError] = useState(null);
  const [aiSuccess, setAiSuccess] = useState(null);

  // ML Generation state
  const [openMlModal, setOpenMlModal] = useState(false);
  const [mlGenerating, setMlGenerating] = useState(false);
  const [mlParams, setMlParams] = useState({
    difficulty: 'medium',
    language: 'javascript',
  });
  const [mlError, setMlError] = useState(null);
  const [mlSuccess, setMlSuccess] = useState(null);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const displayedChallenges = useMemo(() => {
    const noFilterApplied =
      difficultyFilter === 'all' &&
      categoryFilter === 'all' &&
      !debouncedSearch.trim();

    if (!noFilterApplied) return challenges;

    const unsolved = [];
    const solved = [];

    challenges.forEach((challenge) => {
      if (solvedChallengeIds.includes(challenge._id)) {
        solved.push(challenge);
      } else {
        unsolved.push(challenge);
      }
    });

    return [...unsolved, ...solved];
  }, [challenges, solvedChallengeIds, difficultyFilter, categoryFilter, debouncedSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch challenges from API
  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 9,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      if (difficultyFilter !== 'all') {
        params.difficulty = difficultyFilter;
      }
      if (categoryFilter !== 'all') {
        params.category = categoryFilter;
      }
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      const response = await challengeService.getChallenges(params);
      setChallenges(response.challenges);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (err) {
      console.error('Error fetching challenges:', err);
      setError('Failed to load challenges. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, difficultyFilter, categoryFilter, debouncedSearch]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  useEffect(() => {
    if (!isAdmin) {
      setActiveTicketCountByChallenge({});
      return;
    }

    let isMounted = true;

    const fetchActiveTicketCounts = async () => {
      try {
        const [openTickets, inProgressTickets] = await Promise.all([
          challengeService.getTickets('open'),
          challengeService.getTickets('in_progress'),
        ]);

        const counts = {};
        [...openTickets, ...inProgressTickets].forEach((ticket) => {
          const challengeId = String(ticket.challengeId || '').trim();
          if (!challengeId) return;
          counts[challengeId] = (counts[challengeId] || 0) + 1;
        });

        if (isMounted) {
          setActiveTicketCountByChallenge(counts);
        }
      } catch (err) {
        console.error('Failed to fetch active ticket counts:', err);
        if (isMounted) {
          setActiveTicketCountByChallenge({});
        }
      }
    };

    fetchActiveTicketCounts();

    return () => {
      isMounted = false;
    };
  }, [isAdmin]);

  useEffect(() => {
    const refreshSolvedChallenges = () => {
      setSolvedChallengeIds(progressTrackerService.getSolvedChallengeIds());
      setPlayerProgress(progressTrackerService.getLevelProgress());
    };

    refreshSolvedChallenges();

    const progressEvent = progressTrackerService.getProgressEventName();
    globalThis.addEventListener(progressEvent, refreshSolvedChallenges);
    globalThis.addEventListener('storage', refreshSolvedChallenges);
    globalThis.addEventListener('focus', refreshSolvedChallenges);

    return () => {
      globalThis.removeEventListener(progressEvent, refreshSolvedChallenges);
      globalThis.removeEventListener('storage', refreshSolvedChallenges);
      globalThis.removeEventListener('focus', refreshSolvedChallenges);
    };
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [difficultyFilter, categoryFilter]);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartChallenge = (challengeId) => {
    console.log("Starting challenge:", challengeId);
    navigate(`/challenges/${challengeId}`);
  };

  // Handle create challenge
  const handleCreateChallenge = async () => {
    setCreating(true);
    try {
      // Filter test cases that have both input AND expectedOutput
      const validTestCases = newChallenge.testCases
        .filter(tc => tc.input.trim() !== '' && tc.expectedOutput.trim() !== '')
        .map(tc => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isHidden: tc.isHidden || false,
          ...(tc.description && { description: tc.description })
        }));

      if (validTestCases.length === 0) {
        alert('Please add at least one test case with both input and expected output.');
        setCreating(false);
        return;
      }

      // Filter starter code
      const validStarterCode = newChallenge.starterCode
        .filter(sc => sc.code.trim() !== '')
        .map(sc => ({
          language: sc.language,
          code: sc.code,
          ...(sc.functionSignature && { functionSignature: sc.functionSignature })
        }));

      const cleanedChallenge = {
        title: newChallenge.title,
        description: newChallenge.description,
        difficulty: newChallenge.difficulty,
        categories: newChallenge.categories,
        supportedLanguages: newChallenge.supportedLanguages,
        constraints: newChallenge.constraints,
        hints: newChallenge.hints.filter(h => h.trim() !== ''),
        tags: newChallenge.tags.filter(t => t.trim() !== ''),
        testCases: validTestCases,
        starterCode: validStarterCode.length > 0 ? validStarterCode : undefined,
      };

      await challengeService.createChallenge(cleanedChallenge);
      handleCloseModal();
      fetchChallenges(); // Refresh the list
    } catch (err) {
      console.error('Error creating challenge:', err);
      const errorMsg = err.response?.data?.message || 'Failed to create challenge. Please try again.';
      alert(Array.isArray(errorMsg) ? errorMsg.join('\n') : errorMsg);
    } finally {
      setCreating(false);
    }
  };

  // Handle AI generation
  const handleGenerateAI = async () => {
    setAiGenerating(true);
    setAiError(null);
    setAiSuccess(null);
    try {
      const tags = aiParams.tags
        ? aiParams.tags.split(',').map(t => t.trim()).filter(Boolean)
        : undefined;
      const generated = await challengeService.generateWithAI({
        difficulty: aiParams.difficulty,
        topic: aiParams.topic || undefined,
        supportedLanguages: aiParams.supportedLanguages,
        tags,
      });
      setAiSuccess(`✅ Challenge "${generated.title}" generated and saved!`);
      fetchChallenges();
      setTimeout(() => {
        setOpenAiModal(false);
        setAiSuccess(null);
        setAiParams({ difficulty: 'medium', topic: '', supportedLanguages: ['python', 'javascript'], tags: '' });
      }, 2000);
    } catch (err) {
      console.error('AI generation error:', err);
      setAiError(err.response?.data?.message || 'AI generation failed. Please try again.');
    } finally {
      setAiGenerating(false);
    }
  };

  const toggleAiLanguage = (lang) => {
    setAiParams(prev => ({
      ...prev,
      supportedLanguages: prev.supportedLanguages.includes(lang)
        ? prev.supportedLanguages.filter(l => l !== lang)
        : [...prev.supportedLanguages, lang],
    }));
  };

  // Handle delete challenge
  const handleDeleteChallenge = async (challengeId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this challenge?')) {
      return;
    }
    try {
      await challengeService.deleteChallenge(challengeId);
      fetchChallenges(); // Refresh the list
    } catch (err) {
      console.error('Error deleting challenge:', err);
      alert('Failed to delete challenge. Please try again.');
    }
  };

  // Handle edit challenge
  const handleEditChallenge = (challenge, e) => {
    e.stopPropagation();
    setEditingChallengeId(challenge._id);
    // Clean testCases and starterCode to remove MongoDB _id fields
    const cleanTestCases = challenge.testCases?.map(tc => ({
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      isHidden: tc.isHidden || false,
      description: tc.description || ''
    })) || [{ input: '', expectedOutput: '', isHidden: false }];
    
    const cleanStarterCode = challenge.starterCode?.map(sc => ({
      language: sc.language,
      code: sc.code,
      functionSignature: sc.functionSignature || ''
    })) || [{ language: 'javascript', code: '// Write your solution here\nfunction solution() {\n  \n}' }];
    
    setNewChallenge({
      title: challenge.title || '',
      description: challenge.description || '',
      difficulty: challenge.difficulty || 'easy',
      categories: challenge.categories || ['algorithms'],
      supportedLanguages: challenge.supportedLanguages || ['javascript', 'python'],
      constraints: challenge.constraints || '',
      hints: challenge.hints?.length > 0 ? [...challenge.hints] : [''],
      tags: challenge.tags?.length > 0 ? [...challenge.tags] : [''],
      testCases: cleanTestCases,
      starterCode: cleanStarterCode,
    });
    setOpenModal(true);
  };

  // Handle update challenge
  const handleUpdateChallenge = async () => {
    setCreating(true);
    try {
      // Filter test cases that have both input AND expectedOutput
      const validTestCases = newChallenge.testCases
        .filter(tc => tc.input.trim() !== '' && tc.expectedOutput.trim() !== '')
        .map(tc => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isHidden: tc.isHidden || false,
          ...(tc.description && { description: tc.description })
        }));
      
      // Filter starter code
      const validStarterCode = newChallenge.starterCode
        .filter(sc => sc.code.trim() !== '')
        .map(sc => ({
          language: sc.language,
          code: sc.code,
          ...(sc.functionSignature && { functionSignature: sc.functionSignature })
        }));

      const cleanedChallenge = {
        title: newChallenge.title,
        description: newChallenge.description,
        difficulty: newChallenge.difficulty,
        categories: newChallenge.categories,
        supportedLanguages: newChallenge.supportedLanguages,
        constraints: newChallenge.constraints,
        hints: newChallenge.hints.filter(h => h.trim() !== ''),
        tags: newChallenge.tags.filter(t => t.trim() !== ''),
        testCases: validTestCases.length > 0 ? validTestCases : undefined,
        starterCode: validStarterCode.length > 0 ? validStarterCode : undefined,
      };

      await challengeService.updateChallenge(editingChallengeId, cleanedChallenge);
      setOpenModal(false);
      setEditingChallengeId(null);
      resetForm();
      fetchChallenges();
    } catch (err) {
      console.error('Error updating challenge:', err);
      const errorMsg = err.response?.data?.message || 'Failed to update challenge. Please try again.';
      alert(Array.isArray(errorMsg) ? errorMsg.join('\n') : errorMsg);
    } finally {
      setCreating(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setNewChallenge({
      title: '',
      description: '',
      difficulty: 'easy',
      categories: ['algorithms'],
      supportedLanguages: ['javascript', 'python'],
      constraints: '',
      hints: [''],
      tags: [''],
      testCases: [{ input: '', expectedOutput: '', isHidden: false }],
      starterCode: [{ language: 'javascript', code: '// Write your solution here\nfunction solution() {\n  \n}' }],
    });
  };

  // Close modal handler
  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingChallengeId(null);
    resetForm();
  };

  // Handle form changes
  const updateNewChallenge = (field, value) => {
    setNewChallenge(prev => ({ ...prev, [field]: value }));
  };

  const addTestCase = () => {
    setNewChallenge(prev => ({
      ...prev,
      testCases: [...prev.testCases, { input: '', expectedOutput: '', isHidden: false }]
    }));
  };

  const updateTestCase = (index, field, value) => {
    setNewChallenge(prev => ({
      ...prev,
      testCases: prev.testCases.map((tc, i) => i === index ? { ...tc, [field]: value } : tc)
    }));
  };

  const addHint = () => {
    setNewChallenge(prev => ({ ...prev, hints: [...prev.hints, ''] }));
  };

  const updateHint = (index, value) => {
    setNewChallenge(prev => ({
      ...prev,
      hints: prev.hints.map((h, i) => i === index ? value : h)
    }));
  };

  const addTag = () => {
    setNewChallenge(prev => ({ ...prev, tags: [...prev.tags, ''] }));
  };

  const updateTag = (index, value) => {
    setNewChallenge(prev => ({
      ...prev,
      tags: prev.tags.map((t, i) => i === index ? value : t)
    }));
  };

  // AI modal/input styles (choose light or dark variants when rendering)
  const getAiModalStyle = (isLightMode) => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: 560,
    maxHeight: '90vh',
    overflowY: 'auto',
    bgcolor: isLightMode ? '#ffffff' : '#071126',
    p: { xs: 2.5, sm: 3.5 },
    border: isLightMode ? '1px solid rgba(148, 163, 184, 0.25)' : '1px solid rgba(78, 201, 240, 0.35)',
    backgroundColor: isLightMode ? '#ffffff' : '#071126',
    backgroundImage: isLightMode
      ? 'linear-gradient(127.09deg, rgba(255, 255, 255, 0.98) 19.41%, rgba(241, 245, 249, 0.98) 76.65%)'
      : 'radial-gradient(circle at 15% -20%, rgba(78, 201, 240, 0.35), transparent 45%), radial-gradient(circle at 100% 10%, rgba(255, 149, 0, 0.26), transparent 40%), linear-gradient(150deg, rgba(7, 17, 38, 0.98) 0%, rgba(10, 20, 46, 0.97) 100%)',
    borderRadius: '20px',
    boxShadow: isLightMode ? '0 10px 30px rgba(15, 23, 42, 0.08)' : '0 22px 70px rgba(0, 0, 0, 0.75)',
  });

  const getAiInputStyle = (isLightMode) => ({
    ...getInputStyle(isLightMode),
    marginBottom: 0,
    '& .MuiInputBase-root': {
      borderRadius: '12px',
      color: isLightMode ? '#1a202c' : 'white',
      minHeight: '52px',
    },
    '& .MuiOutlinedInput-root': {
      background: isLightMode ? '#ffffff !important' : 'rgba(8, 20, 48, 0.72) !important',
      color: isLightMode ? '#1a202c !important' : '#e9f2ff !important',
    },
    '& .MuiInputBase-input': {
      color: isLightMode ? '#1a202c !important' : '#e9f2ff !important',
      fontSize: '0.95rem',
      lineHeight: 1.35,
    },
    '& .MuiInputBase-input::placeholder': {
      color: isLightMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(206, 219, 245, 0.58)',
      opacity: 1,
      fontSize: '0.9rem',
    },
    '& .MuiInputBase-input:-webkit-autofill, & .MuiInputBase-input:-webkit-autofill:hover, & .MuiInputBase-input:-webkit-autofill:focus': {
      WebkitTextFillColor: isLightMode ? '#1a202c' : '#e9f2ff',
      WebkitBoxShadow: isLightMode ? '0 0 0 1000px #ffffff inset' : '0 0 0 1000px rgba(8, 20, 48, 0.72) inset',
      transition: 'background-color 9999s ease-out 0s',
      borderRadius: '12px',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: isLightMode ? 'rgba(148, 163, 184, 0.35)' : 'rgba(126, 163, 216, 0.35)',
    },
    '& .MuiInputLabel-root': {
      color: isLightMode ? 'rgba(55, 65, 81, 0.8)' : 'rgba(173, 197, 234, 0.82)',
      fontSize: '0.94rem',
    },
    '& .MuiInputLabel-shrink': {
      fontSize: '0.8rem',
      letterSpacing: '0.01em',
    },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#0075FF',
    },
  });

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <VuiBox py={3}>
        {/* Header */}
        <VuiBox mb={4} display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
          <VuiBox>
            <VuiTypography variant="h1" color={pageTitleColor} fontWeight="bold" mb={1} sx={{ fontSize: "1.875rem" }}>
              Coding Challenges
            </VuiTypography>
            <VuiTypography variant="body1" color={pageTextColor} fontWeight="regular">
              Choose a challenge and test your coding skills
            </VuiTypography>
            <VuiBox mt={1.6} sx={{ maxWidth: 340 }}>
              <VuiBox display="flex" justifyContent="space-between" mb={0.6}>
                <VuiTypography
                  variant="caption"
                  sx={{ color: darkMode ? 'rgba(255,255,255,0.9)' : 'rgba(15,23,42,0.9)', fontWeight: 700 }}
                >
                  Level {playerProgress.level}
                </VuiTypography>
                <VuiTypography variant="caption" sx={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(51,65,85,0.8)' }}>
                  {playerProgress.xpIntoLevel}/{playerProgress.xpForNextLevel} XP
                </VuiTypography>
              </VuiBox>
              <VuiProgress value={playerProgress.progressPercent} color="info" sx={{ height: '8px' }} aria-label={`Level ${playerProgress.level} progress: ${playerProgress.xpIntoLevel} of ${playerProgress.xpForNextLevel} XP`} />
            </VuiBox>
          </VuiBox>
          <VuiBox display="flex" gap={2} flexWrap="wrap">
            {isAdmin && (
              <>
            <VuiButton
              onClick={() => setOpenAiModal(true)}
              sx={{
                background: 'linear-gradient(135deg, #00c7ff 0%, #ff8f3f 100%)',
                fontWeight: 'bold',
                fontSize: '0.95rem',
                padding: '12px 24px',
                boxShadow: '0px 7px 22px rgba(0, 136, 255, 0.36)',
                border: '1px solid rgba(78, 201, 240, 0.45)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(135deg, #25d2ff 0%, #ff9d57 100%)',
                  boxShadow: '0px 10px 30px rgba(0, 180, 255, 0.38)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <IoFlash size="20px" style={{ marginRight: '8px' }} />
              Gen with AI
            </VuiButton>
            <VuiButton
              color="info"
              onClick={() => setOpenModal(true)}
              sx={{
                background: 'linear-gradient(135deg, #0075FF 0%, #4318FF 100%)',
                fontSize: '0.95rem',
                padding: '12px 24px',
                boxShadow: '0px 5px 20px rgba(157, 78, 221, 0.4)',
                border: '1px solid rgba(157, 78, 221, 0.45)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(135deg, #B565F5 0%, #5A189A 100%)',
                  boxShadow: '0px 7px 25px rgba(157, 78, 221, 0.5)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <IoAdd size="20px" style={{ marginRight: '8px' }} />
              Generate
            </VuiButton>
            <VuiButton
              color="error"
              onClick={() => { setDeleteMode(!deleteMode); setEditMode(false); }}
              sx={{
                background: deleteMode 
                  ? 'linear-gradient(135deg, #FF0000 0%, #FF4444 100%)' 
                  : 'linear-gradient(135deg, #FF4444 0%, #CC0000 100%)',
                fontWeight: 'bold',
                fontSize: '0.95rem',
                padding: '12px 24px',
                boxShadow: '0px 5px 20px rgba(255, 68, 68, 0.4)',
                border: deleteMode ? '2px solid #FF0000' : '2px solid rgba(255, 68, 68, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #FF5555 0%, #DD1111 100%)',
                  boxShadow: '0px 7px 25px rgba(255, 68, 68, 0.5)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <IoTrash size="20px" style={{ marginRight: '8px' }} />
              {deleteMode ? 'Cancel Delete' : 'Delete'}
            </VuiButton>
            <VuiButton
              color="warning"
              onClick={() => { setEditMode(!editMode); setDeleteMode(false); }}
              sx={{
                background: editMode 
                  ? 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)' 
                  : 'linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)',
                fontWeight: 'bold',
                fontSize: '0.95rem',
                padding: '12px 24px',
                boxShadow: '0px 5px 20px rgba(255, 152, 0, 0.4)',
                border: editMode ? '2px solid #FF9800' : '2px solid rgba(255, 152, 0, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #FFC107 0%, #FFA000 100%)',
                  boxShadow: '0px 7px 25px rgba(255, 152, 0, 0.5)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <IoCreate size="20px" style={{ marginRight: '8px' }} />
              {editMode ? 'Cancel Edit' : 'Edit'}
            </VuiButton>
              </>
            )}
          </VuiBox>
        </VuiBox>

        {/* Create/Edit Challenge Modal */}
        <Modal open={openModal} onClose={handleCloseModal}>
          <VuiBox sx={getModalStyle(!darkMode)}>
            <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <VuiTypography variant="h4" color="white" fontWeight="bold">
                {editingChallengeId ? 'Edit Challenge' : 'Create New Challenge'}
              </VuiTypography>
              <VuiButton
                color="error"
                variant="outlined"
                onClick={handleCloseModal}
                sx={{ minWidth: 'auto', padding: '8px' }}
              >
                <IoClose size="24px" />
              </VuiButton>
            </VuiBox>

            <Grid container spacing={2}>
              {/* Title */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={newChallenge.title}
                  onChange={(e) => updateNewChallenge('title', e.target.value)}
                  sx={getInputStyle(!darkMode)}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  value={newChallenge.description}
                  onChange={(e) => updateNewChallenge('description', e.target.value)}
                    sx={getInputStyle(!darkMode)}
                />
              </Grid>

              {/* Difficulty */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <VuiTypography variant="caption" color="text" mb={1}>Difficulty</VuiTypography>
                  <DarkSelect
                    value={newChallenge.difficulty}
                    onChange={(e) => updateNewChallenge('difficulty', e.target.value)}
                    MenuProps={darkMenuProps}
                  >
                    <MenuItem value="easy" sx={filterMenuItemSx}>Easy</MenuItem>
                    <MenuItem value="medium" sx={filterMenuItemSx}>Medium</MenuItem>
                    <MenuItem value="hard" sx={filterMenuItemSx}>Hard</MenuItem>
                    <MenuItem value="expert" sx={filterMenuItemSx}>Expert</MenuItem>
                  </DarkSelect>
                </FormControl>
              </Grid>

              {/* Category */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <VuiTypography variant="caption" color="text" mb={1}>Category</VuiTypography>
                  <DarkSelect
                    value={newChallenge.categories[0]}
                    onChange={(e) => updateNewChallenge('categories', [e.target.value])}
                    MenuProps={darkMenuProps}
                  >
                    <MenuItem value="algorithms" sx={filterMenuItemSx}>Algorithms</MenuItem>
                    <MenuItem value="arrays" sx={filterMenuItemSx}>Arrays</MenuItem>
                    <MenuItem value="strings" sx={filterMenuItemSx}>Strings</MenuItem>
                    <MenuItem value="trees" sx={filterMenuItemSx}>Trees</MenuItem>
                    <MenuItem value="graphs" sx={filterMenuItemSx}>Graphs</MenuItem>
                    <MenuItem value="dynamic_programming" sx={filterMenuItemSx}>Dynamic Programming</MenuItem>
                    <MenuItem value="sorting" sx={filterMenuItemSx}>Sorting</MenuItem>
                    <MenuItem value="searching" sx={filterMenuItemSx}>Searching</MenuItem>
                    <MenuItem value="data_structures" sx={filterMenuItemSx}>Data Structures</MenuItem>
                  </DarkSelect>
                </FormControl>
              </Grid>

              {/* Constraints */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Constraints"
                  multiline
                  rows={2}
                  value={newChallenge.constraints}
                  onChange={(e) => updateNewChallenge('constraints', e.target.value)}
                  sx={getInputStyle(!darkMode)}
                />
              </Grid>

              {/* Test Cases */}
              <Grid item xs={12}>
                <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <VuiTypography variant="button" color="white" fontWeight="bold">
                    Test Cases
                  </VuiTypography>
                  <VuiButton color="info" size="small" onClick={addTestCase}>
                    + Add Test Case
                  </VuiButton>
                </VuiBox>
                {newChallenge.testCases.map((tc, idx) => (
                  <VuiBox key={idx} mb={2} p={2} sx={{ background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={5}>
                        <TextField
                          fullWidth
                          label={`Input ${idx + 1}`}
                          value={tc.input}
                          onChange={(e) => updateTestCase(idx, 'input', e.target.value)}
                          sx={getInputStyle(!darkMode)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={5}>
                        <TextField
                          fullWidth
                          label={`Expected Output ${idx + 1}`}
                          value={tc.expectedOutput}
                          onChange={(e) => updateTestCase(idx, 'expectedOutput', e.target.value)}
                          sx={getInputStyle(!darkMode)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <VuiBox display="flex" alignItems="center" height="100%">
                          <label style={{ color: darkMode ? '#e0e7ff' : '#1a202c', fontSize: '0.8rem', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={tc.isHidden}
                              onChange={(e) => updateTestCase(idx, 'isHidden', e.target.checked)}
                              style={{ marginRight: '5px' }}
                            />
                            Hidden
                          </label>
                        </VuiBox>
                      </Grid>
                    </Grid>
                  </VuiBox>
                ))}
              </Grid>

              {/* Tags */}
              <Grid item xs={12}>
                <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <VuiTypography variant="button" color="white" fontWeight="bold">
                    Tags
                  </VuiTypography>
                  <VuiButton color="info" size="small" onClick={addTag}>
                    + Add Tag
                  </VuiButton>
                </VuiBox>
                <VuiBox display="flex" gap={1} flexWrap="wrap">
                  {newChallenge.tags.map((tag, idx) => (
                    <TextField
                      key={idx}
                      size="small"
                      placeholder={`Tag ${idx + 1}`}
                      value={tag}
                      onChange={(e) => updateTag(idx, e.target.value)}
                      sx={{ ...getInputStyle(!darkMode), width: '150px', mb: 0 }}
                    />
                  ))}
                </VuiBox>
              </Grid>

              {/* Hints */}
              <Grid item xs={12}>
                <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <VuiTypography variant="button" color="white" fontWeight="bold">
                    Hints
                  </VuiTypography>
                  <VuiButton color="info" size="small" onClick={addHint}>
                    + Add Hint
                  </VuiButton>
                </VuiBox>
                {newChallenge.hints.map((hint, idx) => (
                  <TextField
                    key={idx}
                    fullWidth
                    size="small"
                    placeholder={`Hint ${idx + 1}`}
                    value={hint}
                    onChange={(e) => updateHint(idx, e.target.value)}
                    sx={getInputStyle(!darkMode)}
                  />
                ))}
              </Grid>

              {/* Starter Code */}
              <Grid item xs={12}>
                <VuiTypography variant="button" color="white" fontWeight="bold" mb={1}>
                  Starter Code (JavaScript)
                </VuiTypography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={newChallenge.starterCode[0]?.code || ''}
                  onChange={(e) => setNewChallenge(prev => ({
                    ...prev,
                    starterCode: [{ language: 'javascript', code: e.target.value }]
                  }))}
                  sx={{ ...getInputStyle(!darkMode), fontFamily: 'monospace' }}
                />
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <VuiBox display="flex" justifyContent="flex-end" gap={2} mt={2}>
                  <VuiButton
                    color="error"
                    variant="outlined"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </VuiButton>
                  <VuiButton
                    color="success"
                    onClick={editingChallengeId ? handleUpdateChallenge : handleCreateChallenge}
                    disabled={creating || !newChallenge.title || !newChallenge.description}
                    sx={{
                      background: 'linear-gradient(135deg, #00dd00 0%, #00aa00 100%)',
                      '&:disabled': { opacity: 0.5 },
                    }}
                  >
                    {creating ? (editingChallengeId ? 'Updating...' : 'Creating...') : (editingChallengeId ? 'Update Challenge' : 'Create Challenge')}
                  </VuiButton>
                </VuiBox>
              </Grid>
            </Grid>
          </VuiBox>
        </Modal>

        {/* ── AI Generation Modal ───────────────────────────── */}
        <Modal open={openAiModal} onClose={() => { if (!aiGenerating) { setOpenAiModal(false); setAiError(null); setAiSuccess(null); } }}>
          <VuiBox sx={getAiModalStyle(!darkMode)}>
            {/* Header */}
            <VuiBox display="flex" justifyContent="space-between" alignItems="flex-start" mb={2.5}>
              <VuiBox display="flex" alignItems="flex-start" gap={1.2}>
                <VuiBox
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: '12px',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'linear-gradient(145deg, rgba(0, 199, 255, 0.22), rgba(255, 143, 63, 0.22))',
                    border: '1px solid rgba(78, 201, 240, 0.35)',
                  }}
                >
                  <IoFlash size="22px" color="#4ec9f0" />
                </VuiBox>
                <VuiBox>
                  <VuiTypography variant="h4" color="white" fontWeight="bold">
                  Generate with AI
                  </VuiTypography>
                  <VuiTypography variant="caption" sx={{ color: 'rgba(189, 212, 245, 0.75)', letterSpacing: '0.04em' }}>
                    SMART CHALLENGE DESIGNER
                  </VuiTypography>
                </VuiBox>
              </VuiBox>
              <VuiButton
                variant="outlined"
                onClick={() => { setOpenAiModal(false); setAiError(null); setAiSuccess(null); }}
                disabled={aiGenerating}
                sx={{
                  minWidth: 'auto',
                  width: 42,
                  height: 42,
                  padding: 0,
                  borderRadius: '12px',
                  borderColor: 'rgba(158, 187, 233, 0.4)',
                  color: 'rgba(223, 234, 252, 0.95)',
                  background: 'rgba(12, 22, 48, 0.65)',
                  '&:hover': { borderColor: 'rgba(78, 201, 240, 0.7)', background: 'rgba(16, 28, 62, 0.92)' },
                }}
              >
                <IoClose size="24px" />
              </VuiButton>
            </VuiBox>

            <VuiTypography variant="body2" sx={{ color: 'rgba(205, 220, 247, 0.84)' }} mb={3}>
              Describe what you want and the AI will generate a complete challenge with test cases.
            </VuiTypography>

            <Grid container spacing={2.2}>
              {/* Difficulty */}
              <Grid item xs={12} md={6}>
                <VuiTypography variant="caption" sx={{ color: 'rgba(189, 212, 245, 0.86)', fontWeight: 600 }} mb={1} display="block">Difficulty *</VuiTypography>
                <DarkSelect
                  value={aiParams.difficulty}
                  onChange={(e) => setAiParams(p => ({ ...p, difficulty: e.target.value }))}
                  MenuProps={darkMenuProps}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(126, 163, 216, 0.35) !important' },
                    '& .MuiOutlinedInput-root': { background: 'rgba(8, 20, 48, 0.72)' },
                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4ec9f0 !important' },
                  }}
                >
                  <MenuItem value="easy">Easy</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="hard">Hard</MenuItem>
                </DarkSelect>
              </Grid>

              {/* Topic */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Topic (optional)"
                  placeholder="e.g. binary search, graphs"
                  value={aiParams.topic}
                  onChange={(e) => setAiParams(p => ({ ...p, topic: e.target.value }))}
                  disabled={aiGenerating}
                  InputLabelProps={{ shrink: true }}
                  sx={getAiInputStyle(!darkMode)}
                />
              </Grid>

              {/* Tags */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tags (optional, comma-separated)"
                  placeholder="e.g. array, sorting, greedy"
                  value={aiParams.tags}
                  onChange={(e) => setAiParams(p => ({ ...p, tags: e.target.value }))}
                  disabled={aiGenerating}
                  InputLabelProps={{ shrink: true }}
                  sx={getAiInputStyle(!darkMode)}
                />
              </Grid>

              {/* Languages */}
              <Grid item xs={12}>
                <VuiTypography variant="caption" sx={{ color: 'rgba(189, 212, 245, 0.86)', fontWeight: 600 }} mb={1} display="block">Supported Languages *</VuiTypography>
                <VuiBox display="flex" flexWrap="wrap" gap={1}>
                  {['python', 'javascript', 'typescript', 'java', 'c', 'cpp', 'go', 'rust'].map(lang => {
                    const selected = aiParams.supportedLanguages.includes(lang);
                    return (
                      <VuiBox
                        key={lang}
                        onClick={() => !aiGenerating && toggleAiLanguage(lang)}
                        sx={{
                          padding: '7px 16px',
                          borderRadius: '999px',
                          cursor: aiGenerating ? 'default' : 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          letterSpacing: '0.02em',
                          textTransform: 'capitalize',
                          color: selected ? '#06112d' : 'rgba(188, 209, 245, 0.8)',
                          background: selected
                            ? 'linear-gradient(135deg, #43d4ff 0%, #ffbc6e 100%)'
                            : 'rgba(14, 28, 62, 0.7)',
                          border: `1px solid ${selected ? 'rgba(78, 201, 240, 0.45)' : 'rgba(145, 173, 220, 0.25)'}`,
                          boxShadow: selected ? '0 6px 20px rgba(67, 212, 255, 0.25)' : 'none',
                          transition: 'all 0.2s ease',
                          userSelect: 'none',
                          '&:hover': {
                            transform: aiGenerating ? 'none' : 'translateY(-1px)',
                            borderColor: 'rgba(78, 201, 240, 0.62)',
                          },
                        }}
                      >
                        {lang}
                      </VuiBox>
                    );
                  })}
                </VuiBox>
              </Grid>

              {/* Error / Success */}
              {aiError && (
                <Grid item xs={12}>
                  <VuiBox sx={{ background: 'rgba(255,50,50,0.15)', border: '1px solid rgba(255,50,50,0.4)', borderRadius: '10px', padding: '12px 16px' }}>
                    <VuiTypography variant="caption" color="error">{aiError}</VuiTypography>
                  </VuiBox>
                </Grid>
              )}
              {aiSuccess && (
                <Grid item xs={12}>
                  <VuiBox sx={{ background: 'rgba(0,200,80,0.15)', border: '1px solid rgba(0,200,80,0.4)', borderRadius: '10px', padding: '12px 16px' }}>
                    <VuiTypography variant="caption" sx={{ color: '#00cc50' }}>{aiSuccess}</VuiTypography>
                  </VuiBox>
                </Grid>
              )}

              {/* Generate button */}
              <Grid item xs={12}>
                <VuiButton
                  fullWidth
                  disabled={aiGenerating || aiParams.supportedLanguages.length === 0}
                  onClick={handleGenerateAI}
                  sx={{
                    background: 'linear-gradient(135deg, #00c7ff 0%, #ff8f3f 100%)',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    padding: '14px',
                    color: '#06112d',
                    boxShadow: '0 10px 28px rgba(0, 165, 235, 0.28)',
                    '&:hover': { background: 'linear-gradient(135deg, #1dd1ff 0%, #ffa45b 100%)', transform: 'translateY(-1px)' },
                    '&:disabled': { opacity: 0.5 },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {aiGenerating ? (
                    <VuiBox display="flex" alignItems="center" gap={1}>
                      <CircularProgress aria-label="Generating challenge with AI" size={18} sx={{ color: '#06112d' }} />
                      Generating… this may take 10–30s
                    </VuiBox>
                  ) : (
                    <VuiBox display="flex" alignItems="center" gap={1}>
                      <IoFlash size="20px" /> Generate Challenge
                    </VuiBox>
                  )}
                </VuiButton>
              </Grid>
            </Grid>
          </VuiBox>
        </Modal>

        {/* ML Generation Modal */}
        <Modal open={openMlModal} onClose={() => { if (!mlGenerating) { setOpenMlModal(false); setMlError(null); setMlSuccess(null); } }}>
          <VuiBox sx={getAiModalStyle(!darkMode)}>
            {/* Header */}
            <VuiBox display="flex" justifyContent="space-between" alignItems="flex-start" mb={2.5}>
              <VuiBox display="flex" alignItems="flex-start" gap={1.2}>
                <VuiBox
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: '12px',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'linear-gradient(145deg, rgba(157, 78, 221, 0.22), rgba(58, 12, 163, 0.22))',
                    border: '1px solid rgba(157, 78, 221, 0.35)',
                  }}
                >
                  <IoFlash size="22px" color="#9D4EDD" />
                </VuiBox>
                <VuiBox>
                  <VuiTypography variant="h4" color="white" fontWeight="bold">
                    Generate with ML
                  </VuiTypography>
                  <VuiTypography variant="caption" sx={{ color: 'rgba(189, 212, 245, 0.75)', letterSpacing: '0.04em' }}>
                    MACHINE LEARNING DESIGNER
                  </VuiTypography>
                </VuiBox>
              </VuiBox>
              <VuiButton
                variant="outlined"
                onClick={() => { setOpenMlModal(false); setMlError(null); setMlSuccess(null); }}
                disabled={mlGenerating}
                sx={{
                  minWidth: 'auto',
                  width: 42,
                  height: 42,
                  padding: 0,
                  borderRadius: '12px',
                  borderColor: 'rgba(158, 187, 233, 0.4)',
                  color: 'rgba(223, 234, 252, 0.95)',
                  background: 'rgba(12, 22, 48, 0.65)',
                  '&:hover': { borderColor: 'rgba(157, 78, 221, 0.7)', background: 'rgba(16, 28, 62, 0.92)' },
                }}
              >
                <IoClose size="24px" />
              </VuiButton>
            </VuiBox>

            <VuiTypography variant="body2" sx={{ color: 'rgba(205, 220, 247, 0.84)' }} mb={3}>
              Select difficulty and programming language to generate a challenge.
            </VuiTypography>

            <Grid container spacing={2.2}>
              {/* Difficulty */}
              <Grid item xs={12}>
                <VuiTypography variant="caption" sx={{ color: 'rgba(189, 212, 245, 0.86)', fontWeight: 600 }} mb={1} display="block">Difficulty *</VuiTypography>
                <DarkSelect
                  value={mlParams.difficulty}
                  onChange={(e) => setMlParams(p => ({ ...p, difficulty: e.target.value }))}
                  MenuProps={darkMenuProps}
                  fullWidth
                  disabled={mlGenerating}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(157, 78, 221, 0.35) !important' },
                    '& .MuiOutlinedInput-root': { background: 'rgba(157, 78, 221, 0.08)' },
                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#9D4EDD !important' },
                  }}
                >
                  <MenuItem value="easy">Easy</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="hard">Hard</MenuItem>
                  <MenuItem value="expert">Expert</MenuItem>
                </DarkSelect>
              </Grid>

              {/* Language */}
              <Grid item xs={12}>
                <VuiTypography variant="caption" sx={{ color: 'rgba(189, 212, 245, 0.86)', fontWeight: 600 }} mb={1} display="block">Programming Language *</VuiTypography>
                <DarkSelect
                  value={mlParams.language}
                  onChange={(e) => setMlParams(p => ({ ...p, language: e.target.value }))}
                  MenuProps={darkMenuProps}
                  fullWidth
                  disabled={mlGenerating}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(157, 78, 221, 0.35) !important' },
                    '& .MuiOutlinedInput-root': { background: 'rgba(157, 78, 221, 0.08)' },
                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#9D4EDD !important' },
                  }}
                >
                  <MenuItem value="javascript">JavaScript</MenuItem>
                  <MenuItem value="python">Python</MenuItem>
                  <MenuItem value="typescript">TypeScript</MenuItem>
                  <MenuItem value="java">Java</MenuItem>
                  <MenuItem value="cpp">C++</MenuItem>
                  <MenuItem value="c">C</MenuItem>
                  <MenuItem value="go">Go</MenuItem>
                  <MenuItem value="rust">Rust</MenuItem>
                </DarkSelect>
              </Grid>

              {/* Error / Success */}
              {mlError && (
                <Grid item xs={12}>
                  <VuiBox sx={{ background: 'rgba(255,50,50,0.15)', border: '1px solid rgba(255,50,50,0.4)', borderRadius: '10px', padding: '12px 16px' }}>
                    <VuiTypography variant="caption" color="error">{mlError}</VuiTypography>
                  </VuiBox>
                </Grid>
              )}
              {mlSuccess && (
                <Grid item xs={12}>
                  <VuiBox sx={{ background: 'rgba(0,200,80,0.15)', border: '1px solid rgba(0,200,80,0.4)', borderRadius: '10px', padding: '12px 16px' }}>
                    <VuiTypography variant="caption" sx={{ color: '#00cc50' }}>{mlSuccess}</VuiTypography>
                  </VuiBox>
                </Grid>
              )}

              {/* Generate button */}
              <Grid item xs={12}>
                <VuiButton
                  fullWidth
                  disabled={mlGenerating}
                  onClick={async () => {
                    setMlGenerating(true);
                    setMlError(null);
                    setMlSuccess(null);
                    try {
                      const generated = await mlGenerationService.generateChallenge(mlParams.difficulty, mlParams.language);
                      setMlSuccess(`✅ Challenge "${generated.title}" generated successfully!`);
                      fetchChallenges(); // Refresh the challenges list
                      setTimeout(() => {
                        setOpenMlModal(false);
                        setMlSuccess(null);
                        setMlParams({ difficulty: 'medium', language: 'javascript' });
                      }, 2000);
                    } catch (err) {
                      const errorMsg = err.response?.data?.message || err.message || 'Generation failed. Please try again.';
                      setMlError(errorMsg);
                    } finally {
                      setMlGenerating(false);
                    }
                  }}
                  sx={{
                    background: 'linear-gradient(135deg, #9D4EDD 0%, #3A0CA3 100%)',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    padding: '14px',
                    color: '#fff',
                    boxShadow: '0 10px 28px rgba(157, 78, 221, 0.28)',
                    '&:hover': { background: 'linear-gradient(135deg, #B565F5 0%, #5A189A 100%)', transform: 'translateY(-1px)' },
                    '&:disabled': { opacity: 0.5 },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {mlGenerating ? (
                    <VuiBox display="flex" alignItems="center" gap={1}>
                      <CircularProgress aria-label="Generating challenge with ML" size={18} sx={{ color: '#fff' }} />
                      Generating… this may take 10–30s
                    </VuiBox>
                  ) : (
                    <VuiBox display="flex" alignItems="center" gap={1}>
                      <IoFlash size="20px" /> Generate Challenge
                    </VuiBox>
                  )}
                </VuiButton>
              </Grid>
            </Grid>
          </VuiBox>
        </Modal>

        {/* Filters */}
        <Card
          sx={{
            background: filterCardBg,
            backdropFilter: "blur(42px)",
            border: filterCardBorder,
            marginBottom: "30px",
            borderRadius: "20px",
            pointerEvents: "auto",
          }}
        >
          <VuiBox p={3} sx={{ pointerEvents: "auto" }}>
            <Grid container spacing={2} alignItems="center" sx={{ pointerEvents: "auto" }}>
              {/* Search */}
              <Grid item xs={12} md={5} sx={{ pointerEvents: "auto" }}>
                <VuiBox display="flex" alignItems="center" sx={{ position: "relative", pointerEvents: "auto" }}>
                  <IoSearchSharp
                    size="20px"
                    color={darkMode ? "#7A8AA3" : "#64748b"}
                    style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", zIndex: 1, pointerEvents: "none" }}
                  />
                  <VuiInput
                    placeholder="Search challenges..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ 
                      width: "100%",
                      "& .MuiInputBase-root": {
                        background: darkMode ? "rgba(14, 21, 58, 0.5) !important" : "#ffffff !important",
                        border: darkMode
                          ? "1px solid rgba(255, 255, 255, 0.1) !important"
                          : "1px solid rgba(148, 163, 184, 0.35) !important",
                        borderRadius: "12px !important",
                        height: "45px",
                        "&:hover": {
                          border: darkMode
                            ? "1px solid rgba(255, 255, 255, 0.2) !important"
                            : "1px solid rgba(148, 163, 184, 0.6) !important",
                        },
                        "&.Mui-focused": {
                          border: "1px solid rgba(0, 117, 255, 0.5) !important",
                        }
                      },
                      "& .MuiInputBase-input": {
                        padding: "0 14px 0 44px !important",
                        height: "45px",
                        boxSizing: "border-box",
                        lineHeight: "45px",
                      },
                      "& input": { 
                        color: darkMode ? "white !important" : "#1a202c !important",
                        "&::placeholder": {
                          color: darkMode ? "#7A8AA3 !important" : "#64748b !important",
                          opacity: 1
                        }
                      }
                    }}
                  />
                </VuiBox>
              </Grid>

              {/* Difficulty Filter */}
              <Grid item xs={12} sm={6} md={3} sx={{ pointerEvents: "auto" }}>
                <FormControl fullWidth variant="outlined" sx={{ pointerEvents: "auto" }} onClick={() => setDifficultyOpen(!difficultyOpen)}>
                  <DarkSelect
                    open={difficultyOpen}
                    onOpen={() => setDifficultyOpen(true)}
                    onClose={() => setDifficultyOpen(false)}
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    MenuProps={darkMenuProps}
                    displayEmpty
                    variant="outlined"
                    inputProps={{ "aria-label": "Filter challenges by difficulty" }}
                    sx={{ pointerEvents: "auto" }}
                  >
                    <MenuItem value="all" sx={filterMenuItemSx}>All Difficulties</MenuItem>
                    <MenuItem value="easy" sx={filterMenuItemSx}>Easy</MenuItem>
                    <MenuItem value="medium" sx={filterMenuItemSx}>Medium</MenuItem>
                    <MenuItem value="hard" sx={filterMenuItemSx}>Hard</MenuItem>
                    <MenuItem value="expert" sx={filterMenuItemSx}>Expert</MenuItem>
                  </DarkSelect>
                </FormControl>
              </Grid>

              {/* Category Filter */}
              <Grid item xs={12} sm={6} md={4} sx={{ pointerEvents: "auto" }}>
                <FormControl fullWidth variant="outlined" sx={{ pointerEvents: "auto" }} onClick={() => setCategoryOpen(!categoryOpen)}>
                  <DarkSelect
                    open={categoryOpen}
                    onOpen={() => setCategoryOpen(true)}
                    onClose={() => setCategoryOpen(false)}
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    MenuProps={darkMenuProps}
                    displayEmpty
                    variant="outlined"
                    inputProps={{ "aria-label": "Filter challenges by category" }}
                    sx={{ pointerEvents: "auto" }}
                  >
                    <MenuItem value="all" sx={filterMenuItemSx}>All Categories</MenuItem>
                    <MenuItem value="arrays" sx={filterMenuItemSx}>Arrays</MenuItem>
                    <MenuItem value="trees" sx={filterMenuItemSx}>Trees</MenuItem>
                    <MenuItem value="graphs" sx={filterMenuItemSx}>Graphs</MenuItem>
                    <MenuItem value="dynamic_programming" sx={filterMenuItemSx}>Dynamic Programming</MenuItem>
                    <MenuItem value="strings" sx={filterMenuItemSx}>Strings</MenuItem>
                    <MenuItem value="algorithms" sx={filterMenuItemSx}>Algorithms</MenuItem>
                    <MenuItem value="data_structures" sx={filterMenuItemSx}>Data Structures</MenuItem>
                    <MenuItem value="sorting" sx={filterMenuItemSx}>Sorting</MenuItem>
                    <MenuItem value="searching" sx={filterMenuItemSx}>Searching</MenuItem>
                  </DarkSelect>
                </FormControl>
              </Grid>
            </Grid>
          </VuiBox>
        </Card>

        {/* Results Count */}
        <VuiBox mb={3} mt={2}>
          <VuiTypography variant="button" color={pageTextColor} fontWeight="regular">
            Showing {challenges.length} of {total} challenges
          </VuiTypography>
        </VuiBox>

        {/* Loading State */}
        {loading && (
          <VuiBox display="flex" justifyContent="center" alignItems="center" py={10}>
            <CircularProgress aria-label="Loading challenges" sx={{ color: '#0075FF' }} />
          </VuiBox>
        )}

        {/* Error State */}
        {error && !loading && (
          <VuiBox textAlign="center" py={5}>
            <VuiTypography variant="h5" color="error" mb={2}>
              {error}
            </VuiTypography>
            <VuiTypography 
              variant="button" 
              color="info" 
              sx={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={fetchChallenges}
            >
              Try again
            </VuiTypography>
          </VuiBox>
        )}

        {/* Challenge Grid */}
        {!loading && !error && (
          <>
            <Grid container spacing={3}>
              {displayedChallenges.map((challenge) => (
                <Grid item xs={12} md={6} lg={4} key={challenge._id}>
                  <VuiBox position="relative">
                    <ChallengeCard
                      title={challenge.title}
                      difficulty={challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                      points={progressTrackerService.getChallengeXpByDifficulty(challenge.difficulty)}
                      category={challengeService.formatCategoryName(challenge.categories[0] || 'general')}
                      solvedCount={challenge.successfulSubmissions}
                      totalAttempts={challenge.totalSubmissions}
                      activeTickets={
                        isAdmin ? (activeTicketCountByChallenge[challenge._id] || 0) : undefined
                      }
                      description={challenge.description.substring(0, 150) + (challenge.description.length > 150 ? '...' : '')}
                      tags={challenge.tags.slice(0, 3)}
                      isSolved={solvedChallengeIds.includes(challenge._id)}
                      onStart={() => handleStartChallenge(challenge._id)}
                    />
                    {deleteMode && (
                      <VuiBox
                        position="absolute"
                        top={10}
                        right={10}
                        zIndex={10}
                      >
                        <VuiButton
                          color="error"
                          size="small"
                          onClick={(e) => handleDeleteChallenge(challenge._id, e)}
                          sx={{
                            minWidth: 'auto',
                            padding: '8px 12px',
                            background: 'linear-gradient(135deg, #FF4444 0%, #CC0000 100%)',
                            boxShadow: '0px 4px 15px rgba(255, 68, 68, 0.6)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #FF5555 0%, #DD1111 100%)',
                              transform: 'scale(1.1)',
                            },
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <IoTrash size="18px" />
                        </VuiButton>
                      </VuiBox>
                    )}
                    {editMode && (
                      <VuiBox
                        position="absolute"
                        top={10}
                        right={10}
                        zIndex={10}
                      >
                        <VuiButton
                          color="warning"
                          size="small"
                          onClick={(e) => handleEditChallenge(challenge, e)}
                          sx={{
                            minWidth: 'auto',
                            padding: '8px 12px',
                            background: 'linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)',
                            boxShadow: '0px 4px 15px rgba(255, 152, 0, 0.6)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #FFC107 0%, #FFA000 100%)',
                              transform: 'scale(1.1)',
                            },
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <IoCreate size="18px" />
                        </VuiButton>
                      </VuiBox>
                    )}
                  </VuiBox>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <VuiBox display="flex" justifyContent="center" mt={4}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: 'white',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '& .MuiPaginationItem-root.Mui-selected': {
                      backgroundColor: '#0075FF',
                      color: 'white',
                    },
                    '& .MuiPaginationItem-root:hover': {
                      backgroundColor: 'rgba(0, 117, 255, 0.2)',
                    },
                  }}
                />
              </VuiBox>
            )}

            {challenges.length === 0 && (
              <VuiBox textAlign="center" py={5}>
                <VuiTypography variant="h5" color="text">
                  No challenges found matching your criteria
                </VuiTypography>
              </VuiBox>
            )}
          </>
        )}
      </VuiBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Challenges;
