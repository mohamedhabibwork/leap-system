import { ErrorPageBase } from './error-page-base';
import { BadRequestIllustration } from './error-illustrations';

interface BadRequestErrorProps {
  message?: string;
  errors?: string[];
  returnUrl?: string;
}

export function BadRequestError({ message, errors, returnUrl }: BadRequestErrorProps) {
  const getDescription = () => {
    if (message) return message;
    if (errors && errors.length > 0) {
      return `Please correct the following errors: ${errors.join(', ')}`;
    }
    return 'The request could not be processed. Please check your input and try again.';
  };

  const actionButtons = [
    { label: 'Go Back', href: returnUrl || '/', variant: 'default' as const },
    { label: 'Help Center', href: '/help', variant: 'outline' as const },
  ];

  return (
    <ErrorPageBase
      errorCode={400}
      title="Bad Request"
      description={getDescription()}
      illustration={<BadRequestIllustration />}
      actionButtons={actionButtons}
    />
  );
}
