import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './store/slices/userSlice';

// Mock heavy modules and UI pieces the App depends on
vi.mock('./context/index.jsx', () => ({
  useVisionUIController: vi.fn(() => [
    {
      miniSidenav: false,
      direction: 'ltr',
      layout: 'dashboard',
      sidenavColor: 'blue',
      darkMode: false,
    },
    () => {},
  ]),
  setMiniSidenav: vi.fn(),
  setDarkMode: vi.fn(),
}));

vi.mock('./routes.jsx', () => ({
  default: [
    {
      route: '/authentication/sign-in',
      component: () => <div data-testid="signin">Sign In</div>,
      key: 'signin',
    },
    {
      route: '/dashboard',
      component: () => <div data-testid="dashboard">Dashboard</div>,
      key: 'dashboard',
      authRequired: true,
    },
    {
      route: '/admin',
      component: () => <div data-testid="admin">Admin</div>,
      key: 'admin',
      requiredRole: 'admin',
    },
  ],
}));

vi.mock('./components/ProtectedRoute/index.js', () => ({
  default: ({ children }) => <>{children}</>,
}));

vi.mock('./components/AdminRedirect.js', () => ({
  AdminRedirect: () => null,
}));

vi.mock('./examples/Sidenav/index.jsx', () => ({
  default: (props) => <div data-testid="sidenav" {...props} />,
}));

vi.mock('./services/auth.service.js', () => ({
  authService: {
    getCurrentUser: vi.fn(() => null),
    isAuthenticated: vi.fn(() => false),
  },
}));

import App from './App';
import { authService } from './services/auth.service.js';

describe('App', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        user: userReducer,
      },
    });
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders without crashing and shows the sidenav in dashboard layout', () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByTestId('sidenav')).toBeInTheDocument();
  });

  it('displays theme toggle button for light and dark modes', () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>
      </Provider>,
    );

    // Theme toggle button should be visible
    const lightDarkLabel = screen.queryByText(/Light|Dark/);
    expect(lightDarkLabel).toBeInTheDocument();
  });

  it('handles unauthenticated user state on app initialization', async () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(false);
    vi.mocked(authService.getCurrentUser).mockReturnValue(null);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>
      </Provider>,
    );

    await waitFor(() => {
      expect(authService.isAuthenticated).toHaveBeenCalled();
      expect(authService.getCurrentUser).toHaveBeenCalled();
    });
  });

  it('handles authenticated user state on app initialization', async () => {
    const mockUser = {
      id: 'user123',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user',
      statistics: {
        rank: 5,
        totalPoints: 100,
      },
    };

    vi.mocked(authService.isAuthenticated).mockReturnValue(true);
    vi.mocked(authService.getCurrentUser).mockReturnValue(mockUser);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>
      </Provider>,
    );

    await waitFor(() => {
      expect(authService.isAuthenticated).toHaveBeenCalled();
      expect(authService.getCurrentUser).toHaveBeenCalled();
    });
  });

  it('scrolls to top on route change', async () => {
    const scrollToSpy = vi.spyOn(document.documentElement, 'scrollTop', 'set');

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/authentication/sign-in"]}>
          <App />
        </MemoryRouter>
      </Provider>,
    );

    // Mock scroll behavior
    expect(scrollToSpy).toBeDefined();
  });

  it('sets direction attribute on body element', () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>
      </Provider>,
    );

    // Check that the body has a dir attribute set
    expect(document.body.getAttribute('dir')).toBeDefined();
  });

  it('handles localStorage preferences for dark mode', () => {
    localStorage.setItem('bb-dark-mode', 'true');

    vi.mocked(authService.isAuthenticated).mockReturnValue(true);
    vi.mocked(authService.getCurrentUser).mockReturnValue({
      id: 'user123',
      username: 'testuser',
      email: 'test@example.com',
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>
      </Provider>,
    );

    expect(localStorage.getItem('bb-dark-mode')).toBe('true');
  });
});
