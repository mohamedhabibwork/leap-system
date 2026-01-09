'use client';

import { useEffect } from 'react';
import { ErrorPageBase } from '@/components/errors/error-page-base';
import { ServerErrorIllustration } from '@/components/errors/error-illustrations';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin system error:', error);
    // Log to monitoring service with admin context
  }, [error]);

  return (
    <ErrorPageBase
      errorCode={500}
      title="System Error"
      description={`An error occurred in the admin system. Error ID: ${error.digest || 'N/A'}. Check system logs for details.`}
      illustration={<ServerErrorIllustration className="text-red-500" />}
      actionButtons={[
        { label: 'Retry', href: '#', variant: 'default' },
        { label: 'Admin Dashboard', href: '/admin', variant: 'outline' },
        { label: 'System Logs', href: '/admin/logs', variant: 'outline' },
      ]}
      className="bg-gradient-to-br from-gray-50 to-red-50"
    />
  );
}
