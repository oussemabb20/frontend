import apiClient from './api.js';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface VerifyEmailData {
  email: string;
  code: string;
}

interface AuthUserLike {
  id?: string;
  _id?: string;
  username?: string;
  email?: string;
  role?: 'user' | 'admin' | string;
  profile?: {
    avatar?: string;
  };
  providerAvatar?: string;
  statistics?: Record<string, unknown>;
}

export const normalizeRole = (role?: string): 'user' | 'admin' => {
  const normalizedRole = typeof role === 'string' ? role.trim().toLowerCase() : '';
  return normalizedRole === 'admin' ? 'admin' : 'user';
};

export const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;

    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const decoded = atob(padded);
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
};

export const normalizeAndPersistAuth = (accessToken: string, refreshToken: string, user?: AuthUserLike) => {
  if (!accessToken || !refreshToken) {
    throw new Error('Login response did not include authentication tokens');
  }

  const payload = decodeJwtPayload(accessToken);
  if (!payload) {
    throw new Error('Login response included an invalid access token');
  }

  const tokenRole = typeof payload?.role === 'string' ? payload.role : undefined;
  const tokenSub = typeof payload?.sub === 'string' ? payload.sub : undefined;

  const normalizedUser = {
    ...(user || {}),
    id: user?.id || user?._id || tokenSub,
    _id: user?._id || user?.id || tokenSub,
    role: normalizeRole(user?.role || tokenRole),
  };

  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('user', JSON.stringify(normalizedUser));

  return normalizedUser;
};





export const authService = {
  // Register a new user
  register: async (data: RegisterData) => {
    const response = await apiClient.post('/auth/register', data, {
      timeout: 30000,
    });
    return response.data;
  },

  // Login user
  login: async (data: LoginData) => {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    const response = await apiClient.post('/auth/login', data);
    
    // Check if 2FA is required
    if (response.data.requiresTwoFactor) {
      return response.data; // Return without storing tokens
    }
    
    const { accessToken, refreshToken, user } = response.data;
    normalizeAndPersistAuth(accessToken, refreshToken, user);
    
    return response.data;
  },

  // Verify email code sending fixed
  verifyEmail: async (data: VerifyEmailData) => {
    const response = await apiClient.post('/auth/verify-email', data);
    return response.data;
  },

  // Resend verification code
  resendVerification: async (email: string) => {
    const response = await apiClient.post('/auth/resend-verification', { email });
    return response.data;
  },

  // Logout user
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // Get current user profile
  getProfile: async () => {
    const response = await apiClient.post('/auth/me');
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('accessToken');
    return Boolean(token && decodeJwtPayload(token));
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      const parsedUser = JSON.parse(userStr) as AuthUserLike;
      const accessToken = localStorage.getItem('accessToken') || '';
      const payload = decodeJwtPayload(accessToken);
      const tokenRole = typeof payload?.role === 'string' ? payload.role : undefined;
      const tokenSub = typeof payload?.sub === 'string' ? payload.sub : undefined;

      return {
        ...parsedUser,
        id: parsedUser.id || parsedUser._id || tokenSub,
        _id: parsedUser._id || parsedUser.id || tokenSub,
        role: normalizeRole(parsedUser.role || tokenRole),
      };
    } catch {
      return null;
    }
  },

  // Delete account
  deleteAccount: async (userId: string) => {
    const response = await apiClient.delete(`/users/${userId}`);
    // Clear local storage after successful deletion
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    return response.data;
  },

  // ============================================================================
  // Face ID Recognition
  // ============================================================================

  // Check if user has Face ID enabled
  checkFaceIdStatus: async (email: string) => {
    try {
      const response = await apiClient.get(`/auth/faceid/status?email=${encodeURIComponent(email)}`);
      return response.data.faceIdEnabled;
    } catch {
      return false;
    }
  },

  // Enable Face ID for authenticated user
  enableFaceId: async (embedding: number[]) => {
    const response = await apiClient.post('/auth/faceid/enable', { embedding });
    return response.data;
  },

  // Disable Face ID
  disableFaceId: async () => {
    const response = await apiClient.post('/auth/faceid/disable');
    return response.data;
  },

  // Update Face ID embedding
  updateFaceEmbedding: async (embedding: number[]) => {
    const response = await apiClient.post('/auth/faceid/update', { embedding });
    return response.data;
  },

  // Login with Face ID
  loginWithFaceId: async (email: string, embedding: number[]) => {
    const response = await apiClient.post('/auth/faceid/login', { email, embedding });

    const { accessToken, refreshToken, user } = response.data;
    normalizeAndPersistAuth(accessToken, refreshToken, user);

    return response.data;
  },

  // ============================================================================
  // Forgot Password
  // ============================================================================

  // Request password reset
  forgotPassword: async (email: string) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Verify reset token
  verifyResetToken: async (token: string) => {
    const response = await apiClient.post('/auth/verify-reset-token', { token });
    return response.data;
  },

  // Reset password with token
  resetPassword: async (token: string, newPassword: string) => {
    const response = await apiClient.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  // ============================================================================
  // Two-Factor Authentication (2FA)
  // ============================================================================

  // Get 2FA status
  get2FAStatus: async () => {
    const response = await apiClient.get('/auth/2fa/status');
    return response.data;
  },

  // Generate 2FA QR code
  generate2FA: async () => {
    const response = await apiClient.post('/auth/2fa/generate');
    return response.data;
  },

  // Enable 2FA with verification token
  enable2FA: async (token: string) => {
    const response = await apiClient.post('/auth/2fa/enable', { token });
    return response.data;
  },

  // Disable 2FA
  disable2FA: async (token: string) => {
    const response = await apiClient.post('/auth/2fa/disable', { token });
    return response.data;
  },

  // Login with 2FA code
  loginWith2FA: async (userId: string, token: string) => {
    const response = await apiClient.post('/auth/login-2fa', { userId, token });
    const { accessToken, refreshToken, user } = response.data;
    normalizeAndPersistAuth(accessToken, refreshToken, user);
    
    return response.data;
  },

  // Get QR code for 2FA login
  get2FALoginQR: async (userId: string) => {
    const response = await apiClient.post('/auth/2fa/login-qr', { userId });
    return response.data;
  },
};

export default authService;
