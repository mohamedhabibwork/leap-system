import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { getSession, signOut } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class APIClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: true, // Enable sending cookies with requests
      timeout: 30000, // 30 second timeout
    });

    // Log API URL on initialization (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('[API Client] Initialized with baseURL:', `${API_URL}/api/v1`);
    }

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        try {
          // Only try to get session on client side
          if (typeof window === 'undefined') {
            // Server-side: skip token addition (should use getServerSession if needed)
            return config;
          }

          const session = await getSession();
          if (session?.accessToken) {
            config.headers.Authorization = `Bearer ${session.accessToken}`;
            
            // Log token info in development (first 20 chars only)
            if (process.env.NODE_ENV === 'development') {
              console.debug(`[API Client] Adding token to request: ${session.accessToken.substring(0, 20)}...`);
            }
          } else {
            // Check if this is a protected endpoint (not public)
            const url = config.url || '';
            const isPublicEndpoint = url.includes('/auth/login') || 
                                     url.includes('/auth/register') || 
                                     url.includes('/auth/verify-token') ||
                                     url.includes('/public');
            
            if (!isPublicEndpoint) {
              const errorMsg = '[API Client] No access token in session. Request may fail if endpoint requires auth.';
              console.warn(errorMsg);
              
              // Log session state for debugging
              if (process.env.NODE_ENV === 'development') {
                console.debug('[API Client] Session state:', {
                  hasSession: !!session,
                  hasError: !!session?.error,
                  error: session?.error,
                  hasUser: !!session?.user,
                  url: config.url,
                });
              }
              
              // Don't send request without token for protected endpoints
              // This will be handled by the response interceptor for 401 errors
            }
          }
        } catch (error) {
          console.error('[API Client] Error getting session:', error);
          // Continue with request even if session fetch fails
          // The backend will return 401 if auth is required
        }
        return config;
      },
      (error) => {
        console.error('[API Client] Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Enhance error with validation errors if present
        if (error.response?.data && typeof error.response.data === 'object' && 'errors' in error.response.data) {
          (error as any).validationErrors = (error.response.data as any).errors;
        }

        // Log detailed error information in non-production
        if (process.env.NODE_ENV !== 'production') {
          console.group('🔴 API Error');
          if('response' in error) {
            console.error('Status:', error?.response?.status || '0');
            console.error('Message:', (error?.response?.data as any)?.message || (error as any)?.message || 'Unknown error');
          }

          if('config' in error) {
            console.error('URL:', error?.config?.url || 'Unknown URL');
            console.error('Method:', error?.config?.method?.toUpperCase() || 'Unknown Method');
          }

          
          // Log authentication-related info for 401 errors
          if ('response' in error && error?.response?.status === 401) {
            const authHeader = error?.config?.headers?.Authorization;
            console.error('Auth Header Present:', !!authHeader);
            if (authHeader && typeof authHeader === 'string') {
              console.error('Auth Header:', (authHeader as string)?.substring(0, 30) + '...');
            }
            
            // Check session state
            try {
              getSession().then(session => {
                console.error('Session State:', {
                  hasSession: !!session,
                  hasToken: !!session?.accessToken,
                  hasError: !!(session as any)?.error,
                  error: (session as any)?.error,
                });
              }).catch(err => {
                console.error('Error checking session:', err);
              });
            } catch (e) {
              // Ignore errors in error handler
            }
          }
          
          if ((error.response?.data as any)?.stack) {
            console.error('Stack:', (error?.response?.data as any)?.stack);
          }
          if ((error.response?.data as any)?.errors) {
            console.error('Validation Errors:', (error?.response?.data as any)?.errors);
          }
          console.error('Full Error:', error.response?.data);
          console.groupEnd();
        }

        // Handle network errors (CORS, connection issues, etc.)
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || error.code === 'ECONNREFUSED') {
          const errorDetails = {
            message: error.message,
            code: error.code,
            url: originalRequest?.url,
            baseURL: originalRequest?.baseURL,
            fullUrl: originalRequest?.baseURL ? `${originalRequest.baseURL}${originalRequest.url || ''}` : originalRequest?.url,
            method: originalRequest?.method,
            apiUrl: API_URL,
            timestamp: new Date().toISOString(),
          };
          
          console.error('[API Client] Network Error:', errorDetails);
          
          // Check if backend is accessible
          if (typeof window !== 'undefined') {
            // Try to ping the backend root endpoint
            this.checkBackendHealth(API_URL).catch(() => {
              // Health check failed, already logged
            });
          }
          
          // Provide helpful error message with troubleshooting steps
          const frontendOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';
          const troubleshootingSteps = [
            `1. Verify the backend is running: Check if the NestJS server is started on port 3000`,
            `   → Try: curl ${API_URL}/health or visit ${API_URL}/api/docs`,
            `2. Check CORS configuration: Ensure "${frontendOrigin}" is in the backend's CORS_ORIGIN`,
            `   → Backend should log CORS configuration on startup`,
            `3. Verify environment variables: Check NEXT_PUBLIC_API_URL is set correctly`,
            `   → Current value: ${API_URL}`,
            `4. Check firewall/network: Ensure port 3000 is not blocked`,
            `5. Verify backend is listening on the correct host`,
            `   → Check backend logs for "Application is running on: http://..."`,
          ].join('\n');

          const networkError = new Error(
            `Network error: Unable to connect to backend at ${API_URL}.\n\n` +
            `Troubleshooting steps:\n${troubleshootingSteps}`
          );
          (networkError as any).isNetworkError = true;
          (networkError as any).errorDetails = errorDetails;
          return Promise.reject(networkError);
        }

        // Handle 401 Unauthorized with token refresh
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          // Check if request was sent without token
          const hadToken = !!originalRequest.headers?.Authorization;
          
          if (!hadToken && typeof window !== 'undefined') {
            // Request was sent without token, try to get session and retry
            try {
              const session = await getSession();
              if (session?.accessToken) {
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
                originalRequest._retry = true;
                
                if (process.env.NODE_ENV === 'development') {
                  console.log('[API Client] Retrying request with token after 401');
                }
                
                return this.client(originalRequest);
              }
            } catch (sessionError) {
              console.error('[API Client] Failed to get session for retry:', sessionError);
            }
          }

          if (this.isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => {
              return this.client(originalRequest);
            }).catch((err) => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Trigger NextAuth session update (which will refresh the token)
            const session = await getSession();
            
            if (session?.error === 'RefreshAccessTokenError') {
              // Refresh failed, sign out
              await signOut({ redirect: true, callbackUrl: '/login' });
              return Promise.reject(error);
            }

            // Process failed queue
            this.processQueue(null);

            // Retry the original request with new token
            if (session?.accessToken) {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
            } else {
              // No token available, redirect to login
              console.warn('[API Client] No access token available after 401, redirecting to login');
              await signOut({ redirect: true, callbackUrl: '/login' });
              return Promise.reject(new Error('Authentication required'));
            }

            return this.client(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError);
            await signOut({ redirect: true, callbackUrl: '/login' });
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Process queued requests after token refresh
   */
  private processQueue(error: any) {
    this.failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve();
      }
    });
    this.failedQueue = [];
  }

  /**
   * Check backend health and provide diagnostic information
   */
  private async checkBackendHealth(apiUrl: string): Promise<void> {
    const checks = {
      root: false,
      health: false,
      docs: false,
      cors: false,
    };

    const frontendOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';

    // Create a simple axios instance for health checks (without auth)
    const healthCheckClient = axios.create({
      baseURL: apiUrl,
      timeout: 5000,
      validateStatus: () => true, // Don't throw on any status code
    });

    try {
      // Check root endpoint
      try {
        await healthCheckClient.get('/');
        checks.root = true;
      } catch (e) {
        // If it's a network error, backend might be down
        // If it's a CORS error, backend is up but CORS is blocking
        if (axios.isAxiosError(e)) {
          if (e.code === 'ERR_NETWORK' || e.code === 'ECONNREFUSED') {
            checks.root = false;
          } else {
            // CORS or other error means backend is reachable
            checks.root = true;
          }
        } else {
          checks.root = false;
        }
      }

      // Check health endpoint
      try {
        const healthResponse = await healthCheckClient.get('/health');
        checks.health = healthResponse.status === 200;
        if (checks.health) {
          checks.cors = true; // If we got a 200, CORS is working
        }
      } catch (e) {
        if (axios.isAxiosError(e)) {
          if (e.code === 'ERR_NETWORK' || e.code === 'ECONNREFUSED') {
            checks.health = false;
          } else {
            // CORS error means backend is reachable but CORS is blocking
            checks.health = true;
            checks.cors = false;
          }
        } else {
          checks.health = false;
        }
      }

      // Check docs endpoint (with CORS)
      try {
        const docsResponse = await healthCheckClient.get('/api/docs');
        checks.docs = docsResponse.status === 200;
        if (checks.docs) {
          checks.cors = true; // If we got a response, CORS is working
        }
      } catch (e) {
        if (axios.isAxiosError(e)) {
          if (e.code === 'ERR_NETWORK' || e.code === 'ECONNREFUSED') {
            checks.docs = false;
          } else {
            // CORS might be blocking this
            console.warn('[API Client] Could not access /api/docs - CORS may be blocking');
            checks.docs = false;
          }
        } else {
          checks.docs = false;
        }
      }

      // Log diagnostic information
      console.group('🔍 Backend Connectivity Diagnostics');
      console.log('Backend URL:', apiUrl);
      console.log('Frontend Origin:', frontendOrigin);
      console.log('Checks:', checks);
      
      if (!checks.cors && (checks.root || checks.health)) {
        console.warn('⚠️  Backend is reachable but CORS may be misconfigured');
        console.warn(`   Ensure "${frontendOrigin}" is in the backend's CORS_ORIGIN environment variable`);
      } else if (!checks.root && !checks.health) {
        console.error('❌ Backend is not reachable');
        console.error('   Verify the backend is running on port 3000');
        console.error(`   Try: curl ${apiUrl}/health`);
      } else {
        console.log('✅ Backend appears to be reachable');
        if (checks.health) {
          console.log('✅ Health endpoint is accessible');
        }
        if (checks.cors) {
          console.log('✅ CORS is properly configured');
        }
      }
      console.groupEnd();
    } catch (error) {
      console.error('[API Client] Backend health check failed:', error);
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new APIClient();
export default apiClient;
