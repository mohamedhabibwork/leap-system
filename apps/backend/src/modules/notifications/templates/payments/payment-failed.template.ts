import { getBaseEmailTemplate } from '../base.template';

export interface PaymentFailedData {
  userName: string;
  amount: string;
  currency: string;
  failureReason: string;
  itemDescription: string;
  retryUrl: string;
}

export function getPaymentFailedTemplate(data: PaymentFailedData): string {
  return getBaseEmailTemplate({
    title: 'Payment Failed',
    preheader: `Your payment of ${data.currency} ${data.amount} could not be processed`,
    userName: data.userName,
    content: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 64px;">❌</div>
      </div>
      
      <p style="margin: 0 0 16px 0;">We were unable to process your recent payment. No charges have been made to your account.</p>
      
      <div style="background-color: #fef2f2; border-radius: 8px; padding: 20px; margin: 20px 0; border: 2px solid #ef4444;">
        <p style="margin: 0 0 12px 0; font-weight: 600; color: #991b1b;">Payment Details:</p>
        <p style="margin: 0 0 8px 0; color: #7f1d1d;"><strong>Amount:</strong> ${data.currency} ${data.amount}</p>
        <p style="margin: 0 0 8px 0; color: #7f1d1d;"><strong>Item:</strong> ${data.itemDescription}</p>
        <p style="margin: 0; color: #7f1d1d;"><strong>Failure Reason:</strong> ${data.failureReason}</p>
      </div>
      
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #92400e;">What to do next:</p>
        <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #78350f;">
          <li>Check that your payment method details are correct</li>
          <li>Ensure you have sufficient funds</li>
          <li>Contact your bank if the issue persists</li>
          <li>Try a different payment method</li>
        </ul>
      </div>
      
      <p style="margin: 0;">Click below to retry your payment with updated information.</p>
    `,
    actionUrl: data.retryUrl,
    actionText: 'Retry Payment',
    footerText: 'If you continue to experience issues, please contact our support team for assistance.',
  });
}
