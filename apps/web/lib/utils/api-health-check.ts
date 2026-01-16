/**
 * Check if the backend API is accessible
 */
import axios from 'axios';

export async function checkBackendHealth(): Promise<{
  healthy: boolean;
  message: string;
  url?: string;
}> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  try {
    // Try the health endpoint without the /api/v1 prefix first (root level)
    await axios.get(`${apiUrl}/health`, {
      timeout: 5000, // 5 second timeout
      headers: {
        'Cache-Control': 'no-store',
      },
    });

    return {
      healthy: true,
      message: 'Backend is accessible',
      url: apiUrl,
    };
  } catch (error: any) {
    // Handle timeout errors
    if (axios.isAxiosError(error) && (error.code === 'ECONNABORTED' || error.message?.includes('timeout'))) {
      return {
        healthy: false,
        message: 'Backend request timed out. Check if backend is running.',
        url: apiUrl,
      };
    }

    // Handle network errors
    if (axios.isAxiosError(error) && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return {
        healthy: false,
        message: `Cannot connect to backend at ${apiUrl}. Is the backend running?`,
        url: apiUrl,
      };
    }

    // Handle CORS errors
    if (error.message?.includes('CORS')) {
      return {
        healthy: false,
        message: 'CORS error detected. Check backend CORS configuration.',
        url: apiUrl,
      };
    }

    // Handle HTTP errors (non-2xx responses)
    if (axios.isAxiosError(error) && error.response) {
      return {
        healthy: false,
        message: `Backend returned status ${error.response.status}`,
        url: apiUrl,
      };
    }

    return {
      healthy: false,
      message: `Backend check failed: ${error.message || 'Unknown error'}`,
      url: apiUrl,
    };
  }
}
