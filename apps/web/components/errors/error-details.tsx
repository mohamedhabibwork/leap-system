import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Code } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorDetailsProps {
  /**
   * Error object from API or other source
   */
  error: any;
  
  /**
   * Custom title for the error display
   */
  title?: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Whether to show detailed stack trace
   * Only shown in non-production by default
   */
  showStack?: boolean;
}

/**
 * Display detailed error information for debugging
 * Only shows detailed information in non-production environments
 */
export function ErrorDetails({
  error,
  title = 'An error occurred',
  className,
  showStack = false,
}: ErrorDetailsProps) {
  // Don't show detailed errors in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (!error) {
    return null;
  }

  // Extract error information
  const message = error.response?.data?.message || error.message || 'Unknown error';
  const statusCode = error.response?.status;
  const stack = error.response?.data?.stack || error.stack;
  const details = error.response?.data?.details;
  const name = error.response?.data?.name || error.name;

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <div className="space-y-2 mt-2">
          <p className="font-medium">{message}</p>
          
          {!isProduction && (
            <>
              {statusCode && (
                <p className="text-sm">
                  <strong>Status Code:</strong> {statusCode}
                </p>
              )}
              
              {name && (
                <p className="text-sm">
                  <strong>Error Type:</strong> {name}
                </p>
              )}
              
              {details && (
                <div className="mt-2">
                  <p className="text-sm font-semibold mb-1">Details:</p>
                  <pre className="text-xs bg-destructive/10 p-2 rounded overflow-x-auto">
                    {typeof details === 'string' ? details : JSON.stringify(details, null, 2)}
                  </pre>
                </div>
              )}
              
              {showStack && stack && (
                <div className="mt-2">
                  <button
                    type="button"
                    className="text-sm font-semibold flex items-center gap-1 hover:underline"
                    onClick={(e) => {
                      const stackEl = e.currentTarget.nextElementSibling;
                      if (stackEl) {
                        stackEl.classList.toggle('hidden');
                      }
                    }}
                  >
                    <Code className="h-3 w-3" />
                    Toggle Stack Trace
                  </button>
                  <pre className="hidden text-xs bg-destructive/10 p-2 rounded overflow-x-auto mt-1 max-h-48 overflow-y-auto">
                    {stack}
                  </pre>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground mt-2 italic">
                ℹ️ Detailed error information is only shown in development mode
              </p>
            </>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

interface SimpleErrorDisplayProps {
  /**
   * Error message to display
   */
  message: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Simple error message display without detailed information
 * Safe to use in production
 */
export function SimpleErrorDisplay({ message, className }: SimpleErrorDisplayProps) {
  if (!message) {
    return null;
  }

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

/**
 * Hook to format error messages based on environment
 */
export function useErrorMessage(error: any): string {
  if (!error) return '';

  const message = error.response?.data?.message || error.message || 'An error occurred';
  
  // In non-production, include additional details if available
  if (process.env.NODE_ENV !== 'production') {
    const details = error.response?.data?.details;
    const statusCode = error.response?.status;
    
    let fullMessage = message;
    if (statusCode) {
      fullMessage = `[${statusCode}] ${fullMessage}`;
    }
    if (details && details !== message) {
      fullMessage += ` (${details})`;
    }
    return fullMessage;
  }

  return message;
}
