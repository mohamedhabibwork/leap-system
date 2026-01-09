import { getBaseEmailTemplate } from '../base.template';

export interface PaymentSuccessfulData {
  userName: string;
  amount: string;
  currency: string;
  transactionId: string;
  paymentMethod: string;
  itemDescription: string;
  paymentDate: string;
  receiptUrl?: string;
}

export function getPaymentSuccessfulTemplate(data: PaymentSuccessfulData): string {
  return getBaseEmailTemplate({
    title: 'Payment Successful! ✓',
    preheader: `Your payment of ${data.currency} ${data.amount} was processed successfully`,
    userName: data.userName,
    content: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 64px;">✅</div>
      </div>
      
      <p style="margin: 0 0 16px 0;">Thank you! Your payment has been processed successfully.</p>
      
      <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 12px 0; font-weight: 600; color: #166534;">Payment Details:</p>
        <p style="margin: 0 0 8px 0; color: #15803d;"><strong>Amount:</strong> ${data.currency} ${data.amount}</p>
        <p style="margin: 0 0 8px 0; color: #15803d;"><strong>Transaction ID:</strong> ${data.transactionId}</p>
        <p style="margin: 0 0 8px 0; color: #15803d;"><strong>Payment Method:</strong> ${data.paymentMethod}</p>
        <p style="margin: 0 0 8px 0; color: #15803d;"><strong>Date:</strong> ${data.paymentDate}</p>
        <p style="margin: 0; color: #15803d;"><strong>Description:</strong> ${data.itemDescription}</p>
      </div>
      
      <div style="background-color: #f0f9ff; border-radius: 6px; padding: 12px; margin: 16px 0;">
        <p style="margin: 0; color: #0c4a6e; text-align: center;">
          A receipt has been sent to your email and is also available in your account.
        </p>
      </div>
      
      ${data.receiptUrl ? `
        <p style="margin: 0;">Click below to download your receipt!</p>
      ` : ''}
    `,
    actionUrl: data.receiptUrl || '#',
    actionText: data.receiptUrl ? 'Download Receipt' : undefined,
    footerText: 'If you have any questions about this payment, please contact our support team.',
  });
}
