import { getBaseEmailTemplate } from '../base.template';

export interface RefundProcessedData {
  userName: string;
  amount: string;
  currency: string;
  refundId: string;
  originalTransactionId: string;
  refundReason?: string;
  processingTime: string;
  paymentMethod: string;
}

export function getRefundProcessedTemplate(data: RefundProcessedData): string {
  return getBaseEmailTemplate({
    title: 'Refund Processed',
    preheader: `A refund of ${data.currency} ${data.amount} has been processed`,
    userName: data.userName,
    content: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 64px;">💰</div>
      </div>
      
      <p style="margin: 0 0 16px 0;">A refund has been processed for your recent transaction.</p>
      
      <div style="background-color: #f0f9ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 12px 0; font-weight: 600; color: #075985;">Refund Details:</p>
        <p style="margin: 0 0 8px 0; color: #0c4a6e;"><strong>Refund Amount:</strong> ${data.currency} ${data.amount}</p>
        <p style="margin: 0 0 8px 0; color: #0c4a6e;"><strong>Refund ID:</strong> ${data.refundId}</p>
        <p style="margin: 0 0 8px 0; color: #0c4a6e;"><strong>Original Transaction:</strong> ${data.originalTransactionId}</p>
        <p style="margin: 0; color: #0c4a6e;"><strong>Refunded To:</strong> ${data.paymentMethod}</p>
      </div>
      
      ${data.refundReason ? `
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0 0 8px 0; font-weight: 600; color: #92400e;">Refund Reason:</p>
          <p style="margin: 0; color: #78350f;">${data.refundReason}</p>
        </div>
      ` : ''}
      
      <div style="background-color: #dbeafe; border-radius: 6px; padding: 12px; margin: 16px 0;">
        <p style="margin: 0; color: #1e3a8a; text-align: center;">
          ⏱️ The refund will appear in your account within <strong>${data.processingTime}</strong>
        </p>
      </div>
      
      <p style="margin: 0;">If you have any questions about this refund, please contact our support team.</p>
    `,
    footerText: 'Refund processing times may vary depending on your payment provider.',
  });
}
