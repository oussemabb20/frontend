import axios from 'axios';

// ML Generation API client - separate from main API
const mlApiClient = axios.create({
  baseURL: import.meta.env.VITE_ML_API_URL || 'http://localhost:3002',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds for ML generation
});

// Request interceptor for adding auth token
mlApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface MlGenerationParams {
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  language: 'javascript' | 'python' | 'typescript' | 'java' | 'cpp' | 'c' | 'go' | 'rust';
}

export interface MlGeneratedChallenge {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  categories: string[];
  supportedLanguages: string[];
  testCases: Array<{
    input: string;
    expectedOutput: string;
    isHidden?: boolean;
    description?: string;
  }>;
  starterCode: Array<{
    language: string;
    code: string;
    functionSignature?: string;
  }>;
  constraints: string;
  hints: string[];
  tags: string[];
  points: number;
  timeLimit: number;
  memoryLimit: number;
  isAIGenerated: boolean;
  isMLGenerated: boolean;
}

class MlGenerationService {
  /**
   * Generate a challenge using ML
   * @param difficulty - Challenge difficulty level
   * @param language - Programming language
   * @returns Generated challenge object
   */
  async generateChallenge(
    difficulty: MlGenerationParams['difficulty'],
    language: MlGenerationParams['language']
  ): Promise<MlGeneratedChallenge> {
    try {
      const response = await mlApiClient.post<MlGeneratedChallenge>('/ml-generation/generate', {
        difficulty,
        language,
      });
      return response.data;
    } catch (error) {
      console.error('ML Generation error:', error);
      throw error;
    }
  }

  /**
   * Seed challenges (for admin use)
   */
  async seedChallenges(): Promise<{ message: string }> {
    try {
      const response = await mlApiClient.post<{ message: string }>('/ml-generation/seed');
      return response.data;
    } catch (error) {
      console.error('Seed challenges error:', error);
      throw error;
    }
  }
}

export default new MlGenerationService();
