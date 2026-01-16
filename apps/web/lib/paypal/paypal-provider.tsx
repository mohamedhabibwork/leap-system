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

    try {
      setIsLoading(true);
      setError(null);

      // Fetch client token from backend (requires authentication)
      // Client tokens are browser-safe and short-lived
      const response = await apiClient.get<{ clientToken: string }>('/payments/client-token');
      const { clientToken: token } = response;
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
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize PayPal SDK');
      setError(error);
      console.error('PayPal SDK v6 initialization error:', error);
      // Don't show error toast if user is not authenticated
      if (status === 'authenticated') {
        toast.error('Failed to initialize PayPal. Please refresh the page.');
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
