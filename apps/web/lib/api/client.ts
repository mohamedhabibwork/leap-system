import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { getSession, signOut } from 'next-auth/react';
import { env } from '@/lib/config/env';

// Constants
const API_URL = env.apiUrl;
const REQUEST_TIMEOUT_MS = 30000;
const SESSION_FETCH_TIMEOUT_MS = 5000;
const SESSION_RETRY_TIMEOUT_MS = 8000;
const HEALTH_CHECK_TIMEOUT_MS = 5000;

const PUBLIC_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/verify-token',
  '/public',
  '/health',
  '/docs',
] as const;

interface QueuedRequest {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}

interface SessionWithToken {
  accessToken?: string;
  access_token?: string;
  token?: string;
  error?: string;
  user?: unknown;
}

interface NetworkError extends Error {
  isNetworkError: boolean;
  errorDetails: {
    message: string;
    code?: string;
    url?: string;
    baseURL?: string;
    fullUrl?: string;
    method?: string;
    apiUrl: string;
    timestamp: string;
  };
}

interface AxiosRequestConfigWithRetry extends AxiosRequestConfig {
  _retry?: boolean;
}

class APIClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: QueuedRequest[] = [];
  private cachedSession: SessionWithToken | null = null;
  private sessionCacheTime: number = 0;
  private readonly SESSION_CACHE_MS = 5000; // Cache session for 5 seconds

  constructor() {
    this.client = this.createAxiosInstance();
    this.setupRequestInterceptor();
    this.setupResponseInterceptor();
  }

  private createAxiosInstance(): AxiosInstance {
    const instance = axios.create({
      baseURL: `${API_URL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      withCredentials: true,
      timeout: REQUEST_TIMEOUT_MS,
    });

    return instance;
  }

  private isPublicEndpoint(url: string): boolean {
    return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));
  }

  private extractAccessToken(session: SessionWithToken | null): string | null {
    if (!session) {
      return null;
    }

    // Try multiple possible token locations in order of preference
    const token =
      session.accessToken ||
      (session as { access_token?: string }).access_token ||
      (session as { token?: string }).token ||
      (session as any)?.accessToken ||
      null;


    return token;
  }

  /**
   * Get token from session with fallback to direct session fetch
   * This is a more aggressive approach to ensure we get the token
   */
  private async getTokenWithFallback(): Promise<string | null> {
    // First try cached session
    const cached = this.getCachedSession();
    if (cached) {
      const token = this.extractAccessToken(cached);
      if (token) {
        return token;
      }
    }

    // Try to get fresh session with multiple attempts
    for (let i = 0; i < 3; i++) {
      try {
        const session = await getSession();
        if (!session) {
          if (i < 2) {
            await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)));
            continue;
          }
          break;
        }

        // Try multiple extraction methods
        const token = 
          this.extractAccessToken(session as SessionWithToken | null) ||
          (session as any)?.accessToken ||
          (session as any)?.access_token ||
          (session as any)?.token;

        if (token) {
          // Cache it for next time
          this.setCachedSession(session as SessionWithToken | null);
          return token;
        }
      } catch (error) {
        if (i < 2) {
          await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)));
        }
      }
    }

    return null;
  }

  private getCachedSession(): SessionWithToken | null {
    const now = Date.now();
    if (
      this.cachedSession &&
      this.sessionCacheTime &&
      now - this.sessionCacheTime < this.SESSION_CACHE_MS
    ) {
      const token = this.extractAccessToken(this.cachedSession);
      if (token) {
        return this.cachedSession;
      }
    }
    return null;
  }

  private setCachedSession(session: SessionWithToken | null): void {
    this.cachedSession = session;
    this.sessionCacheTime = Date.now();
  }

  private async fetchSessionWithTimeout(timeoutMs: number): Promise<SessionWithToken | null> {
    try {
      // Create a promise that will reject after timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Session fetch timeout')), timeoutMs);
      });

      // Race between session fetch and timeout
      const session = await Promise.race([getSession(), timeoutPromise]);
      return session as SessionWithToken | null;
    } catch (error) {
      // If it's a timeout error, try one more time without timeout
      if (error instanceof Error && error.message === 'Session fetch timeout') {
        try {
          const session = await getSession();
          return session as SessionWithToken | null;
        } catch (retryError) {
          return null;
        }
      }
      return null;
    }
  }

  private async fetchSessionWithRetry(maxRetries = 5): Promise<SessionWithToken | null> {
    // Check cache first
    const cached = this.getCachedSession();
    if (cached) {
      return cached;
    }

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        let session: SessionWithToken | null = null;
        
        // Try to get session - wait longer on first attempt
        if (attempt === 0) {
          // First attempt: wait up to 15 seconds for session to be ready
          try {
            session = await Promise.race([
              getSession(),
              new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 15000)
              ),
            ]) as SessionWithToken | null;
          } catch (error) {
            // Continue to next attempt
            continue;
          }
        } else {
          // Subsequent attempts: use shorter timeout but still reasonable
          session = await this.fetchSessionWithTimeout(SESSION_RETRY_TIMEOUT_MS);
        }
        
        if (session) {
          const token = this.extractAccessToken(session);
          if (token) {
            // Cache the session
            this.setCachedSession(session);
            return session;
          }
        }

        if (attempt < maxRetries - 1) {
          // Increasing delay before retry (exponential backoff)
          const delay = Math.min(100 * Math.pow(2, attempt), 1000);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      } catch (error) {
        // Continue to next attempt
      }
    }
    return null;
  }

  /**
   * Add Bearer token to request headers if available.
   * Always sends token in all requests when available for consistency.
   */
  private async addAuthTokenToRequest(config: AxiosRequestConfig): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    if (!config.headers) {
      config.headers = {};
    }

    // Skip if Authorization header is already set
    if (config.headers.Authorization) {
      return;
    }

    // First, check cached session for quick token access
    const cached = this.getCachedSession();
    if (cached) {
      const cachedToken = this.extractAccessToken(cached);
      if (cachedToken) {
        config.headers.Authorization = `Bearer ${cachedToken}`;
        return;
      }
    }

    // Try to get fresh session and extract token
    try {
      const session = await getSession() as SessionWithToken | null;
      
      if (session) {
        // Extract token from session (try multiple possible locations)
        const accessToken = 
          session.accessToken ||
          (session as any)?.accessToken ||
          (session as any)?.access_token ||
          (session as any)?.token ||
          (session as any)?.user?.accessToken ||
          (session as any)?.user?.access_token ||
          null;

        if (accessToken) {
          // Cache the session for next time
          this.setCachedSession(session);
          // Always set Bearer token when available
          config.headers.Authorization = `Bearer ${accessToken}`;
          return;
        }
      }
    } catch (error) {
      // Silently handle session fetch errors - continue without token
      // Some endpoints might be public and don't require authentication
    }

    // If no token found, continue without it
    // Public endpoints don't require authentication
  }

  private setupRequestInterceptor(): void {
    this.client.interceptors.request.use(
      async (config) => {
        // Always try to add Bearer token to all requests when available
        // This ensures consistent authentication across all endpoints
        try {
          await this.addAuthTokenToRequest(config);
        } catch (error) {
          // Silently handle interceptor errors - continue without token if needed
          // Public endpoints don't require authentication
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  private enhanceErrorWithValidationErrors(error: AxiosError): void {
    if (
      error.response?.data &&
      typeof error.response.data === 'object' &&
      'errors' in error.response.data
    ) {
      (error as AxiosError & { validationErrors?: unknown }).validationErrors = (
        error.response.data as { errors: unknown }
      ).errors;
    }
  }

  private logErrorDetails(error: AxiosError): void {
    // Error logging removed - use error monitoring service in production
  }

  private logAuthenticationError(error: AxiosError): void {
    // Authentication error logging removed
  }

  private isNetworkError(error: AxiosError): boolean {
    return (
      error.code === 'ERR_NETWORK' ||
      error.message === 'Network Error' ||
      error.code === 'ECONNREFUSED'
    );
  }

  private createNetworkError(
    error: AxiosError,
    originalRequest: AxiosRequestConfig
  ): NetworkError {
    const frontendOrigin =
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';

    const errorDetails = {
      message: error.message,
      code: error.code,
      url: originalRequest?.url,
      baseURL: originalRequest?.baseURL,
      fullUrl: originalRequest?.baseURL
        ? `${originalRequest.baseURL}${originalRequest.url || ''}`
        : originalRequest?.url,
      method: originalRequest?.method,
      apiUrl: API_URL,
      timestamp: new Date().toISOString(),
    };

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
    ) as NetworkError;

    networkError.isNetworkError = true;
    networkError.errorDetails = errorDetails;

    return networkError;
  }

  private async handleNetworkError(
    error: AxiosError,
    originalRequest: AxiosRequestConfig
  ): Promise<never> {
    const networkError = this.createNetworkError(error, originalRequest);

    if (typeof window !== 'undefined') {
      this.checkBackendHealth(API_URL).catch(() => {
        // Health check failed
      });
    }

    return Promise.reject(networkError);
  }

  private async retryRequestWithToken(
    originalRequest: AxiosRequestConfigWithRetry
  ): Promise<unknown> {
    const session = await this.fetchSessionWithRetry(3);
    const token = this.extractAccessToken(session);

    if (!token) {
      return Promise.reject(new Error('No token available'));
    }

    originalRequest.headers = originalRequest.headers || {};
    originalRequest.headers.Authorization = `Bearer ${token}`;
    originalRequest._retry = true;

    return this.client(originalRequest);
  }

  private async handleTokenRefresh(
    originalRequest: AxiosRequestConfigWithRetry
  ): Promise<unknown> {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      })
        .then(() => this.client(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    this.isRefreshing = true;

    try {
      const session = await getSession();

      if ((session as SessionWithToken)?.error === 'RefreshAccessTokenError') {
        await signOut({ redirect: true, callbackUrl: '/login' });
        return Promise.reject(new Error('Token refresh failed'));
      }

      this.processQueue(null);

      const accessToken = this.extractAccessToken(session as SessionWithToken);
      if (!accessToken) {
        await signOut({ redirect: true, callbackUrl: '/login' });
        return Promise.reject(new Error('Authentication required'));
      }

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      return this.client(originalRequest);
    } catch (refreshError) {
      this.processQueue(refreshError);
      await signOut({ redirect: true, callbackUrl: '/login' });
      return Promise.reject(refreshError);
    } finally {
      this.isRefreshing = false;
    }
  }

  private async handleUnauthorizedError(
    error: AxiosError,
    originalRequest: AxiosRequestConfigWithRetry
  ): Promise<unknown> {
    // Clear session cache on 401
    this.cachedSession = null;
    this.sessionCacheTime = 0;

    const hadToken = !!originalRequest.headers?.Authorization;

    if (!hadToken && typeof window !== 'undefined') {
      try {
        return await this.retryRequestWithToken(originalRequest);
      } catch (retryError) {
        // Silently handle retry errors
      }
    }

    return this.handleTokenRefresh(originalRequest);
  }

  private setupResponseInterceptor(): void {
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfigWithRetry;

        this.enhanceErrorWithValidationErrors(error);
        this.logErrorDetails(error);

        if (this.isNetworkError(error)) {
          return this.handleNetworkError(error, originalRequest);
        }

        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry
        ) {
          return this.handleUnauthorizedError(error, originalRequest);
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: unknown): void {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve();
      }
    });
    this.failedQueue = [];
  }

  private createHealthCheckClient(apiUrl: string): AxiosInstance {
    return axios.create({
      baseURL: apiUrl,
      timeout: HEALTH_CHECK_TIMEOUT_MS,
      validateStatus: () => true,
    });
  }

  private async checkEndpoint(
    client: AxiosInstance,
    endpoint: string
  ): Promise<{ reachable: boolean; corsWorking: boolean }> {
    try {
      const response = await client.get(endpoint);
      return {
        reachable: true,
        corsWorking: response.status === 200,
      };
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const isNetworkError =
          e.code === 'ERR_NETWORK' || e.code === 'ECONNREFUSED';
        return {
          reachable: !isNetworkError,
          corsWorking: false,
        };
      }
      return { reachable: false, corsWorking: false };
    }
  }

  private async checkBackendHealth(apiUrl: string): Promise<void> {
    const frontendOrigin =
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';
    const healthCheckClient = this.createHealthCheckClient(apiUrl);

    const [rootCheck, healthCheck, docsCheck] = await Promise.all([
      this.checkEndpoint(healthCheckClient, '/'),
      this.checkEndpoint(healthCheckClient, '/health'),
      this.checkEndpoint(healthCheckClient, '/api/docs'),
    ]);

    const checks = {
      root: rootCheck.reachable,
      health: healthCheck.reachable && healthCheck.corsWorking,
      docs: docsCheck.reachable && docsCheck.corsWorking,
      cors: healthCheck.corsWorking || docsCheck.corsWorking,
    };

    this.logHealthCheckResults(apiUrl, frontendOrigin, checks);
  }

  private logHealthCheckResults(
    apiUrl: string,
    frontendOrigin: string,
    checks: { root: boolean; health: boolean; docs: boolean; cors: boolean }
  ): void {
    // Health check logging removed - use monitoring service in production
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
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
