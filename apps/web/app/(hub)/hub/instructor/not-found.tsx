import { ErrorPageBase } from '@/components/errors/error-page-base';
import { NotFoundIllustration } from '@/components/errors/error-illustrations';

export default function InstructorNotFound() {
  return (
    <ErrorPageBase
      errorCode={404}
      title="Resource Not Found"
      description="The instructor resource you're looking for doesn't exist or has been moved."
      illustration={<NotFoundIllustration className="text-purple-500" />}
      actionButtons={[
        { label: 'Instructor Dashboard', href: '/hub/instructor' },
        { label: 'My Courses', href: '/hub/instructor/courses', variant: 'outline' },
        { label: 'Sessions', href: '/hub/instructor/sessions', variant: 'outline' },
      ]}
      className="bg-gradient-to-br from-purple-50 to-indigo-50"
    />
  );
}
