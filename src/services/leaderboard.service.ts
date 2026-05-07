import apiClient from './api.js';

export interface LeaderboardUser {
  _id?: string;
  id?: string;
  username: string;
  email?: string;
  profile?: {
    avatar?: string;
  };
  providerAvatar?: string;
  statistics?: {
    xp?: number;
    totalPoints?: number;
    challengesCompleted?: number;
    currentStreak?: number;
  };
}

export const leaderboardService = {
  getLeaderboard: async (limit: number = 50): Promise<LeaderboardUser[]> => {
    const response = await apiClient.get(`/users/leaderboard?limit=${limit}`);
    return response.data;
  },
};

export default leaderboardService;
