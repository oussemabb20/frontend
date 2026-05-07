import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  category: string;
  testCases?: TestCase[];
  timeLimit?: number;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

interface ChallengeState {
  challenges: Challenge[];
  currentChallenge: Challenge | null;
  userCode: string;
  loading: boolean;
  error: string | null;
}

const initialState: ChallengeState = {
  challenges: [],
  currentChallenge: null,
  userCode: '',
  loading: false,
  error: null,
};

const challengeSlice = createSlice({
  name: 'challenge',
  initialState,
  reducers: {
    setChallenges: (state, action: PayloadAction<Challenge[]>) => {
      state.challenges = action.payload;
    },
    setCurrentChallenge: (state, action: PayloadAction<Challenge>) => {
      state.currentChallenge = action.payload;
    },
    setUserCode: (state, action: PayloadAction<string>) => {
      state.userCode = action.payload;
    },
    addChallenge: (state, action: PayloadAction<Challenge>) => {
      state.challenges.push(action.payload);
    },
    updateChallenge: (state, action: PayloadAction<Challenge>) => {
      const index = state.challenges.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.challenges[index] = action.payload;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearCurrentChallenge: (state) => {
      state.currentChallenge = null;
      state.userCode = '';
    },
  },
});

export const {
  setChallenges,
  setCurrentChallenge,
  setUserCode,
  addChallenge,
  updateChallenge,
  setLoading,
  setError,
  clearCurrentChallenge,
} = challengeSlice.actions;

export default challengeSlice.reducer;
