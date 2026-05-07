import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Battle {
  id: string;
  title: string;
  challengeId: string;
  participants: string[];
  status: 'waiting' | 'active' | 'completed';
  startTime?: string;
  endTime?: string;
  winner?: string;
}

interface BattleState {
  currentBattle: Battle | null;
  battles: Battle[];
  connected: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: BattleState = {
  currentBattle: null,
  battles: [],
  connected: false,
  loading: false,
  error: null,
};

const battleSlice = createSlice({
  name: 'battle',
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
    },
    setCurrentBattle: (state, action: PayloadAction<Battle>) => {
      state.currentBattle = action.payload;
    },
    setBattles: (state, action: PayloadAction<Battle[]>) => {
      state.battles = action.payload;
    },
    addBattle: (state, action: PayloadAction<Battle>) => {
      state.battles.push(action.payload);
    },
    updateBattle: (state, action: PayloadAction<Battle>) => {
      const index = state.battles.findIndex(b => b.id === action.payload.id);
      if (index !== -1) {
        state.battles[index] = action.payload;
      }
      if (state.currentBattle?.id === action.payload.id) {
        state.currentBattle = action.payload;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearBattle: (state) => {
      state.currentBattle = null;
    },
  },
});

export const {
  setConnected,
  setCurrentBattle,
  setBattles,
  addBattle,
  updateBattle,
  setLoading,
  setError,
  clearBattle,
} = battleSlice.actions;

export default battleSlice.reducer;
