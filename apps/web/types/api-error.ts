/**
 * API Error Types
 * 
 * Defines the structure of error responses from the backend API
 */

/**
 * Validation error response from backend
 * Contains structured field-level validation errors
 */
export interface ValidationError {
  statusCode: number;
  timestamp: string;
  message: string;
  errors: Record<string, string[]>; // field name -> array of error messages
}

/**
 * General API error response
 * Can include optional validation errors
 */
export interface ApiError {
  statusCode: number;
  timestamp: string;
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Type guard to check if an error is a validation error
 */
export function isValidationError(error: any): error is ValidationError {
  return (
    error &&
    typeof error === 'object' &&
    'errors' in error &&
    typeof error.errors === 'object' &&
    error.errors !== null
  );
}

/**
 * Type guard to check if an error is an API error
 */
export function isApiError(error: any): error is ApiError {
  return (
    error &&
    typeof error === 'object' &&
    'statusCode' in error &&
    'timestamp' in error &&
    'message' in error
  );
}
