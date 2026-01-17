import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { env } from '@/lib/config/env';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Server-side API client for making requests from Next.js server components/API routes
 * This client automatically includes Bearer tokens from NextAuth session when available
 */
class ServerAPIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${env.apiUrl}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 30000,
    });
  }

  /**
   * Get access token from NextAuth session (server-side)
   * Returns null if no session or token is available
   */
  private async getSessionToken(): Promise<string | null> {
    try {
      const session = await getServerSession(authOptions);
      if (!session) {
        return null;
      }

      // Try multiple possible token locations
      const accessToken = 
        (session )?.accessToken ||
        (session )?.access_token ||
        (session )?.token ||
        null;

      return accessToken || null;
    } catch (error) {
      // Silently handle errors - return null if session can't be retrieved
      return null;
    }
  }

  /**
   * Create a request with optional authorization token
   * If token is not provided, attempts to get it from session automatically
   */
  private async createConfig(token?: string, config?: AxiosRequestConfig, autoGetToken: boolean = true): Promise<AxiosRequestConfig> {
    const headers: Record<string, string> = config?.headers 
      ? { ...(config.headers as Record<string, string>) }
      : {};
    
    // Use provided token, or try to get from session if autoGetToken is true
    let authToken = token;
    if (!authToken && autoGetToken) {
      authToken = await this.getSessionToken() || undefined;
    }
    
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    return {
      ...config,
      headers,
    };
  }

  /**
   * GET request - automatically includes Bearer token from session if available
   * @param url - API endpoint URL
   * @param token - Optional explicit token (if not provided, will try to get from session)
   * @param config - Optional axios config
   * @param autoGetToken - Whether to automatically get token from session (default: true)
   */
  async get<T>(url: string, token?: string, config?: AxiosRequestConfig, autoGetToken: boolean = true): Promise<T> {
    const requestConfig = await this.createConfig(token, config, autoGetToken);
    const response = await this.client.get<T>(url, requestConfig);
    return response.data;
  }

  /**
   * POST request - automatically includes Bearer token from session if available
   * @param url - API endpoint URL
   * @param data - Request body data
   * @param token - Optional explicit token (if not provided, will try to get from session)
   * @param config - Optional axios config
   * @param autoGetToken - Whether to automatically get token from session (default: true)
   */
  async post<T>(url: string, data?: unknown, token?: string, config?: AxiosRequestConfig, autoGetToken: boolean = true): Promise<T> {
    const requestConfig = await this.createConfig(token, config, autoGetToken);
    const response = await this.client.post<T>(url, data, requestConfig);
    return response.data;
  }

  /**
   * PUT request - automatically includes Bearer token from session if available
   * @param url - API endpoint URL
   * @param data - Request body data
   * @param token - Optional explicit token (if not provided, will try to get from session)
   * @param config - Optional axios config
   * @param autoGetToken - Whether to automatically get token from session (default: true)
   */
  async put<T>(url: string, data?: unknown, token?: string, config?: AxiosRequestConfig, autoGetToken: boolean = true): Promise<T> {
    const requestConfig = await this.createConfig(token, config, autoGetToken);
    const response = await this.client.put<T>(url, data, requestConfig);
    return response.data;
  }

  /**
   * PATCH request - automatically includes Bearer token from session if available
   * @param url - API endpoint URL
   * @param data - Request body data
   * @param token - Optional explicit token (if not provided, will try to get from session)
   * @param config - Optional axios config
   * @param autoGetToken - Whether to automatically get token from session (default: true)
   */
  async patch<T>(url: string, data?: unknown, token?: string, config?: AxiosRequestConfig, autoGetToken: boolean = true): Promise<T> {
    const requestConfig = await this.createConfig(token, config, autoGetToken);
    const response = await this.client.patch<T>(url, data, requestConfig);
    return response.data;
  }

  /**
   * DELETE request - automatically includes Bearer token from session if available
   * @param url - API endpoint URL
   * @param token - Optional explicit token (if not provided, will try to get from session)
   * @param config - Optional axios config
   * @param autoGetToken - Whether to automatically get token from session (default: true)
   */
  async delete<T>(url: string, token?: string, config?: AxiosRequestConfig, autoGetToken: boolean = true): Promise<T> {
    const requestConfig = await this.createConfig(token, config, autoGetToken);
    const response = await this.client.delete<T>(url, requestConfig);
    return response.data;
  }

  /**
   * Make a request to an external URL (not the backend API)
   */
  async requestExternal<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await axios.request<T>({
      url,
      ...config,
    });
    return response.data;
  }
}

export const serverAPIClient = new ServerAPIClient();
export default serverAPIClient;
