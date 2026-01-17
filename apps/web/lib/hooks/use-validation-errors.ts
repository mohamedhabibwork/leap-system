import { useCallback } from 'react';
import { FieldValues, UseFormSetError, Path } from 'react-hook-form';
import { AxiosError } from 'axios';
import { extractValidationErrors, getFieldError, getAllFieldErrors } from '@/lib/utils/validation-errors';

/**
 * Hook for handling validation errors from API responses
 * Provides utilities to set form errors from server-side validation
 */
export function useValidationErrors<TFieldValues extends FieldValues = FieldValues>() {
  /**
   * Set form errors from an API error response
   * Automatically extracts validation errors and applies them to the form
   * 
   * @param error - Axios error from API call
   * @param setError - React Hook Form setError function
   * @param options - Additional options
   */
  const setFormErrors = useCallback(
    (
      error: unknown,
      setError: UseFormSetError<TFieldValues>,
      options?: {
        /**
         * Field to set general errors on if no specific field matches
         * Default: 'root.server'
         */
        rootErrorField?: string;
        /**
         * Whether to focus the first field with an error
         * Default: true
         */
        shouldFocus?: boolean;
      }
    ) => {
      const validationErrors = extractValidationErrors(error);
      
      if (!validationErrors) {
        // If not a validation error, set a general error
        const axiosError = error as AxiosError;
        let message = 
          (axiosError.response?.data )?.message || 
          axiosError.message || 
          'An error occurred';
        
        // In non-production, include additional details
        if (process.env.NODE_ENV !== 'production') {
          const details = (axiosError.response?.data )?.details;
          const statusCode = axiosError.response?.status;
          
          if (statusCode) {
            message = `[${statusCode}] ${message}`;
          }
          if (details && details !== message) {
            message += ` (${details})`;
          }
        }
        
        setError((options?.rootErrorField || 'root.server') as Path<TFieldValues>, {
          type: 'server',
          message,
        });
        return;
      }

      // Set errors for each field
      let isFirst = true;
      Object.entries(validationErrors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          // Handle nested field paths
          const fieldPath = field as Path<TFieldValues>;
          setError(fieldPath, {
            type: 'server',
            message: messages[0], // Use first error message
          }, {
            shouldFocus: isFirst && (options?.shouldFocus !== false),
          });
          isFirst = false;
        }
      });
    },
    []
  );

  /**
   * Get error message for a specific field from validation errors
   * Useful for displaying errors outside of React Hook Form
   * 
   * @param errors - Validation errors object
   * @param field - Field name
   * @returns First error message for the field or undefined
   */
  const getError = useCallback(
    (errors: Record<string, string[]> | null, field: string): string | undefined => {
      return getFieldError(errors, field);
    },
    []
  );

  /**
   * Get all error messages for a specific field
   * 
   * @param errors - Validation errors object
   * @param field - Field name
   * @returns Array of error messages
   */
  const getErrors = useCallback(
    (errors: Record<string, string[]> | null, field: string): string[] => {
      return getAllFieldErrors(errors, field);
    },
    []
  );

  /**
   * Extract validation errors from an error object
   * 
   * @param error - Axios error from API call
   * @returns Validation errors object or null
   */
  const extractErrors = useCallback(
    (error: unknown): Record<string, string[]> | null => {
      return extractValidationErrors(error);
    },
    []
  );

  return {
    setFormErrors,
    getError,
    getErrors,
    extractErrors,
  };
}
