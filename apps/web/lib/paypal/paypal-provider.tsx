'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { initializePayPalSDK, PayPalSDKInstance } from './sdk-loader';
import apiClient from '@/lib/api/client';
import { toast } from 'sonner';

interface PayPalContextValue {
  sdkInstance: PayPalSDKInstance | null;
  isLoading: boolean;
  error: Error | null;
  refreshSDK: () => Promise<void>;
  clientToken: string | null;
}

const PayPalContext = createContext<PayPalContextValue | undefined>(undefined);

interface PayPalProviderProps {
  children: ReactNode;
}

/**
 * PayPal Provider using PayPal SDK v6
 * 
 * PayPal SDK v6 features:
 * - Uses client tokens (not client IDs in URLs) for better security
 * - Modular component loading for better performance
 * - Web components for UI elements
 * - Payment sessions for transaction handling
 * - Better TypeScript support
 */
export function PayPalProvider({ children }: PayPalProviderProps) {
  const { data: session, status } = useSession();
  const [sdkInstance, setSdkInstance] = useState<PayPalSDKInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [clientToken, setClientToken] = useState<string | null>(null);

  const initializeSDK = async () => {
    // Only initialize if user is authenticated
    if (status === 'unauthenticated') {
      setIsLoading(false);
      return;
    }

    if (status === 'loading') {
      return; // Wait for session to load
    }

    if (!session?.accessToken) {
      setIsLoading(false);
      return;
    }

    // Check if PayPal is configured (optional - don't fail if not configured)
    const paypalMode = process.env.NEXT_PUBLIC_PAYPAL_MODE;
    if (!paypalMode) {
      // PayPal not configured, silently skip initialization
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch client token from backend (requires authentication)
      // Client tokens are browser-safe and short-lived
      const response = await apiClient.get<{ clientToken: string }>('/payments/client-token');
      const { clientToken: token } = response;
      
      // Validate client token
      if (!token || typeof token !== 'string' || token.trim().length === 0) {
        throw new Error('Invalid client token received from server');
      }

      // Basic JWT validation (client tokens are JWTs)
      if (!token.includes('.')) {
        throw new Error('Client token is not a valid JWT format');
      }

      setClientToken(token);

      // Initialize SDK v6 with client token
      // SDK v6 uses createInstance() instead of global paypal object
      const instance = await initializePayPalSDK(token, {
        components: ['paypal-payments'],
        pageType: 'checkout',
        locale: 'en-US',
        currency: 'USD',
      });
      setSdkInstance(instance);
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error('Failed to initialize PayPal SDK');
      setError(error);
      console.error('PayPal SDK v6 initialization error:', error);
      
      // Only show error toast for actual initialization failures, not configuration issues
      // Don't show error if it's a 401/403 (not authenticated), 404 (endpoint not found), or 503 (service unavailable)
      const isAuthError = err?.response?.status === 401 || err?.response?.status === 403;
      const isNotFound = err?.response?.status === 404;
      const isServiceUnavailable = err?.response?.status === 503;
      const isServerError = err?.response?.status >= 500 && err?.response?.status !== 503;
      
      // Only show error for unexpected server errors
      // Silently handle: missing PayPal config (404/503), auth issues (401/403)
      if (status === 'authenticated' && isServerError) {
        console.warn('PayPal initialization failed due to server error');
        // Don't show toast - PayPal is optional and the app should work without it
      } else {
        // For other errors (config issues, etc.), just log and continue
        console.warn('PayPal initialization skipped - PayPal may not be configured');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeSDK();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);

  const refreshSDK = async () => {
    await initializeSDK();
  };

  return (
    <PayPalContext.Provider
      value={{
        sdkInstance,
        isLoading,
        error,
        refreshSDK,
        clientToken,
      }}
    >
      {children}
    </PayPalContext.Provider>
  );
}

export function usePayPal() {
  const context = useContext(PayPalContext);
  if (context === undefined) {
    throw new Error('usePayPal must be used within a PayPalProvider');
  }
  return context;
}
