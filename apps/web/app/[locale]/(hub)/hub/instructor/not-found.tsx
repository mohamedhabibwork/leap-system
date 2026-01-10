import { getTranslations } from 'next-intl/server';
import { ErrorPageBase } from '@/components/errors/error-page-base';
import { NotFoundIllustration } from '@/components/errors/error-illustrations';

export default async function InstructorNotFound() {
  const t = await getTranslations('errors.pages.instructor.notFound');

  return (
    <ErrorPageBase
      errorCode={404}
      title={t('title')}
      description={t('description')}
      illustration={<NotFoundIllustration className="text-purple-500" />}
      actionButtons={[
        { label: t('actions.dashboard'), href: '/hub/instructor' },
        { label: t('actions.myCourses'), href: '/hub/instructor/courses', variant: 'outline' },
        { label: t('actions.analytics'), href: '/hub/instructor/analytics', variant: 'outline' },
      ]}
      className="bg-gradient-to-br from-purple-50 to-indigo-50"
    />
  );
}
