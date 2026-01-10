import { getTranslations } from 'next-intl/server';
import { ErrorPageBase } from '@/components/errors/error-page-base';
import { NotFoundIllustration } from '@/components/errors/error-illustrations';

export default async function HubNotFound() {
  const t = await getTranslations('errors.pages.hub.notFound');

  return (
    <ErrorPageBase
      errorCode={404}
      title={t('title')}
      description={t('description')}
      illustration={<NotFoundIllustration className="text-blue-500" />}
      actionButtons={[
        { label: t('actions.continueLearning'), href: '/hub' },
        { label: t('actions.browseCourses'), href: '/hub/courses', variant: 'outline' },
        { label: t('actions.myCourses'), href: '/hub/courses/my-courses', variant: 'outline' },
      ]}
      className="bg-gradient-to-br from-blue-50 to-purple-50"
    />
  );
}
