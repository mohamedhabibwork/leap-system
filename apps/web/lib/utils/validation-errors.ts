import { AxiosError } from 'axios';
import { FieldErrors, FieldValues } from 'react-hook-form';
import { isValidationError, ValidationError } from '@/types/api-error';

/**
 * Extract validation errors from an Axios error response
 * Returns null if the error is not a validation error
 * 
 * @param error - Axios error from API call
 * @returns Record of field names to error message arrays, or null
 */
export function extractValidationErrors(
  error: unknown
): Record<string, string[]> | null {
  if (!error || typeof error !== 'object') {
    return null;
  }

  const axiosError = error as AxiosError;
  
  // Check if error.response.data contains validation errors
  if (axiosError.response?.data && isValidationError(axiosError.response.data)) {
    return axiosError.response.data.errors;
  }

  return null;
}

/**
 * Get the first error message for a specific field
 * Returns undefined if no error exists for the field
 * 
 * @param errors - Validation errors object
 * @param field - Field name (supports nested paths like "profile.firstName")
 * @returns First error message or undefined
 */
export function getFieldError(
  errors: Record<string, string[]> | null,
  field: string
): string | undefined {
  if (!errors || !field) {
    return undefined;
  }

  const fieldErrors = errors[field];
  return fieldErrors && fieldErrors.length > 0 ? fieldErrors[0] : undefined;
}

/**
 * Get all error messages for a specific field
 * Returns empty array if no errors exist for the field
 * 
 * @param errors - Validation errors object
 * @param field - Field name (supports nested paths like "profile.firstName")
 * @returns Array of error messages
 */
export function getAllFieldErrors(
  errors: Record<string, string[]> | null,
  field: string
): string[] {
  if (!errors || !field) {
    return [];
  }

  return errors[field] || [];
}

/**
 * Convert validation errors to React Hook Form error format
 * Useful for setting errors programmatically in forms
 * 
 * @param errors - Validation errors object from API
 * @returns React Hook Form compatible errors object
 */
export function mapErrorsToRHF<TFieldValues extends FieldValues = FieldValues>(
  errors: Record<string, string[]> | null
): Partial<FieldErrors<TFieldValues>> {
  if (!errors) {
    return {};
  }

  const rhfErrors: any = {};

  Object.entries(errors).forEach(([field, messages]) => {
    if (messages && messages.length > 0) {
      // Handle nested field paths (e.g., "profile.firstName")
      const parts = field.split('.');
      let current = rhfErrors;

      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }

      // Set the error at the final nested level
      const lastPart = parts[parts.length - 1];
      current[lastPart] = {
        type: 'server',
        message: messages[0], // Use first error message
      };
    }
  });

  return rhfErrors;
}

/**
 * Check if validation errors exist
 * 
 * @param errors - Validation errors object
 * @returns true if there are any validation errors
 */
export function hasValidationErrors(
  errors: Record<string, string[]> | null
): boolean {
  if (!errors) {
    return false;
  }

  return Object.keys(errors).length > 0;
}

/**
 * Get all validation errors as a flat array of messages
 * Useful for displaying all errors in a summary
 * 
 * @param errors - Validation errors object
 * @returns Array of all error messages
 */
export function getAllErrorMessages(
  errors: Record<string, string[]> | null
): string[] {
  if (!errors) {
    return [];
  }

  const messages: string[] = [];
  Object.values(errors).forEach((fieldErrors) => {
    messages.push(...fieldErrors);
  });

  return messages;
}

/**
 * Format validation errors for display
 * Returns a human-readable string of all errors
 * 
 * @param errors - Validation errors object
 * @param separator - Separator between errors (default: newline)
 * @returns Formatted error string
 */
export function formatValidationErrors(
  errors: Record<string, string[]> | null,
  separator: string = '\n'
): string {
  const messages = getAllErrorMessages(errors);
  return messages.join(separator);
}

/**
 * Get validation error count
 * 
 * @param errors - Validation errors object
 * @returns Total number of validation errors across all fields
 */
export function getValidationErrorCount(
  errors: Record<string, string[]> | null
): number {
  if (!errors) {
    return 0;
  }

  return Object.values(errors).reduce(
    (count, fieldErrors) => count + fieldErrors.length,
    0
  );
}
