'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ErrorPageBase } from '@/components/errors/error-page-base';
import { ServerErrorIllustration } from '@/components/errors/error-illustrations';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors.pages.admin.error');

  useEffect(() => {
    console.error('Admin system error:', error);
    // Log to monitoring service with admin context
  }, [error]);

  return (
    <ErrorPageBase
      errorCode={500}
      title={t('title')}
      description={t('description')}
      illustration={<ServerErrorIllustration className="text-red-500" />}
      actionButtons={[
        { label: t('actions.tryAgain'), href: '#', variant: 'default' },
        { label: t('actions.dashboard'), href: '/admin', variant: 'outline' },
        { label: t('actions.systemStatus'), href: '/admin/status', variant: 'outline' },
      ]}
      className="bg-gradient-to-br from-gray-50 to-red-50"
    />
  );
}
