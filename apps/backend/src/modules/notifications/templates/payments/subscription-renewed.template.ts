import { getBaseEmailTemplate } from '../base.template';

export interface SubscriptionRenewedData {
  userName: string;
  planName: string;
  amount: string;
  currency: string;
  nextBillingDate: string;
  transactionId: string;
  subscriptionUrl: string;
}

export function getSubscriptionRenewedTemplate(data: SubscriptionRenewedData): string {
  return getBaseEmailTemplate({
    title: 'Subscription Renewed ✓',
    preheader: `Your ${data.planName} subscription has been renewed`,
    userName: data.userName,
    content: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 64px;">🔄</div>
      </div>
      
      <p style="margin: 0 0 16px 0;">Your subscription has been successfully renewed! Thank you for continuing with us.</p>
      
      <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 12px 0; font-weight: 600; color: #166534;">Renewal Details:</p>
        <p style="margin: 0 0 8px 0; color: #15803d;"><strong>Plan:</strong> ${data.planName}</p>
        <p style="margin: 0 0 8px 0; color: #15803d;"><strong>Amount Paid:</strong> ${data.currency} ${data.amount}</p>
        <p style="margin: 0 0 8px 0; color: #15803d;"><strong>Next Billing Date:</strong> ${data.nextBillingDate}</p>
        <p style="margin: 0; color: #15803d;"><strong>Transaction ID:</strong> ${data.transactionId}</p>
      </div>
      
      <div style="background-color: #f0f9ff; border-radius: 6px; padding: 12px; margin: 16px 0;">
        <p style="margin: 0; color: #0c4a6e; text-align: center;">
          Your subscription will automatically renew on <strong>${data.nextBillingDate}</strong>
        </p>
      </div>
      
      <p style="margin: 0;">You can manage your subscription, update payment methods, or cancel at any time.</p>
    `,
    actionUrl: data.subscriptionUrl,
    actionText: 'Manage Subscription',
  });
}
