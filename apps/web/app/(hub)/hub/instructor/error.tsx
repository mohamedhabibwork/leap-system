'use client';

import { useEffect } from 'react';
import { ErrorPageBase } from '@/components/errors/error-page-base';
import { ServerErrorIllustration } from '@/components/errors/error-illustrations';

export default function InstructorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Instructor portal error:', error);
  }, [error]);

  return (
    <ErrorPageBase
      errorCode={500}
      title="Technical Issue"
      description="We encountered a technical issue in the instructor portal. Your data is safe. Please refresh to continue."
      illustration={<ServerErrorIllustration className="text-purple-500" />}
      actionButtons={[
        { label: 'Try Again', href: '#', variant: 'default' },
        { label: 'Dashboard', href: '/hub/instructor', variant: 'outline' },
        { label: 'Support', href: '/support', variant: 'outline' },
      ]}
      className="bg-gradient-to-br from-purple-50 to-indigo-50"
    />
  );
}
