import { ErrorPageBase } from './error-page-base';
import { ServiceUnavailableIllustration } from './error-illustrations';

interface ServiceUnavailableProps {
  estimatedTime?: string;
  statusPageUrl?: string;
  message?: string;
}

export function ServiceUnavailable({ 
  estimatedTime, 
  statusPageUrl = '/status',
  message 
}: ServiceUnavailableProps) {
  const getDescription = () => {
    if (message) return message;
    if (estimatedTime) {
      return `We're currently performing scheduled maintenance. Service should be restored in approximately ${estimatedTime}.`;
    }
    return 'Our service is temporarily unavailable. We\'re working hard to restore it as quickly as possible.';
  };

  const actionButtons: Array<{ label: string; href: string; variant?: 'default' | 'outline' | 'ghost' }> = [
    { label: 'Refresh Page', href: '', variant: 'default' },
  ];

  if (statusPageUrl) {
    actionButtons.push({ 
      label: 'Status Page', 
      href: statusPageUrl, 
      variant: 'outline' 
    });
  }

  return (
    <ErrorPageBase
      errorCode={503}
      title="Service Unavailable"
      description={getDescription()}
      illustration={<ServiceUnavailableIllustration />}
      actionButtons={actionButtons}
    />
  );
}
