import { apiClient } from './api.js';

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
  description?: string;
}

export interface StarterCode {
  language: string;
  code: string;
  functionSignature?: string;
}

export interface Challenge {
  _id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  categories: string[];
  supportedLanguages: string[];
  testCases: TestCase[];
  starterCode: StarterCode[];
  constraints?: string;
  hints: string[];
  points: number;
  timeLimit: number;
  memoryLimit: number;
  isAIGenerated: boolean;
  isActive: boolean;
  totalSubmissions: number;
  successfulSubmissions: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ChallengeTicket {
  _id: string;
  id?: string;
  ticketId?: string;
  title?: string;
  reporterId: string;
  reporterUsername: string;
  reporterEmail?: string;
  subject: string;
  useCase: string;
  useCases?: string[];
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  adminResponse?: string;
  handledById?: string;
  handledByUsername?: string;
  handledAt?: string;
  createdAt?: string;
  updatedAt?: string;
  challengeId?: string;
  challengeTitle?: string;
  messages?: TicketMessage[];
}

export interface TicketMessage {
  username: string;
  message: string;
  isAdmin?: boolean;
  createdAt: string;
}

export const normalizeTicketStatus = (status: unknown): 'open' | 'in_progress' | 'closed' => {
  if (typeof status !== 'string') return 'open';
  const normalized = status.trim().toLowerCase();
  if (normalized === 'in_review') return 'in_progress';
  if (normalized === 'resolved' || normalized === 'rejected') return 'closed';
  if (normalized === 'in_progress' || normalized === 'closed') return normalized;
  return 'open';
};

export const normalizeIdentifier = (value: unknown): string => {
  if (typeof value === 'string') return value;

  if (value && typeof value === 'object') {
    const raw = value as Record<string, unknown>;
    if (typeof raw.$oid === 'string') return raw.$oid;
  }

  return value ? String(value) : '';
};

export const normalizeTicket = (ticket: unknown): ChallengeTicket => {
  const raw = (ticket || {}) as Record<string, unknown>;
  const id = normalizeIdentifier(raw._id || raw.id || raw.ticketId);
  const challengeId = normalizeIdentifier(raw.challengeId);
  const useCases = Array.isArray(raw.useCases)
    ? raw.useCases.filter((value): value is string => typeof value === 'string')
    : undefined;
  const messages = Array.isArray(raw.messages)
    ? (raw.messages.filter((value): value is TicketMessage => Boolean(value) && typeof value === 'object') as TicketMessage[])
    : undefined;

  return {
    _id: id,
    id: id || undefined,
    ticketId: id || undefined,
    title: typeof raw.title === 'string' ? raw.title : undefined,
    reporterId: typeof raw.reporterId === 'string' ? raw.reporterId : '',
    reporterUsername: typeof raw.reporterUsername === 'string' ? raw.reporterUsername : '',
    reporterEmail: typeof raw.reporterEmail === 'string' ? raw.reporterEmail : undefined,
    subject: typeof raw.subject === 'string' ? raw.subject : '',
    useCase: typeof raw.useCase === 'string' ? raw.useCase : '',
    useCases,
    description: typeof raw.description === 'string' ? raw.description : '',
    status: normalizeTicketStatus(raw.status),
    adminResponse: typeof raw.adminResponse === 'string' ? raw.adminResponse : undefined,
    handledById: normalizeIdentifier(raw.handledById) || undefined,
    handledByUsername: typeof raw.handledByUsername === 'string' ? raw.handledByUsername : undefined,
    handledAt: typeof raw.handledAt === 'string' ? raw.handledAt : undefined,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : undefined,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : undefined,
    challengeId: challengeId || undefined,
    challengeTitle: typeof raw.challengeTitle === 'string' ? raw.challengeTitle : undefined,
    messages,
  };
};

export interface ChallengeListResponse {
  challenges: Challenge[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ChallengeQueryParams {
  difficulty?: string;
  category?: string;
  language?: string;
  search?: string;
  tag?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DifficultyStats {
  _id: string;
  count: number;
  avgSuccessRate: number;
}

export interface CategoryStats {
  _id: string;
  count: number;
}

class ChallengeService {
  private basePath = '/challenges';

  /**
   * Get all challenges with filtering and pagination
   */
  async getChallenges(params?: ChallengeQueryParams): Promise<ChallengeListResponse> {
    const response = await apiClient.get(this.basePath, { params });
    return response.data;
  }

  /**
   * Get a specific challenge by ID (with hidden test cases filtered out)
   */
  async getChallengeById(id: string): Promise<Challenge> {
    const response = await apiClient.get(`${this.basePath}/${id}`);
    return response.data;
  }

  /**
   * Get full challenge details including hidden test cases (for execution)
   */
  async getChallengeForExecution(id: string): Promise<Challenge> {
    const response = await apiClient.get(`${this.basePath}/${id}/full`);
    return response.data;
  }

  /**
   * Get a random challenge
   */
  async getRandomChallenge(difficulty?: string): Promise<Challenge> {
    const params = difficulty ? { difficulty } : {};
    const response = await apiClient.get(`${this.basePath}/random`, { params });
    return response.data;
  }

  /**
   * Get the daily challenge
   */
  async getDailyChallenge(): Promise<Challenge> {
    const response = await apiClient.get(`${this.basePath}/daily`);
    return response.data;
  }

  /**
   * Get statistics by difficulty
   */
  async getStatsByDifficulty(): Promise<DifficultyStats[]> {
    const response = await apiClient.get(`${this.basePath}/stats/difficulty`);
    return response.data;
  }

  /**
   * Get statistics by category
   */
  async getStatsByCategory(): Promise<CategoryStats[]> {
    const response = await apiClient.get(`${this.basePath}/stats/category`);
    return response.data;
  }

  /**
   * Create a new challenge (admin only)
   */
  async createChallenge(data: Partial<Challenge>): Promise<Challenge> {
    const response = await apiClient.post(this.basePath, data);
    return response.data;
  }

  /**
   * Update a challenge (admin only)
   */
  async updateChallenge(id: string, data: Partial<Challenge>): Promise<Challenge> {
    const response = await apiClient.patch(`${this.basePath}/${id}`, data);
    return response.data;
  }

  /**
   * Delete a challenge (admin only)
   */
  async deleteChallenge(id: string): Promise<{ deleted: boolean; message: string }> {
    const response = await apiClient.delete(`${this.basePath}/${id}`);
    return response.data;
  }

  /**
   * Record a submission (used by execution service)
   */
  async recordSubmission(id: string, isSuccess: boolean): Promise<{ recorded: boolean }> {
    const response = await apiClient.post(`${this.basePath}/${id}/submission`, { isSuccess });
    return response.data;
  }

  async openTicket(
    id: string,
    payload: {
      subject?: string;
      useCase?: string;
      useCases?: string[];
      description: string;
    },
  ): Promise<ChallengeTicket> {
    const response = await apiClient.post(`${this.basePath}/${id}/tickets`, payload);
    return response.data;
  }

  async getTickets(status?: 'open' | 'in_progress' | 'closed'): Promise<ChallengeTicket[]> {
    const response = await apiClient.get(`${this.basePath}/admin/tickets`, {
      params: status ? { status } : undefined,
    });
    const tickets = Array.isArray(response.data) ? response.data : [];
    return tickets.map(normalizeTicket);
  }

  async getOpenTickets(): Promise<ChallengeTicket[]> {
    return this.getTickets('open');
  }

  async treatTicket(
    challengeId: string,
    ticketId: string,
    payload: { status: 'open' | 'in_progress' | 'closed'; adminResponse?: string },
  ): Promise<ChallengeTicket> {
    const response = await apiClient.patch(`${this.basePath}/${challengeId}/tickets/${ticketId}`, payload);
    return normalizeTicket(response.data);
  }

  /**
   * Generate a challenge using AI (OpenRouter free models)
   * POST /challenges/ai/generate
   */
  async generateWithAI(params: {
    difficulty: 'easy' | 'medium' | 'hard';
    topic?: string;
    supportedLanguages: string[];
    tags?: string[];
  }): Promise<Challenge> {
    const response = await apiClient.post(`${this.basePath}/ai/generate`, params, {
      timeout: 180000, // AI generation can take up to 3 minutes
    });
    return response.data;
  }

  /**
   * Get acceptance rate for a challenge
   */
  getAcceptanceRate(challenge: Challenge): number {
    if (challenge.totalSubmissions === 0) return 0;
    return Math.round((challenge.successfulSubmissions / challenge.totalSubmissions) * 100 * 10) / 10;
  }

  /**
   * Get difficulty color
   */
  getDifficultyColor(difficulty: string): string {
    const colors: Record<string, string> = {
      easy: '#00dd00',
      medium: '#ffaa00',
      hard: '#ff3333',
      expert: '#ff00ff',
    };
    return colors[difficulty.toLowerCase()] || '#ffffff';
  }

  /**
   * Get difficulty gradient
   */
  getDifficultyGradient(difficulty: string): string {
    const gradients: Record<string, string> = {
      easy: 'linear-gradient(135deg, #00dd00, #00aa00)',
      medium: 'linear-gradient(135deg, #ffaa00, #ff8800)',
      hard: 'linear-gradient(135deg, #ff3333, #cc0000)',
      expert: 'linear-gradient(135deg, #ff00ff, #cc00cc)',
    };
    return gradients[difficulty.toLowerCase()] || 'linear-gradient(135deg, #ffffff, #cccccc)';
  }

  /**
   * Format category name for display
   */
  formatCategoryName(category: string): string {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

export const challengeService = new ChallengeService();
export default challengeService;
