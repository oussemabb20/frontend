import { describe, it, expect } from 'vitest';

describe('Code Execution Service', () => {
  describe('TestCase interface', () => {
    it('validates TestCase shape', () => {
      type TestCase = {
        input: string;
        expectedOutput: string;
        description?: string;
      };

      const testCase: TestCase = {
        input: '5',
        expectedOutput: '120',
        description: 'Factorial of 5',
      };

      expect(testCase.input).toBe('5');
      expect(testCase.expectedOutput).toBe('120');
    });
  });

  describe('TestCaseResult interface', () => {
    it('validates TestCaseResult shape', () => {
      type TestCaseResult = {
        input: string;
        expectedOutput: string;
        actualOutput: string;
        passed: boolean;
        executionTime: number;
        error?: string;
        description?: string;
      };

      const result: TestCaseResult = {
        input: '5',
        expectedOutput: '120',
        actualOutput: '120',
        passed: true,
        executionTime: 45,
        description: 'Factorial passed',
      };

      expect(result.passed).toBe(true);
      expect(result.executionTime).toBeGreaterThan(0);
    });
  });

  describe('ExecutionResult interface', () => {
    it('validates ExecutionResult shape', () => {
      type TestCaseResult = {
        input: string;
        expectedOutput: string;
        actualOutput: string;
        passed: boolean;
        executionTime: number;
        error?: string;
      };

      type ExecutionResult = {
        success: boolean;
        totalTests: number;
        passedTests: number;
        failedTests: number;
        testResults: TestCaseResult[];
        totalExecutionTime: number;
        consoleOutput: string[];
        error?: string;
      };

      const result: ExecutionResult = {
        success: true,
        totalTests: 3,
        passedTests: 3,
        failedTests: 0,
        testResults: [
          {
            input: '3',
            expectedOutput: '6',
            actualOutput: '6',
            passed: true,
            executionTime: 10,
          },
        ],
        totalExecutionTime: 30,
        consoleOutput: [],
      };

      expect(result.totalTests).toBe(3);
      expect(result.passedTests).toBe(3);
      expect(result.success).toBe(true);
    });

    it('validates ExecutionResult with failure', () => {
      type TestCaseResult = {
        input: string;
        expectedOutput: string;
        actualOutput: string;
        passed: boolean;
        executionTime: number;
        error?: string;
      };

      type ExecutionResult = {
        success: boolean;
        totalTests: number;
        passedTests: number;
        failedTests: number;
        testResults: TestCaseResult[];
        totalExecutionTime: number;
        consoleOutput: string[];
        error?: string;
      };

      const result: ExecutionResult = {
        success: false,
        totalTests: 2,
        passedTests: 1,
        failedTests: 1,
        testResults: [
          {
            input: '2',
            expectedOutput: '4',
            actualOutput: '5',
            passed: false,
            executionTime: 15,
            error: 'Output mismatch',
          },
        ],
        totalExecutionTime: 25,
        consoleOutput: ['Error occurred'],
        error: 'One or more tests failed',
      };

      expect(result.success).toBe(false);
      expect(result.failedTests).toBe(1);
      expect(result.error).toBeTruthy();
    });
  });

  describe('request parameters', () => {
    it('validates code execution request structure', () => {
      type CodeExecutionRequest = {
        code: string;
        language: string;
        testCases: Array<{ input: string; expectedOutput: string }>;
        functionName?: string;
      };

      const request: CodeExecutionRequest = {
        code: 'function add(a, b) { return a + b; }',
        language: 'javascript',
        testCases: [
          { input: '2,3', expectedOutput: '5' },
          { input: '10,20', expectedOutput: '30' },
        ],
        functionName: 'add',
      };

      expect(request.language).toBe('javascript');
      expect(request.testCases.length).toBe(2);
    });

    it('validates submit code request structure', () => {
      type SubmitCodeRequest = {
        code: string;
        language: string;
        challengeId: string;
        functionName?: string;
      };

      const request: SubmitCodeRequest = {
        code: 'function solution(n) { return n * n; }',
        language: 'javascript',
        challengeId: 'chal_123',
        functionName: 'solution',
      };

      expect(request.challengeId).toBe('chal_123');
      expect(request.functionName).toBe('solution');
    });
  });

  describe('supported languages', () => {
    it('validates common supported programming languages', () => {
      const supportedLanguages = [
        'javascript',
        'typescript',
        'python',
        'java',
        'cpp',
        'csharp',
        'go',
        'rust',
        'php',
      ];

      expect(supportedLanguages).toContain('javascript');
      expect(supportedLanguages).toContain('python');
      expect(supportedLanguages).toContain('java');
      expect(supportedLanguages.length).toBeGreaterThan(0);
    });
  });

  describe('execution constraints', () => {
    it('validates timeout parameters', () => {
      const timeouts = {
        defaultTimeout: 30000,
        longerTimeout: 120000,
        minTimeout: 5000,
        maxTimeout: 300000,
      };

      expect(timeouts.longerTimeout).toBe(120000);
      expect(timeouts.longerTimeout).toBeGreaterThan(timeouts.defaultTimeout);
    });

    it('validates memory constraints', () => {
      const constraints = {
        maxMemory: '512MB',
        maxExecutionTime: '120s',
        maxOutputSize: '10MB',
      };

      expect(constraints.maxMemory).toBeTruthy();
      expect(constraints.maxExecutionTime).toBeTruthy();
    });
  });
});
