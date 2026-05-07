import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../../store/slices/userSlice.js';

vi.mock('../../services/auth.service.js', () => ({
  authService: {
    getCurrentUser: vi.fn(),
    isAuthenticated: vi.fn(),
  },
}));

import ProtectedRoute from './index.js';
import { authService } from '../../services/auth.service.js';

describe('ProtectedRoute', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        user: userReducer,
      },
    });
    vi.clearAllMocks();
  });

  it('renders children when user is authenticated', () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(true);
    vi.mocked(authService.getCurrentUser).mockReturnValue({
      id: 'user123',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user',
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/protected']}>
          <ProtectedRoute requiredRole={undefined}>
            <div data-testid="protected-content">Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.queryByTestId('protected-content')).toBeDefined();
  });

  it('allows access when user has required admin role', () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(true);
    vi.mocked(authService.getCurrentUser).mockReturnValue({
      id: 'admin123',
      username: 'adminuser',
      email: 'admin@example.com',
      role: 'admin',
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/admin']}>
          <ProtectedRoute requiredRole="admin">
            <div data-testid="admin-content">Admin Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.queryByTestId('admin-content')).toBeDefined();
  });

  it('denies access when user lacks required role', () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(true);
    vi.mocked(authService.getCurrentUser).mockReturnValue({
      id: 'user123',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user',
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/admin']}>
          <ProtectedRoute requiredRole="admin">
            <div data-testid="admin-content">Admin Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      </Provider>,
    );

    // Either no content or redirected, should not show admin content
    expect(screen.queryByTestId('admin-content')).toBeNull();
  });

  it('redirects unauthenticated users to sign-in', () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(false);
    vi.mocked(authService.getCurrentUser).mockReturnValue(null);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/protected']}>
          <ProtectedRoute requiredRole={undefined}>
            <div data-testid="protected-content">Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      </Provider>,
    );

    // Protected content should not be visible
    expect(screen.queryByTestId('protected-content')).toBeNull();
  });
});
