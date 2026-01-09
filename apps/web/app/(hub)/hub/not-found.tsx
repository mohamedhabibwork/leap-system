import { ErrorPageBase } from '@/components/errors/error-page-base';
import { NotFoundIllustration } from '@/components/errors/error-illustrations';

export default function HubNotFound() {
  return (
    <ErrorPageBase
      errorCode={404}
      title="Page Not Found"
      description="Oops! The page you're looking for doesn't exist. Let's get you back on track with your learning journey."
      illustration={<NotFoundIllustration className="text-blue-500" />}
      actionButtons={[
        { label: 'Continue Learning', href: '/hub' },
        { label: 'Browse Courses', href: '/hub/courses', variant: 'outline' },
        { label: 'My Courses', href: '/hub/courses/my-courses', variant: 'outline' },
      ]}
      className="bg-gradient-to-br from-blue-50 to-purple-50"
    />
  );
}
