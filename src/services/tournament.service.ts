import apiClient from './api.js';

export interface TournamentMatch {
  matchKey: string;
  label: string;
  round: string;
  roundIndex: number;
  matchIndex: number;
  challengeId?: string;
  challengeTitle?: string;
  players: Array<{
    userId: string;
    username: string;
    slot?: number;
  }>;
  readyUsers: string[];
  status: 'pending' | 'ready' | 'active' | 'completed' | 'forfeited' | 'bye';
  battleId?: string;
  winnerUserId?: string;
  winnerUsername?: string;
  completedAt?: Date;
  availableAt?: Date;
  readyDeadlineAt?: Date;
}

export interface Tournament {
  _id: string;
  name: string;
  startAt: string;
  maxParticipants: number;
  matchDurationMinutes: number;
  noShowWaitMinutes: number;
  roundBreakMinutes: number;
  winnerXp: number;
  winnerBadge: string;
  registeredUsers: string[];
  registeredPlayers: Array<{
    userId: string;
    username: string;
    registeredAt: Date;
  }>;
  matches: TournamentMatch[];
  matchAssignments?: Array<{
    matchKey: string;
    round: string;
    label: string;
    challengeId: string;
    challengeTitle: string;
  }>;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTournamentData {
  name: string;
  startAt: string;
  maxParticipants: number;
  matchDurationMinutes: number;
  noShowWaitMinutes: number;
  roundBreakMinutes: number;
  winnerXp: number;
  winnerBadge: string;
  matchAssignments?: Array<{
    matchKey: string;
    round: string;
    label: string;
    challengeId: string;
    challengeTitle: string;
  }>;
}

export const tournamentService = {
  // Create a new tournament via API
  createTournament: async (data: CreateTournamentData): Promise<Tournament> => {
    try {
      const response = await apiClient.post('/challenges/tournaments', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating tournament:', error);
      throw new Error(error.response?.data?.message || 'Failed to create tournament');
    }
  },

  // Get all tournaments
  getTournaments: async (): Promise<Tournament[]> => {
    try {
      const response = await apiClient.get('/challenges/tournaments');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching tournaments:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch tournaments');
    }
  },

  // Get upcoming tournaments
  getUpcomingTournaments: async (): Promise<Tournament[]> => {
    try {
      const response = await apiClient.get('/challenges/tournaments/upcoming');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching upcoming tournaments:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch upcoming tournaments');
    }
  },

  // Get tournament by ID
  getTournamentById: async (id: string): Promise<Tournament> => {
    try {
      const response = await apiClient.get(`/challenges/tournaments/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching tournament:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch tournament');
    }
  },

  // Update tournament
  updateTournament: async (id: string, updates: Partial<CreateTournamentData>): Promise<Tournament> => {
    try {
      const response = await apiClient.patch(`/challenges/tournaments/${id}`, updates);
      return response.data;
    } catch (error: any) {
      console.error('Error updating tournament:', error);
      throw new Error(error.response?.data?.message || 'Failed to update tournament');
    }
  },

  // Delete tournament
  deleteTournament: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/challenges/tournaments/${id}`);
    } catch (error: any) {
      console.error('Error deleting tournament:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete tournament');
    }
  },

  // Register for tournament
  registerForTournament: async (tournamentId: string, userId: string, username: string): Promise<Tournament> => {
    try {
      const response = await apiClient.post(`/challenges/tournaments/${tournamentId}/register`, {
        userId,
        username,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error registering for tournament:', error);
      throw new Error(error.response?.data?.message || 'Failed to register for tournament');
    }
  },

  // Unregister from tournament
  unregisterFromTournament: async (tournamentId: string, userId: string): Promise<void> => {
    try {
      await apiClient.delete(`/challenges/tournaments/${tournamentId}/register/${userId}`);
    } catch (error: any) {
      console.error('Error unregistering from tournament:', error);
      throw new Error(error.response?.data?.message || 'Failed to unregister from tournament');
    }
  },

  // Get tournament registrations
  getTournamentRegistrations: async (tournamentId: string): Promise<Array<{
    userId: string;
    username: string;
    registeredAt: Date;
  }>> => {
    try {
      const response = await apiClient.get(`/challenges/tournaments/${tournamentId}/registrations`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching tournament registrations:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch registrations');
    }
  },

  // Mark player as ready
  markPlayerReady: async (tournamentId: string, userId: string, username: string): Promise<any> => {
    try {
      const response = await apiClient.post(`/challenges/tournaments/${tournamentId}/ready`, {
        userId,
        username,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error marking player ready:', error);
      throw new Error(error.response?.data?.message || 'Failed to mark player ready');
    }
  },

  // Get user state in tournament
  getUserState: async (tournamentId: string, userId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/challenges/tournaments/${tournamentId}/state/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user state:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch user state');
    }
  },

  // Complete tournament match
  completeTournamentMatch: async (
    tournamentId: string,
    matchKey: string,
    data: { battleId?: string; winnerUserId?: string; winnerUsername?: string }
  ): Promise<Tournament> => {
    try {
      const response = await apiClient.post(
        `/challenges/tournaments/${tournamentId}/matches/${matchKey}/complete`,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error('Error completing tournament match:', error);
      throw new Error(error.response?.data?.message || 'Failed to complete match');
    }
  },
};

export default tournamentService;