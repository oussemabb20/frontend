import apiClient from './api.js';

export interface TestCase {
  input: string;
  expectedOutput: string;
  description?: string;
}

export interface TestCaseResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  executionTime: number;
  error?: string;
  description?: string;
}

export interface ExecutionResult {
  success: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  testResults: TestCaseResult[];
  totalExecutionTime: number;
  consoleOutput: string[];
  error?: string;
}

/**
 * Run code against provided test cases (for "Run Tests" button)
 */
export const runCode = async (
  code: string,
  language: string,
  testCases: TestCase[],
  functionName?: string,
): Promise<ExecutionResult> => {
  const response = await apiClient.post(
    '/code/run',
    { code, language, testCases, functionName },
    { timeout: 120_000 }, // 120s — compiled languages (Rust, Java, C++) need time to compile
  );
  return response.data;
};

/**
 * Submit solution — runs against all hidden test cases (for "Submit Solution" button)
 */
export const submitCode = async (
  code: string,
  language: string,
  challengeId: string,
  functionName?: string,
): Promise<ExecutionResult> => {
  const response = await apiClient.post(
    '/code/submit',
    { code, language, challengeId, functionName },
    { timeout: 120_000 }, // 120s — compiled languages need time to compile
  );
  return response.data;
};

/**
 * Get supported programming languages
 */
export const getSupportedLanguages = async (): Promise<{ languages: string[] }> => {
  const response = await apiClient.get('/code/languages');
  return response.data;
};
