import { getBaseEmailTemplate } from '../base.template';

export interface NewsletterConfirmationData {
  confirmationUrl: string;
}

export function getNewsletterConfirmationTemplate(data: NewsletterConfirmationData): string {
  const content = `
    <h1>Confirm Your Newsletter Subscription</h1>
    <p>Thank you for subscribing to our newsletter! Please click the button below to confirm your subscription.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.confirmationUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; rounded: 6px; font-weight: bold;">Confirm Subscription</a>
    </div>
    <p>If you did not sign up for this newsletter, you can safely ignore this email.</p>
  `;
  
  return getBaseEmailTemplate({ title: 'Confirm Subscription', content });
}
