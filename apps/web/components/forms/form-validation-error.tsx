import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface FormValidationErrorProps {
  /**
   * Single error message or array of error messages
   */
  errors?: string | string[] | null;
  
  /**
   * Field name for context (optional)
   */
  fieldName?: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Whether to show an icon
   * Default: true
   */
  showIcon?: boolean;
}

/**
 * Display validation errors for a form field
 * Supports multiple error messages
 */
export function FormValidationError({
  errors,
  fieldName,
  className,
  showIcon = true,
}: FormValidationErrorProps) {
  // Normalize errors to array
  const errorArray = React.useMemo(() => {
    if (!errors) return [];
    if (typeof errors === 'string') return [errors];
    return errors;
  }, [errors]);

  if (errorArray.length === 0) {
    return null;
  }

  // Single error - simple display
  if (errorArray.length === 1) {
    return (
      <div className={cn('flex items-start gap-2 text-sm text-destructive', className)}>
        {showIcon && <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />}
        <span>{errorArray[0]}</span>
      </div>
    );
  }

  // Multiple errors - list display
  return (
    <Alert variant="destructive" className={cn('py-3', className)}>
      <div className="flex gap-2">
        {showIcon && <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />}
        <div className="flex-1">
          {fieldName && (
            <p className="font-medium mb-1">
              {fieldName} has the following errors:
            </p>
          )}
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errorArray.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}

interface ValidationErrorSummaryProps {
  /**
   * Validation errors object from API
   */
  errors: Record<string, string[]> | null;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Title for the error summary
   */
  title?: string;
}

/**
 * Display a summary of all validation errors
 * Useful for showing all errors at the top of a form
 */
export function ValidationErrorSummary({
  errors,
  className,
  title = 'Please correct the following errors:',
}: ValidationErrorSummaryProps) {
  if (!errors || Object.keys(errors).length === 0) {
    return null;
  }

  const errorEntries = Object.entries(errors);

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <p className="font-medium mb-2">{title}</p>
        <ul className="list-disc list-inside space-y-1">
          {errorEntries.map(([field, messages]) => (
            messages.map((message, index) => (
              <li key={`${field}-${index}`}>
                <strong>{field}:</strong> {message}
              </li>
            ))
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}

interface InlineFieldErrorProps {
  /**
   * Error message
   */
  error?: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Inline field error display
 * Simple, minimal error display for form fields
 */
export function InlineFieldError({ error, className }: InlineFieldErrorProps) {
  if (!error) {
    return null;
  }

  return (
    <p className={cn('text-sm text-destructive mt-1', className)}>
      {error}
    </p>
  );
}
