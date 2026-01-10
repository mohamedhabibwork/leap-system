'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ErrorPageBase } from '@/components/errors/error-page-base';
import { ServerErrorIllustration } from '@/components/errors/error-illustrations';

export default function HubError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors.pages.hub.error');

  useEffect(() => {
    console.error('Hub error:', error);
  }, [error]);

  return (
    <ErrorPageBase
      errorCode={500}
      title={t('title')}
      description={t('description')}
      illustration={<ServerErrorIllustration className="text-blue-500" />}
      actionButtons={[
        { label: t('actions.tryAgain'), href: '#', variant: 'default' },
        { label: t('actions.myDashboard'), href: '/hub', variant: 'outline' },
        { label: t('actions.helpCenter'), href: '/help', variant: 'outline' },
      ]}
      className="bg-gradient-to-br from-blue-50 to-purple-50"
    />
  );
}
