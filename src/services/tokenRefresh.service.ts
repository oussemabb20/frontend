import axios from 'axios';
import api from './api.js';

class TokenRefreshService {
  private refreshTimer: NodeJS.Timeout | null = null;
  private isRefreshing = false;

  // Start automatic token refresh (runs every 10 minutes)
  startAutoRefresh() {
    // Clear any existing timer
    this.stopAutoRefresh();

    // Refresh immediately if token is close to expiry
    this.checkAndRefreshToken();

    // Set up periodic refresh every 10 minutes (before 15 min expiry)
    this.refreshTimer = setInterval(() => {
      this.checkAndRefreshToken();
    }, 10 * 60 * 1000); // 10 minutes

    console.log('Token auto-refresh started');
  }

  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
      console.log('Token auto-refresh stopped');
    }
  }

  async checkAndRefreshToken() {
    // Don't refresh if already refreshing
    if (this.isRefreshing) return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      // Decode token to check expiry
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;

      console.log(`Token check: expires in ${Math.floor(timeUntilExpiry / 1000 / 60)} minutes`);

      // Only refresh if token expires in less than 2 minutes (was 5 minutes)
      // This prevents premature refresh on fresh tokens
      if (timeUntilExpiry < 2 * 60 * 1000 && timeUntilExpiry > 0) {
        console.log('Token expiring soon, refreshing...');
        await this.refreshToken();
      } else if (timeUntilExpiry <= 0) {
        console.warn('Token already expired, user needs to login');
        // Don't auto-logout here, let the API interceptor handle it
      }
    } catch (error: unknown) {
      console.error('Error checking token expiry:', error);
      // Don't logout on decode errors, token might still be valid
    }
  }

  async refreshToken() {
    if (this.isRefreshing) return;

    this.isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        console.warn('No refresh token available');
        this.isRefreshing = false;
        return;
      }

      console.log('Attempting to refresh token...');
      const response = await api.post('/auth/refresh', { refreshToken });

      if (response.data.accessToken) {
        // Update tokens
        localStorage.setItem('accessToken', response.data.accessToken);
        
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }

        console.log('✅ Token refreshed successfully');

        // Trigger custom event for other components to update
        window.dispatchEvent(new CustomEvent('tokenRefreshed', {
          detail: { accessToken: response.data.accessToken }
        }));
      }
    } catch (error: unknown) {
      console.error('❌ Token refresh failed:', error);
      
      // Only logout if it's a 401 (unauthorized) error
      // Don't logout on network errors or other issues
      if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
        console.warn('Refresh token expired or invalid, redirecting to login...');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/authentication/sign-in';
      } else {
        console.warn('Token refresh failed but not logging out (network issue?)');
      }
    } finally {
      this.isRefreshing = false;
    }
  }

  // Manual refresh (can be called when needed)
  async manualRefresh() {
    await this.refreshToken();
  }
}

export default new TokenRefreshService();
