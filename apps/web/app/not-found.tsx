import { ErrorPageBase } from '@/components/errors/error-page-base';
import { NotFoundIllustration } from '@/components/errors/error-illustrations';

export default function NotFound() {
  return (
    <ErrorPageBase
      errorCode={404}
      title="Page Not Found"
      description="The page you're looking for doesn't exist or has been moved."
      illustration={<NotFoundIllustration />}
      actionButtons={[
        { label: 'Go Home', href: '/' },
        { label: 'Browse Courses', href: '/hub/courses', variant: 'outline' },
      ]}
    />
  );
}
