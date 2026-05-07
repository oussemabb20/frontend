import api from './api.js';

export interface Tournament {
  _id?: string;
  name: string;
  startAt: string;
  maxParticipants: number;
  matchDurationMinutes: number;
  noShowWaitMinutes: number;
  roundBreakMinutes: number;
  winnerXp: number;
  winnerBadge: string;
  matchAssignments: Array<{
    matchKey: string;
    round: string;
    label: string;
    challengeId: string;
    challengeTitle: string;
  }>;
  registeredUsers: string[];
  registeredPlayers?: Array<{
    userId: string;
    username: string;
    registeredAt?: string;
  }>;
  matches?: TournamentMatch[];
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TournamentMatch {
  matchKey: string;
  round: string;
  label: string;
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
  readyDeadlineAt?: string;
  availableAt?: string;
  battleId?: string;
  status: 'pending' | 'ready' | 'active' | 'completed' | 'forfeited' | 'bye';
  winnerUserId?: string;
  winnerUsername?: string;
  completedAt?: string;
  nextMatchKey?: string;
  nextPlayerSlot?: number;
}

export interface CreateTournamentRequest {
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
  createdBy?: string;
}

export interface RegisterTournamentRequest {
  userId: string;
  username: string;
}

export interface TournamentUserState {
  status: string;
  battleId?: string;
  tournament: Tournament;
  currentMatch?: TournamentMatch;
  isRegistered: boolean;
  isEliminated: boolean;
  readyDeadlineAt?: string;
  waitUntil?: string;
}

class TournamentApiService {
  private readonly baseUrl = '/challenges/tournaments';

  async createTournament(tournament: CreateTournamentRequest): Promise<Tournament> {
    try {
      const response = await api.post(this.baseUrl, tournament);
      return response.data;
    } catch (error) {
      console.error('Error creating tournament:', error);
      throw error;
    }
  }

  async getAllTournaments(): Promise<Tournament[]> {
    try {
      const response = await api.get(this.baseUrl);
      return response.data;
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      throw error;
    }
  }

  async getUpcomingTournaments(): Promise<Tournament[]> {
    try {
      const response = await api.get(`${this.baseUrl}/upcoming`);
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming tournaments:', error);
      throw error;
    }
  }

  async getTournament(id: string): Promise<Tournament> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tournament:', error);
      throw error;
    }
  }

  async getTournamentState(id: string, userId: string): Promise<TournamentUserState> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}/state/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tournament state:', error);
      throw error;
    }
  }

  async updateTournament(id: string, updates: Partial<CreateTournamentRequest>): Promise<Tournament> {
    try {
      const response = await api.patch(`${this.baseUrl}/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating tournament:', error);
      throw error;
    }
  }

  async deleteTournament(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('Error deleting tournament:', error);
      throw error;
    }
  }

  async registerForTournament(id: string, registration: RegisterTournamentRequest): Promise<Tournament> {
    try {
      const response = await api.post(`${this.baseUrl}/${id}/register`, registration);
      return response.data;
    } catch (error) {
      console.error('Error registering for tournament:', error);
      throw error;
    }
  }

  async markReady(id: string, registration: RegisterTournamentRequest): Promise<TournamentUserState> {
    try {
      const response = await api.post(`${this.baseUrl}/${id}/ready`, registration);
      return response.data;
    } catch (error) {
      console.error('Error marking tournament player ready:', error);
      throw error;
    }
  }

  async unregisterFromTournament(id: string, userId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}/register/${userId}`);
    } catch (error) {
      console.error('Error unregistering from tournament:', error);
      throw error;
    }
  }

  async getTournamentRegistrations(id: string): Promise<Array<{ userId: string; registeredAt: string }>> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}/registrations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tournament registrations:', error);
      throw error;
    }
  }
}

export default new TournamentApiService();
