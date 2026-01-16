import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { env } from '@/lib/config/env';

/**
 * Server-side API client for making requests from Next.js server components/API routes
 * This client doesn't use session management like the client-side API client
 * Instead, it accepts an optional access token parameter
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
   * Create a request with optional authorization token
   */
  private createConfig(token?: string, config?: AxiosRequestConfig): AxiosRequestConfig {
    const headers: Record<string, string> = config?.headers 
      ? { ...(config.headers as Record<string, string>) }
      : {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return {
      ...config,
      headers,
    };
  }

  async get<T>(url: string, token?: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, this.createConfig(token, config));
    return response.data;
  }

  async post<T>(url: string, data?: unknown, token?: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, this.createConfig(token, config));
    return response.data;
  }

  async put<T>(url: string, data?: unknown, token?: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, this.createConfig(token, config));
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, token?: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, this.createConfig(token, config));
    return response.data;
  }

  async delete<T>(url: string, token?: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, this.createConfig(token, config));
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
