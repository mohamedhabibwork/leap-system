import { getBaseEmailTemplate } from '../base.template';

export interface SubscriptionCancelledData {
  userName: string;
  planName: string;
  cancelledDate: string;
  accessUntil: string;
  cancellationReason?: string;
  reactivateUrl: string;
}

export function getSubscriptionCancelledTemplate(data: SubscriptionCancelledData): string {
  return getBaseEmailTemplate({
    title: 'Subscription Cancelled',
    preheader: `Your ${data.planName} subscription has been cancelled`,
    userName: data.userName,
    content: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 64px;">😔</div>
      </div>
      
      <p style="margin: 0 0 16px 0;">We're sorry to see you go! Your <strong>${data.planName}</strong> subscription has been cancelled.</p>
      
      <div style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; color: #52525b;"><strong>Plan:</strong> ${data.planName}</p>
        <p style="margin: 0 0 8px 0; color: #52525b;"><strong>Cancelled On:</strong> ${data.cancelledDate}</p>
        <p style="margin: 0; color: #52525b;"><strong>Access Until:</strong> ${data.accessUntil}</p>
      </div>
      
      ${data.cancellationReason ? `
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0 0 8px 0; font-weight: 600; color: #92400e;">Cancellation Reason:</p>
          <p style="margin: 0; color: #78350f;">${data.cancellationReason}</p>
        </div>
      ` : ''}
      
      <div style="background-color: #dbeafe; border-radius: 6px; padding: 12px; margin: 16px 0;">
        <p style="margin: 0; color: #1e3a8a; text-align: center;">
          You'll continue to have access to your subscription benefits until <strong>${data.accessUntil}</strong>
        </p>
      </div>
      
      <p style="margin: 0 0 16px 0;">Your feedback helps us improve! If you'd like to share why you cancelled, we'd appreciate hearing from you.</p>
      
      <p style="margin: 0;">Changed your mind? You can reactivate your subscription at any time!</p>
    `,
    actionUrl: data.reactivateUrl,
    actionText: 'Reactivate Subscription',
    footerText: 'We hope to see you back soon! You\'re always welcome to return.',
  });
}
