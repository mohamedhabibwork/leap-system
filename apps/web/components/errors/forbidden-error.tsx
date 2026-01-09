import { ErrorPageBase } from './error-page-base';
import { ForbiddenIllustration } from './error-illustrations';

interface ForbiddenErrorProps {
  userRole?: 'admin' | 'instructor' | 'user';
  message?: string;
}

export function ForbiddenError({ userRole = 'user', message }: ForbiddenErrorProps) {
  const getRoleSpecificButtons = () => {
    switch (userRole) {
      case 'admin':
        return [
          { label: 'Admin Dashboard', href: '/admin' },
          { label: 'System Logs', href: '/admin/logs', variant: 'outline' as const },
        ];
      case 'instructor':
        return [
          { label: 'Instructor Dashboard', href: '/hub/instructor' },
          { label: 'My Courses', href: '/hub/instructor/courses', variant: 'outline' as const },
        ];
      default:
        return [
          { label: 'Browse Courses', href: '/hub/courses' },
          { label: 'Go Home', href: '/hub', variant: 'outline' as const },
        ];
    }
  };

  const getDescription = () => {
    if (message) return message;
    
    switch (userRole) {
      case 'admin':
        return 'You do not have sufficient permissions to access this resource. Please check your admin privileges.';
      case 'instructor':
        return 'This resource is restricted. You may need additional permissions or enrollment to access it.';
      default:
        return 'You don\'t have permission to access this page. You may need to enroll in the course or upgrade your account.';
    }
  };

  return (
    <ErrorPageBase
      errorCode={403}
      title="Access Forbidden"
      description={getDescription()}
      illustration={<ForbiddenIllustration />}
      actionButtons={getRoleSpecificButtons()}
    />
  );
}
