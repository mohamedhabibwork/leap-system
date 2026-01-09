import { ErrorPageBase } from './error-page-base';
import { UnauthorizedIllustration } from './error-illustrations';

interface UnauthorizedErrorProps {
  message?: string;
  isSessionExpired?: boolean;
}

export function UnauthorizedError({ message, isSessionExpired = false }: UnauthorizedErrorProps) {
  const getDescription = () => {
    if (message) return message;
    if (isSessionExpired) {
      return 'Your session has expired for security reasons. Please log in again to continue.';
    }
    return 'You need to be logged in to access this page. Please sign in to continue.';
  };

  return (
    <ErrorPageBase
      errorCode={401}
      title={isSessionExpired ? 'Session Expired' : 'Authentication Required'}
      description={getDescription()}
      illustration={<UnauthorizedIllustration />}
      actionButtons={[
        { label: 'Sign In', href: '/login' },
        { label: 'Create Account', href: '/signup', variant: 'outline' },
      ]}
    />
  );
}
