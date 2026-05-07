import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as authModule from './auth.service.js';

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

describe('auth.service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('normalizeRole', () => {
    it('returns "admin" when role is "admin"', () => {
      // Access the function via module (it's exported for testing)
      const normalizeRole = (authModule as any).normalizeRole;
      expect(normalizeRole('admin')).toBe('admin');
    });

    it('returns "admin" when role is "ADMIN" (case-insensitive)', () => {
      const normalizeRole = (authModule as any).normalizeRole;
      expect(normalizeRole('ADMIN')).toBe('admin');
    });

    it('returns "admin" when role is "Admin" (case-insensitive)', () => {
      const normalizeRole = (authModule as any).normalizeRole;
      expect(normalizeRole('Admin')).toBe('admin');
    });

    it('returns "user" when role is "user"', () => {
      const normalizeRole = (authModule as any).normalizeRole;
      expect(normalizeRole('user')).toBe('user');
    });

    it('returns "user" for any other role string', () => {
      const normalizeRole = (authModule as any).normalizeRole;
      expect(normalizeRole('moderator')).toBe('user');
      expect(normalizeRole('guest')).toBe('user');
      expect(normalizeRole('unknown')).toBe('user');
    });

    it('returns "user" when role is undefined', () => {
      const normalizeRole = (authModule as any).normalizeRole;
      expect(normalizeRole(undefined)).toBe('user');
    });

    it('returns "user" when role is empty string', () => {
      const normalizeRole = (authModule as any).normalizeRole;
      expect(normalizeRole('')).toBe('user');
    });

    it('handles whitespace padding in role', () => {
      const normalizeRole = (authModule as any).normalizeRole;
      expect(normalizeRole('  admin  ')).toBe('admin');
      expect(normalizeRole('  user  ')).toBe('user');
    });
  });

  describe('decodeJwtPayload', () => {
    it('decodes a valid JWT payload', () => {
      const decodeJwtPayload = (authModule as any).decodeJwtPayload;
      const payload = { sub: 'user123', role: 'admin', email: 'test@example.com' };
      const encoded = btoa(JSON.stringify(payload));
      const token = `header.${encoded}.signature`;

      const result = decodeJwtPayload(token);
      expect(result).toEqual(payload);
    });

    it('decodes JWT with URL-safe base64 encoding', () => {
      const decodeJwtPayload = (authModule as any).decodeJwtPayload;
      // URL-safe encoding uses - and _ instead of + and /
      const payload = { sub: 'user123', role: 'user' };
      let encoded = btoa(JSON.stringify(payload));
      // Simulate URL-safe encoding
      encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      const token = `header.${encoded}.signature`;

      const result = decodeJwtPayload(token);
      expect(result).toEqual(payload);
    });

    it('returns null for invalid JWT format (missing parts)', () => {
      const decodeJwtPayload = (authModule as any).decodeJwtPayload;
      expect(decodeJwtPayload('invalid')).toBeNull();
      expect(decodeJwtPayload('only.two')).toBeNull();
    });

    it('returns null for invalid base64 payload', () => {
      const decodeJwtPayload = (authModule as any).decodeJwtPayload;
      expect(decodeJwtPayload('header.invalid!!!.signature')).toBeNull();
    });

    it('returns null for malformed JSON in payload', () => {
      const decodeJwtPayload = (authModule as any).decodeJwtPayload;
      const invalidJson = btoa('not json');
      const token = `header.${invalidJson}.signature`;

      expect(decodeJwtPayload(token)).toBeNull();
    });

    it('returns null for empty payload', () => {
      const decodeJwtPayload = (authModule as any).decodeJwtPayload;
      expect(decodeJwtPayload('header..signature')).toBeNull();
    });
  });

  describe('normalizeAndPersistAuth', () => {
    it('rejects missing tokens instead of persisting a fake session', () => {
      const normalizeAndPersistAuth = (authModule as any).normalizeAndPersistAuth;

      expect(() => normalizeAndPersistAuth('', 'refresh_token')).toThrow(
        'Login response did not include authentication tokens',
      );
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('rejects invalid access tokens instead of persisting a fake session', () => {
      const normalizeAndPersistAuth = (authModule as any).normalizeAndPersistAuth;

      expect(() => normalizeAndPersistAuth('not-a-jwt', 'refresh_token')).toThrow(
        'Login response included an invalid access token',
      );
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('persists tokens and user to localStorage', () => {
      const normalizeAndPersistAuth = (authModule as any).normalizeAndPersistAuth;
      const payload = { sub: 'user123', role: 'admin' };
      const encoded = btoa(JSON.stringify(payload));
      const accessToken = `header.${encoded}.signature`;
      const refreshToken = 'refresh_token_123';

      const result = normalizeAndPersistAuth(accessToken, refreshToken);

      expect(localStorage.getItem('accessToken')).toBe(accessToken);
      expect(localStorage.getItem('refreshToken')).toBe(refreshToken);
      expect(localStorage.getItem('user')).toBeTruthy();
    });

    it('stores user with correct role from token', () => {
      const normalizeAndPersistAuth = (authModule as any).normalizeAndPersistAuth;
      const payload = { sub: 'user456', role: 'admin' };
      const encoded = btoa(JSON.stringify(payload));
      const accessToken = `header.${encoded}.signature`;
      const refreshToken = 'refresh_token';

      normalizeAndPersistAuth(accessToken, refreshToken);

      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      expect(storedUser.role).toBe('admin');
      expect(storedUser.id).toBe('user456');
    });

    it('merges provided user with token data', () => {
      const normalizeAndPersistAuth = (authModule as any).normalizeAndPersistAuth;
      const payload = { sub: 'user789' };
      const encoded = btoa(JSON.stringify(payload));
      const accessToken = `header.${encoded}.signature`;
      const user = { username: 'testuser', email: 'test@example.com' };

      normalizeAndPersistAuth(accessToken, 'refresh_token', user);

      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      expect(storedUser.username).toBe('testuser');
      expect(storedUser.email).toBe('test@example.com');
    });

    it('prioritizes _id from user if provided', () => {
      const normalizeAndPersistAuth = (authModule as any).normalizeAndPersistAuth;
      const payload = { sub: 'token_id' };
      const encoded = btoa(JSON.stringify(payload));
      const accessToken = `header.${encoded}.signature`;
      const user = { _id: 'user_id', username: 'testuser' };

      normalizeAndPersistAuth(accessToken, 'refresh_token', user);

      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      expect(storedUser._id).toBe('user_id');
    });

    it('falls back to token sub when user has no id', () => {
      const normalizeAndPersistAuth = (authModule as any).normalizeAndPersistAuth;
      const payload = { sub: 'token_sub_id', role: 'user' };
      const encoded = btoa(JSON.stringify(payload));
      const accessToken = `header.${encoded}.signature`;

      normalizeAndPersistAuth(accessToken, 'refresh_token');

      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      expect(storedUser.id).toBe('token_sub_id');
    });

    it('normalizes role from token when user role is not provided', () => {
      const normalizeAndPersistAuth = (authModule as any).normalizeAndPersistAuth;
      const payload = { sub: 'user999', role: 'ADMIN' };
      const encoded = btoa(JSON.stringify(payload));
      const accessToken = `header.${encoded}.signature`;

      normalizeAndPersistAuth(accessToken, 'refresh_token');

      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      expect(storedUser.role).toBe('admin');
    });

    it('prefers user role over token role when both provided', () => {
      const normalizeAndPersistAuth = (authModule as any).normalizeAndPersistAuth;
      const payload = { sub: 'user', role: 'user' };
      const encoded = btoa(JSON.stringify(payload));
      const accessToken = `header.${encoded}.signature`;
      const user = { role: 'admin', username: 'testuser' };

      normalizeAndPersistAuth(accessToken, 'refresh_token', user);

      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      expect(storedUser.role).toBe('admin');
    });
  });

  describe('isAuthenticated', () => {
    it('returns false when accessToken is missing or invalid', () => {
      localStorage.setItem('accessToken', 'not-a-jwt');

      expect(authModule.authService.isAuthenticated()).toBe(false);
    });

    it('returns true when accessToken has a decodable payload', () => {
      const encoded = btoa(JSON.stringify({ sub: 'user123', role: 'user' }));
      localStorage.setItem('accessToken', `header.${encoded}.signature`);

      expect(authModule.authService.isAuthenticated()).toBe(true);
    });
  });
});
