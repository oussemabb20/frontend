import axios from 'axios';

const fallbackApiUrl = '/api';

export const API_URL = import.meta.env.VITE_API_URL || fallbackApiUrl;
export const API_ORIGIN = API_URL.endsWith('/api')
  ? API_URL.slice(0, -4)
  : API_URL.replace(/\/$/, '');

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
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

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthLoginRequest = originalRequest?.url?.includes('/auth/login');

    if (isAuthLoginRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      throw error;
    }

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          console.log('🔄 Attempting token refresh via API interceptor...');
          // Try to refresh the token - send refreshToken in Authorization header
          const response = await axios.post(
            `${API_URL}/auth/refresh`,
            {}, // Empty body
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${refreshToken}`, // Send in header
              },
            }
          );

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          console.log('✅ Token refreshed successfully via API interceptor');
          console.log('🔑 New access token (first 20 chars):', accessToken.substring(0, 20));

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          console.log('🔄 Retrying original request:', originalRequest.url);
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        console.error('❌ Token refresh failed in API interceptor:', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        globalThis.window.location.href = '/authentication/sign-in';
        throw refreshError;
      }
    }

    // For other errors or if refresh failed
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      globalThis.window.location.href = '/authentication/sign-in';
    }

    throw error;
  }
);

export default apiClient;
