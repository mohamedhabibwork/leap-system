'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ErrorPageBase } from '@/components/errors/error-page-base';
import { ServerErrorIllustration } from '@/components/errors/error-illustrations';

export default function InstructorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors.pages.instructor.error');

  useEffect(() => {
    console.error('Instructor portal error:', error);
  }, [error]);

  return (
    <ErrorPageBase
      errorCode={500}
      title={t('title')}
      description={t('description')}
      illustration={<ServerErrorIllustration className="text-purple-500" />}
      actionButtons={[
        { label: t('actions.tryAgain'), href: '#', variant: 'default' },
        { label: t('actions.dashboard'), href: '/hub/instructor', variant: 'outline' },
        { label: t('actions.support'), href: '/support', variant: 'outline' },
      ]}
      className="bg-gradient-to-br from-purple-50 to-indigo-50"
    />
  );
}
