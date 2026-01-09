import { getBaseEmailTemplate } from '../base.template';

export interface SubscriptionExpiringData {
  userName: string;
  planName: string;
  expiryDate: string;
  daysRemaining: number;
  renewalAmount: string;
  currency: string;
  renewUrl: string;
}

export function getSubscriptionExpiringTemplate(data: SubscriptionExpiringData): string {
  return getBaseEmailTemplate({
    title: '⚠️ Subscription Expiring Soon!',
    preheader: `Your ${data.planName} subscription expires in ${data.daysRemaining} days`,
    userName: data.userName,
    content: `
      <div style="background-color: #fef2f2; border-radius: 8px; padding: 20px; margin: 20px 0; border: 2px solid #f59e0b;">
        <div style="text-align: center; font-size: 48px; margin-bottom: 10px;">⚠️</div>
        <p style="margin: 0; text-align: center; font-size: 18px; color: #b45309; font-weight: 600;">
          Your Subscription is Expiring Soon!
        </p>
      </div>
      
      <p style="margin: 0 0 16px 0;">Your <strong>${data.planName}</strong> subscription will expire soon. Don't lose access to your benefits!</p>
      
      <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; color: #78350f;"><strong>Plan:</strong> ${data.planName}</p>
        <p style="margin: 0 0 8px 0; color: #78350f;"><strong>Expires On:</strong> ${data.expiryDate}</p>
        <p style="margin: 0; color: #ef4444; font-weight: 600; font-size: 18px;">
          ⏰ ${data.daysRemaining} days remaining
        </p>
      </div>
      
      <div style="background-color: #f0fdf4; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #166534;">Renew Now for:</p>
        <p style="margin: 0; color: #15803d; font-size: 24px; font-weight: 700;">
          ${data.currency} ${data.renewalAmount}
        </p>
      </div>
      
      <p style="margin: 0 0 16px 0;">Renew now to avoid any interruption in your access to courses, content, and features!</p>
      
      <p style="margin: 0;">Click below to renew your subscription and continue learning!</p>
    `,
    actionUrl: data.renewUrl,
    actionText: 'Renew Now',
    footerText: 'Your subscription will not automatically renew. Manual renewal is required to continue.',
  });
}
