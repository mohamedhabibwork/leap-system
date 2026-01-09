'use client';

import { useEffect } from 'react';
import { ErrorPageBase } from '@/components/errors/error-page-base';
import { ServerErrorIllustration } from '@/components/errors/error-illustrations';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Application error:', error);
  }, [error]);

  return (
    <ErrorPageBase
      errorCode={500}
      title="Something Went Wrong"
      description="An unexpected error occurred. We've been notified and are working to fix it."
      illustration={<ServerErrorIllustration />}
      actionButtons={[
        { label: 'Try Again', href: '#', variant: 'default' },
        { label: 'Go Home', href: '/', variant: 'outline' },
      ]}
    />
  );
}
