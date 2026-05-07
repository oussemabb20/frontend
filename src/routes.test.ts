import { describe, expect, it, vi } from 'vitest';

vi.mock('layouts/dashboard', () => ({ default: () => null }));
vi.mock('layouts/admin-dashboard', () => ({ default: () => null }));
vi.mock('layouts/admin-users', () => ({ default: () => null }));
vi.mock('layouts/admin-challenges', () => ({ default: () => null }));
vi.mock('layouts/admin-tournaments', () => ({ default: () => null }));
vi.mock('layouts/challenges', () => ({ default: () => null }));
vi.mock('layouts/challenge-detail', () => ({ default: () => null }));
vi.mock('layouts/leaderboard', () => ({ default: () => null }));
vi.mock('layouts/battles', () => ({ default: () => null }));
vi.mock('layouts/battle-history', () => ({ default: () => null }));
vi.mock('layouts/battle-room', () => ({ default: () => null }));
vi.mock('layouts/chat', () => ({ default: () => null }));
vi.mock('layouts/profile', () => ({ default: () => null }));
vi.mock('layouts/authentication/sign-in', () => ({ default: () => null }));
vi.mock('layouts/authentication/sign-up', () => ({ default: () => null }));
vi.mock('layouts/authentication/forgot-password', () => ({ default: () => null }));
vi.mock('layouts/authentication/oauth-callback', () => ({ default: () => null }));
vi.mock('layouts/clans', () => ({ default: () => null }));
vi.mock('layouts/admin-clans', () => ({ default: () => null }));

import routes from './routes.js';

describe('routes configuration', () => {
  it('should export routes as an array', () => {
    expect(Array.isArray(routes)).toBe(true);
    expect(routes.length).toBeGreaterThan(0);
  });

  it('exposes the expected route structure', () => {
    expect(routes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'dashboard', route: '/dashboard', authRequired: true }),
        expect.objectContaining({ key: 'admin-dashboard', requiredRole: 'admin' }),
        expect.objectContaining({ key: 'admin-users', requiredRole: 'admin' }),
        expect.objectContaining({ key: 'admin-challenges', requiredRole: 'admin' }),
        expect.objectContaining({ key: 'challenges', route: '/challenges' }),
        expect.objectContaining({ key: 'profile', route: '/profile' }),
        expect.objectContaining({ key: 'sign-in', route: '/authentication/sign-in' }),
        expect.objectContaining({ key: 'oauth-callback', route: '/auth/callback' }),
      ]),
    );
  });

  it('contains hidden and admin-only pages', () => {
    const battleHistory = routes.find((route) => route.key === 'battle-history');
    const adminClans = routes.find((route) => route.key === 'admin-clans');

    expect(battleHistory).toMatchObject({ hidden: true, authRequired: true });
    expect(adminClans).toMatchObject({ requiredRole: 'admin', route: '/admin/clans' });
  });

  it('all auth-required routes have authRequired flag', () => {
    const authRequiredRoutes = routes.filter((route) => route.authRequired);
    
    authRequiredRoutes.forEach((route) => {
      expect(route.authRequired).toBe(true);
    });
  });

  it('all admin routes have requiredRole set to admin', () => {
    const adminRoutes = routes.filter((route) => route.requiredRole);
    
    adminRoutes.forEach((route) => {
      expect(route.requiredRole).toBe('admin');
    });
  });

  it('public routes do not have authRequired or requiredRole', () => {
    const publicRoutes = routes.filter((route) => !route.authRequired && !route.requiredRole && route.route);
    
    publicRoutes.forEach((route) => {
      expect(route.authRequired).toBeUndefined();
      expect(route.requiredRole).toBeUndefined();
    });
  });

  it('each route has a unique key', () => {
    const keys = routes.map((route) => route.key);
    const uniqueKeys = new Set(keys);
    
    expect(keys.length).toBe(uniqueKeys.size);
  });

  it('routes are properly structured with expected properties', () => {
    routes.forEach((route) => {
      expect(route).toHaveProperty('key');
      if (route.component) {
        expect(typeof route.component).toBe('function');
      }
    });
  });

  it('includes sign-in, sign-up, and authentication routes', () => {
    const authRoutes = routes.filter((r) => r.route && r.route.includes('authentication'));
    
    expect(authRoutes.length).toBeGreaterThan(0);
    expect(routes.some((r) => r.key === 'sign-in')).toBe(true);
    expect(routes.some((r) => r.key === 'sign-up')).toBe(true);
  });

  it('admin routes include dashboard, users, challenges, tournaments, and clans', () => {
    const adminKeys = ['admin-dashboard', 'admin-users', 'admin-challenges', 'admin-tournaments', 'admin-clans'];
    
    adminKeys.forEach((key) => {
      const adminRoute = routes.find((r) => r.key === key);
      expect(adminRoute).toBeDefined();
      expect(adminRoute?.requiredRole).toBe('admin');
    });
  });
});