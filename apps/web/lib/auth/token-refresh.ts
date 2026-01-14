import { getSession, signOut } from 'next-auth/react';

const TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const TOKEN_EXPIRY_BUFFER = 60 * 1000; // Refresh 1 minute before expiry

class TokenRefreshManager {
  private intervalId: NodeJS.Timeout | null = null;
  private isRefreshing = false;

  /**
   * Start automatic token refresh checks
   */
  start() {
    if (this.intervalId) {
      return; // Already running
    }

    // Check immediately
    this.checkAndRefreshToken();

    // Then check every 5 minutes
    this.intervalId = setInterval(() => {
      this.checkAndRefreshToken();
    }, TOKEN_REFRESH_INTERVAL);
  }

  /**
   * Stop automatic token refresh checks
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Check if token needs refresh and refresh if necessary
   */
  private async checkAndRefreshToken() {
    if (this.isRefreshing) {
      return; // Already refreshing
    }

    try {
      const session = await getSession();

      if (!session || !session.accessToken) {
        return; // No session or token
      }

      // Check if session has error (token refresh failed)
      if (session.error === 'RefreshAccessTokenError') {
        console.log('Token refresh failed, signing out...');
        await signOut({ redirect: true, callbackUrl: '/login' });
        return;
      }

      // Decode token to check expiry (simplified - in production use a library like jwt-decode)
      const tokenExpiry = this.getTokenExpiry(session.accessToken);

      if (tokenExpiry && Date.now() >= tokenExpiry - TOKEN_EXPIRY_BUFFER) {
        console.log('Token expiring soon, refreshing...');
        await this.refreshToken();
      }
    } catch (error) {
      console.error('Error checking token:', error);
    }
  }

  /**
   * Force refresh the token
   */
  async refreshToken() {
    if (this.isRefreshing) {
      console.debug('[TokenRefreshManager] Already refreshing, skipping...');
      return;
    }

    this.isRefreshing = true;

    try {
      console.log('[TokenRefreshManager] Starting token refresh...');
      
      // Trigger NextAuth to refresh the token by updating the session
      const session = await getSession();
      
      if (!session) {
        console.warn('[TokenRefreshManager] No session found');
        return;
      }

      // Verify token with backend before using
      try {
        const { apiClient } = await import('@/lib/api/client');
        const verifyResponse = await apiClient.post('/auth/verify-token', {
          token: session.accessToken,
        });
        
        if (verifyResponse.data?.valid === false) {
          console.log('[TokenRefreshManager] Token verification failed with backend');
          await signOut({ redirect: true, callbackUrl: '/login' });
          return;
        }
      } catch (verifyError) {
        console.warn('[TokenRefreshManager] Backend verification failed:', verifyError);
        // Continue with refresh even if verification fails
      }

      // NextAuth will automatically refresh if token is expired
      // We can also manually trigger a refresh by calling the session endpoint
      const { apiClient } = await import('@/lib/api/client');
      const newSession = await apiClient.get('/auth/session');

      if (newSession.error === 'RefreshAccessTokenError') {
        console.error('[TokenRefreshManager] Token refresh failed, signing out...');
        await signOut({ redirect: true, callbackUrl: '/login' });
        return;
      }

      console.log('[TokenRefreshManager] Token refreshed successfully');
    } catch (error) {
      console.error('[TokenRefreshManager] Error refreshing token:', error);
      // On error, sign out user
      await signOut({ redirect: true, callbackUrl: '/login' });
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Get token expiry time from JWT token
   * This is a simplified version - use jwt-decode library for production
   */
  private getTokenExpiry(token: string): number | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const payload = JSON.parse(jsonPayload);
      return payload.exp ? payload.exp * 1000 : null; // Convert to milliseconds
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
}

// Export singleton instance
export const tokenRefreshManager = new TokenRefreshManager();

// Auto-start on client-side
if (typeof window !== 'undefined') {
  // Start when user is authenticated
  import('next-auth/react').then(({ useSession }) => {
    // This will be picked up by the SessionProvider wrapper
  });
}
