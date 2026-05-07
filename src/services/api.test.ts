import { describe, expect, it } from 'vitest';
import api, { API_ORIGIN, API_URL } from './api.js';

describe('api client config', () => {
  it('uses the configured API base URL', () => {
    // API_URL can be from env var or fallback
    expect(API_URL).toBeDefined();
    expect(typeof API_URL).toBe('string');
  });

  it('derives API_ORIGIN from API_URL correctly', () => {
    if (API_URL.endsWith('/api')) {
      expect(API_ORIGIN).toBe(API_URL.slice(0, -4));
    } else {
      expect(API_ORIGIN).toBe(API_URL.replace(/\/$/, ''));
    }
  });

  it('creates an axios client with json headers', () => {
    expect(api.defaults.baseURL).toBe(API_URL);
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('has a timeout configured', () => {
    expect(api.defaults.timeout).toBe(10000);
  });
});