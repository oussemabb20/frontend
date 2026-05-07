import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as progressModule from './progressTracker.service.js';

// Mock localStorage for Node environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Set up globalThis.localStorage for Node environment
if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
}

describe('progressTracker.service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getUserKey', () => {
    it('returns user _id from localStorage if available', () => {
      const getUserKey = (progressModule as any).getUserKey;
      const user = { _id: 'user123', username: 'testuser' };
      localStorage.setItem('user', JSON.stringify(user));

      expect(getUserKey()).toBe('user123');
    });

    it('falls back to id if _id is not available', () => {
      const getUserKey = (progressModule as any).getUserKey;
      const user = { id: 'user456', username: 'testuser' };
      localStorage.setItem('user', JSON.stringify(user));

      expect(getUserKey()).toBe('user456');
    });

    it('falls back to email if _id and id are not available', () => {
      const getUserKey = (progressModule as any).getUserKey;
      const user = { email: 'test@example.com', username: 'testuser' };
      localStorage.setItem('user', JSON.stringify(user));

      expect(getUserKey()).toBe('test@example.com');
    });

    it('returns "guest" if no user in localStorage', () => {
      const getUserKey = (progressModule as any).getUserKey;
      expect(getUserKey()).toBe('guest');
    });

    it('returns "guest" if user JSON is invalid', () => {
      const getUserKey = (progressModule as any).getUserKey;
      localStorage.setItem('user', 'invalid-json');

      expect(getUserKey()).toBe('guest');
    });

    it('returns "guest" if user object has no _id, id, or email', () => {
      const getUserKey = (progressModule as any).getUserKey;
      const user = { username: 'testuser' };
      localStorage.setItem('user', JSON.stringify(user));

      expect(getUserKey()).toBe('guest');
    });
  });

  describe('getXpRequiredForLevel', () => {
    it('returns correct XP for level 1', () => {
      const getXpRequiredForLevel = (progressModule as any).getXpRequiredForLevel;
      // BASE_LEVEL_XP = 40, LEVEL_MULTIPLIER = 1.3, so level 1 = 40
      expect(getXpRequiredForLevel(1)).toBe(40);
    });

    it('returns increasing XP for higher levels', () => {
      const getXpRequiredForLevel = (progressModule as any).getXpRequiredForLevel;
      const level1 = getXpRequiredForLevel(1);
      const level2 = getXpRequiredForLevel(2);
      const level3 = getXpRequiredForLevel(3);

      expect(level2).toBeGreaterThan(level1);
      expect(level3).toBeGreaterThan(level2);
    });

    it('applies exponential scaling with multiplier', () => {
      const getXpRequiredForLevel = (progressModule as any).getXpRequiredForLevel;
      // 40 * 1.3^1, 40 * 1.3^2, etc.
      const level1 = getXpRequiredForLevel(1);
      const level2 = getXpRequiredForLevel(2);

      expect(level2).toBeCloseTo(Math.round(level1 * 1.3), 0);
    });

    it('returns at least 1 XP for any level', () => {
      const getXpRequiredForLevel = (progressModule as any).getXpRequiredForLevel;
      expect(getXpRequiredForLevel(0)).toBeGreaterThanOrEqual(1);
      expect(getXpRequiredForLevel(-1)).toBeGreaterThanOrEqual(1);
    });
  });

  describe('calculateLevelProgress', () => {
    it('returns level 1 for 0 XP', () => {
      const calculateLevelProgress = (progressModule as any).calculateLevelProgress;
      const progress = calculateLevelProgress(0);

      expect(progress.level).toBe(1);
      expect(progress.totalXp).toBe(0);
      expect(progress.xpIntoLevel).toBe(0);
    });

    it('calculates correct level for mid-range XP', () => {
      const calculateLevelProgress = (progressModule as any).calculateLevelProgress;
      // Just past level 1 requirement
      const progress = calculateLevelProgress(100);

      expect(progress.level).toBeGreaterThanOrEqual(1);
      expect(progress.totalXp).toBe(100);
    });

    it('calculates progress percentage within level', () => {
      const calculateLevelProgress = (progressModule as any).calculateLevelProgress;
      const progress = calculateLevelProgress(50);

      expect(progress.progressPercent).toBeGreaterThanOrEqual(0);
      expect(progress.progressPercent).toBeLessThanOrEqual(100);
    });

    it('provides XP needed for next level', () => {
      const calculateLevelProgress = (progressModule as any).calculateLevelProgress;
      const progress = calculateLevelProgress(50);

      expect(progress.xpForNextLevel).toBeGreaterThan(0);
    });

    it('floors the XP values', () => {
      const calculateLevelProgress = (progressModule as any).calculateLevelProgress;
      const progress = calculateLevelProgress(123.456);

      expect(progress.totalXp).toBe(123);
      expect(Number.isInteger(progress.xpIntoLevel)).toBe(true);
    });
  });

  describe('storage key generation', () => {
    it('generates correct submissions storage key', () => {
      const getSubmissionsStorageKey = (progressModule as any).getSubmissionsStorageKey;
      localStorage.setItem('user', JSON.stringify({ _id: 'user123' }));

      const key = getSubmissionsStorageKey();
      expect(key).toBe('bytebattle:submissions:user123');
    });

    it('generates correct solved storage key', () => {
      const getSolvedStorageKey = (progressModule as any).getSolvedStorageKey;
      localStorage.setItem('user', JSON.stringify({ _id: 'user456' }));

      const key = getSolvedStorageKey();
      expect(key).toBe('bytebattle:solved:user456');
    });

    it('generates correct profile progress storage key', () => {
      const getProfileProgressStorageKey = (progressModule as any).getProfileProgressStorageKey;
      localStorage.setItem('user', JSON.stringify({ _id: 'user789' }));

      const key = getProfileProgressStorageKey();
      expect(key).toBe('bytebattle:profile-progress:user789');
    });

    it('uses "guest" for storage key when no user', () => {
      const getSubmissionsStorageKey = (progressModule as any).getSubmissionsStorageKey;

      const key = getSubmissionsStorageKey();
      expect(key).toBe('bytebattle:submissions:guest');
    });
  });

  describe('safeReadArray', () => {
    it('reads valid array from localStorage', () => {
      const safeReadArray = (progressModule as any).safeReadArray;
      const data = [1, 2, 3];
      localStorage.setItem('test-key', JSON.stringify(data));

      const result = safeReadArray('test-key');
      expect(result).toEqual(data);
    });

    it('returns empty array if key does not exist', () => {
      const safeReadArray = (progressModule as any).safeReadArray;

      const result = safeReadArray('nonexistent-key');
      expect(result).toEqual([]);
    });

    it('returns empty array if value is not an array', () => {
      const safeReadArray = (progressModule as any).safeReadArray;
      localStorage.setItem('test-key', JSON.stringify({ not: 'array' }));

      const result = safeReadArray('test-key');
      expect(result).toEqual([]);
    });

    it('returns empty array if JSON is invalid', () => {
      const safeReadArray = (progressModule as any).safeReadArray;
      localStorage.setItem('test-key', 'invalid-json');

      const result = safeReadArray('test-key');
      expect(result).toEqual([]);
    });

    it('preserves array element types', () => {
      const safeReadArray = (progressModule as any).safeReadArray;
      const data = [{ id: 1 }, { id: 2 }, { id: 3 }];
      localStorage.setItem('test-key', JSON.stringify(data));

      const result = safeReadArray('test-key');
      expect(result[0]).toEqual({ id: 1 });
    });
  });

  describe('safeWriteArray', () => {
    it('writes array to localStorage', () => {
      const safeWriteArray = (progressModule as any).safeWriteArray;
      const data = [1, 2, 3];

      safeWriteArray('test-key', data);

      const stored = JSON.parse(localStorage.getItem('test-key') || '[]');
      expect(stored).toEqual(data);
    });

    it('overwrites existing data', () => {
      const safeWriteArray = (progressModule as any).safeWriteArray;
      localStorage.setItem('test-key', JSON.stringify([10, 20]));

      safeWriteArray('test-key', [1, 2, 3]);

      const stored = JSON.parse(localStorage.getItem('test-key') || '[]');
      expect(stored).toEqual([1, 2, 3]);
    });

    it('handles empty arrays', () => {
      const safeWriteArray = (progressModule as any).safeWriteArray;

      safeWriteArray('test-key', []);

      const stored = JSON.parse(localStorage.getItem('test-key') || 'null');
      expect(stored).toEqual([]);
    });
  });

  describe('safeReadObject', () => {
    it('reads valid object from localStorage', () => {
      const safeReadObject = (progressModule as any).safeReadObject;
      const data = { name: 'test', value: 123 };
      localStorage.setItem('test-key', JSON.stringify(data));

      const result = safeReadObject('test-key', {});
      expect(result).toEqual(data);
    });

    it('returns fallback if key does not exist', () => {
      const safeReadObject = (progressModule as any).safeReadObject;
      const fallback = { default: true };

      const result = safeReadObject('nonexistent-key', fallback);
      expect(result).toEqual(fallback);
    });

    it('returns the array value (arrays are objects)', () => {
      const safeReadObject = (progressModule as any).safeReadObject;
      localStorage.setItem('test-key', JSON.stringify([1, 2, 3]));

      const result = safeReadObject('test-key', { default: true });
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([1, 2, 3]);
    });

    it('returns fallback if JSON is invalid', () => {
      const safeReadObject = (progressModule as any).safeReadObject;
      localStorage.setItem('test-key', 'invalid-json');

      const result = safeReadObject('test-key', { default: true });
      expect(result).toEqual({ default: true });
    });
  });

  describe('safeWriteObject', () => {
    it('writes object to localStorage', () => {
      const safeWriteObject = (progressModule as any).safeWriteObject;
      const data = { name: 'test', value: 123 };

      safeWriteObject('test-key', data);

      const stored = JSON.parse(localStorage.getItem('test-key') || '{}');
      expect(stored).toEqual(data);
    });

    it('overwrites existing data', () => {
      const safeWriteObject = (progressModule as any).safeWriteObject;
      localStorage.setItem('test-key', JSON.stringify({ old: 'data' }));

      safeWriteObject('test-key', { new: 'data' });

      const stored = JSON.parse(localStorage.getItem('test-key') || '{}');
      expect(stored).toEqual({ new: 'data' });
    });
  });
});
