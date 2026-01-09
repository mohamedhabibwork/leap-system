'use client';

import { useEffect } from 'react';
import { ErrorPageBase } from '@/components/errors/error-page-base';
import { ServerErrorIllustration } from '@/components/errors/error-illustrations';

export default function HubError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Hub error:', error);
  }, [error]);

  return (
    <ErrorPageBase
      errorCode={500}
      title="Something Went Wrong"
      description="We encountered an error while loading this page. Don't worry, your learning progress is safe. Please try again."
      illustration={<ServerErrorIllustration className="text-blue-500" />}
      actionButtons={[
        { label: 'Try Again', href: '#', variant: 'default' },
        { label: 'My Dashboard', href: '/hub', variant: 'outline' },
        { label: 'Help Center', href: '/help', variant: 'outline' },
      ]}
      className="bg-gradient-to-br from-blue-50 to-purple-50"
    />
  );
}
