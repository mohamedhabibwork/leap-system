import { logError } from './error-logger';

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: any;
}

export function handleApiError(error: any, userRole?: string): ApiError {
  // Parse error response
  const status = error.response?.status || error.status || 500;
  const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
  const code = error.response?.data?.code || error.code;
  const details = error.response?.data?.details || error.details;

  // Log error for monitoring
  logError(error, { userRole, status, code });

  // Return structured error
  return {
    status,
    message,
    code,
    details,
  };
}

export function getErrorPageForRole(errorCode: number, role: string = 'user'): string {
  // Determine appropriate error page path based on role
  const rolePrefix = role === 'admin' ? '/admin' : role === 'instructor' ? '/hub/instructor' : '/hub';

  switch (errorCode) {
    case 404:
      return `${rolePrefix}/not-found`;
    case 403:
      return `${rolePrefix}/forbidden`;
    case 401:
      return '/login';
    case 500:
    case 503:
      return `${rolePrefix}/error`;
    default:
      return `${rolePrefix}/error`;
  }
}

export function isClientError(error: any): boolean {
  const status = error.response?.status || error.status || 0;
  return status >= 400 && status < 500;
}

export function isServerError(error: any): boolean {
  const status = error.response?.status || error.status || 0;
  return status >= 500;
}

export function isNetworkError(error: any): boolean {
  return !error.response && error.request;
}

export function getErrorMessage(error: any, fallback: string = 'An error occurred'): string {
  if (typeof error === 'string') return error;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.message) return error.message;
  return fallback;
}

export function shouldRetry(error: any): boolean {
  // Retry on network errors or 5xx server errors
  if (isNetworkError(error)) return true;
  if (isServerError(error)) {
    const status = error.response?.status || error.status;
    // Don't retry on 501 (Not Implemented) or 505 (HTTP Version Not Supported)
    return ![501, 505].includes(status);
  }
  return false;
}
