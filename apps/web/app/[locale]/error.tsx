'use client';

import { useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { Home, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 mb-6">
            <AlertTriangle className="h-16 w-16 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Title & Description */}
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
          Something Went Wrong
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          We encountered an unexpected error. Our team has been notified and is working on a fix.
        </p>

        {/* Error Details (Development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-4 rounded-lg bg-muted text-left">
            <p className="text-sm font-mono text-destructive break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button onClick={reset} size="lg" className="inline-flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Try Again
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/" className="inline-flex items-center gap-2">
              <Home className="h-5 w-5" />
              Go to Homepage
            </Link>
          </Button>
        </div>

        {/* Support Info */}
        <div className="pt-8 border-t border-border">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            Need Help?
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            If this problem persists, please contact our support team.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Contact Support
          </Link>
        </div>

        {/* Status Page Link */}
        <div className="mt-6">
          <a
            href="https://status.leappm.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Check System Status
          </a>
        </div>
      </div>
    </div>
  );
}
