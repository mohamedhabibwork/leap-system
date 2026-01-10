import { getTranslations } from 'next-intl/server';
import { ErrorPageBase } from '@/components/errors/error-page-base';
import { NotFoundIllustration } from '@/components/errors/error-illustrations';

export default async function AdminNotFound() {
  const t = await getTranslations('errors.pages.admin.notFound');

  return (
    <ErrorPageBase
      errorCode={404}
      title={t('title')}
      description={t('description')}
      illustration={<NotFoundIllustration className="text-red-500" />}
      actionButtons={[
        { label: t('actions.dashboard'), href: '/admin' },
        { label: t('actions.systemStatus'), href: '/admin/status', variant: 'outline' },
        { label: t('actions.documentation'), href: '/admin/docs', variant: 'outline' },
      ]}
      className="bg-gradient-to-br from-gray-50 to-red-50"
    />
  );
}
