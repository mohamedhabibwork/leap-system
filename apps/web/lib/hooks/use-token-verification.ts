import { useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';

const TOKEN_CHECK_INTERVAL = 60 * 1000; // Check every minute
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // Refresh 5 minutes before expiry

interface TokenVerificationOptions {
  onTokenExpired?: () => void;
  onTokenRefreshed?: () => void;
  onVerificationError?: (error: Error) => void;
  autoRefresh?: boolean;
}

/**
 * Hook for monitoring and verifying JWT tokens
 * Automatically refreshes tokens when they're close to expiration
 */
export function useTokenVerification(options: TokenVerificationOptions = {}) {
  const { data: session, status, update } = useSession();
  const {
    onTokenExpired,
    onTokenRefreshed,
    onVerificationError,
    autoRefresh = true,
  } = options;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshing = useRef(false);

  /**
   * Decode JWT to get expiration time
   */
  const getTokenExpiration = useCallback((token: string): number | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const { exp } = JSON.parse(jsonPayload);
      return exp ? exp * 1000 : null; // Convert to milliseconds
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }, []);

  /**
   * Check if token is expired or expiring soon
   */
  const isTokenExpiringSoon = useCallback(
    (token: string): boolean => {
      const expiration = getTokenExpiration(token);
      if (!expiration) return true;

      const timeUntilExpiry = expiration - Date.now();
      return timeUntilExpiry < TOKEN_REFRESH_THRESHOLD;
    },
    [getTokenExpiration]
  );

  /**
   * Refresh the access token
   */
  const refreshToken = useCallback(async () => {
    if (isRefreshing.current) {
      return;
    }

    isRefreshing.current = true;

    try {
      // Trigger NextAuth to refresh the token
      const updatedSession = await update();

      if (updatedSession?.error === 'RefreshAccessTokenError') {
        console.error('Token refresh failed, signing out...');
        onTokenExpired?.();
        await signOut({ redirect: true, callbackUrl: '/login' });
        return;
      }

      console.log('Token refreshed successfully');
      onTokenRefreshed?.();
    } catch (error) {
      console.error('Error refreshing token:', error);
      onVerificationError?.(error as Error);
      
      // Sign out on refresh failure
      await signOut({ redirect: true, callbackUrl: '/login' });
    } finally {
      isRefreshing.current = false;
    }
  }, [update, onTokenExpired, onTokenRefreshed, onVerificationError]);

  /**
   * Verify token and refresh if needed
   */
  const verifyToken = useCallback(async () => {
    if (!session?.accessToken || status !== 'authenticated') {
      return;
    }

    try {
      // Check if token is expiring soon
      if (isTokenExpiringSoon(session.accessToken)) {
        console.log('Token expiring soon, refreshing...');
        await refreshToken();
      }
    } catch (error) {
      console.error('Token verification error:', error);
      onVerificationError?.(error as Error);
    }
  }, [session, status, isTokenExpiringSoon, refreshToken, onVerificationError]);

  /**
   * Start automatic token verification
   */
  const startVerification = useCallback(() => {
    if (!autoRefresh || intervalRef.current) {
      return;
    }

    // Check immediately
    verifyToken();

    // Then check periodically
    intervalRef.current = setInterval(() => {
      verifyToken();
    }, TOKEN_CHECK_INTERVAL);
  }, [autoRefresh, verifyToken]);

  /**
   * Stop automatic token verification
   */
  const stopVerification = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Manual token refresh trigger
   */
  const manualRefresh = useCallback(async () => {
    await refreshToken();
  }, [refreshToken]);

  // Auto-start verification when user is authenticated
  useEffect(() => {
    if (status === 'authenticated' && autoRefresh) {
      startVerification();
    } else {
      stopVerification();
    }

    return () => {
      stopVerification();
    };
  }, [status, autoRefresh, startVerification, stopVerification]);

  // Calculate time until token expiry
  const timeUntilExpiry = session?.accessToken
    ? getTokenExpiration(session.accessToken)
      ? getTokenExpiration(session.accessToken)! - Date.now()
      : null
    : null;

  return {
    isTokenValid: !!session?.accessToken && !isTokenExpiringSoon(session.accessToken),
    timeUntilExpiry,
    isExpiringSoon: session?.accessToken ? isTokenExpiringSoon(session.accessToken) : false,
    refreshToken: manualRefresh,
    isRefreshing: isRefreshing.current,
  };
}
