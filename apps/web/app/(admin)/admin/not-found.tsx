import { ErrorPageBase } from '@/components/errors/error-page-base';
import { NotFoundIllustration } from '@/components/errors/error-illustrations';

export default function AdminNotFound() {
  return (
    <ErrorPageBase
      errorCode={404}
      title="Admin Resource Not Found"
      description="The requested admin resource could not be found. Check the URL or navigate to available admin sections."
      illustration={<NotFoundIllustration className="text-red-500" />}
      actionButtons={[
        { label: 'Admin Dashboard', href: '/admin' },
        { label: 'System Status', href: '/admin/status', variant: 'outline' },
        { label: 'Documentation', href: '/admin/docs', variant: 'outline' },
      ]}
      className="bg-gradient-to-br from-gray-50 to-red-50"
    />
  );
}
