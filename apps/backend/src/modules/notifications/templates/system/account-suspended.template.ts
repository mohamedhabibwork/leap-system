import { getBaseEmailTemplate } from '../base.template';

export interface AccountSuspendedData {
  userName: string;
  suspensionReason: string;
  suspendedUntil?: string;
  appealUrl: string;
  supportEmail: string;
}

export function getAccountSuspendedTemplate(data: AccountSuspendedData): string {
  return getBaseEmailTemplate({
    title: 'Account Suspended',
    preheader: 'Your account has been temporarily suspended',
    userName: data.userName,
    content: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 64px;">🚫</div>
      </div>
      
      <p style="margin: 0 0 16px 0;">Your LEAP LMS account has been temporarily suspended.</p>
      
      <div style="background-color: #fef2f2; border-radius: 8px; padding: 20px; margin: 20px 0; border: 2px solid #ef4444;">
        <p style="margin: 0 0 12px 0; font-weight: 600; color: #991b1b;">Suspension Details:</p>
        <p style="margin: 0 0 8px 0; color: #7f1d1d;"><strong>Reason:</strong> ${data.suspensionReason}</p>
        ${data.suspendedUntil ? `
          <p style="margin: 0; color: #7f1d1d;"><strong>Suspended Until:</strong> ${data.suspendedUntil}</p>
        ` : `
          <p style="margin: 0; color: #7f1d1d;"><strong>Duration:</strong> Indefinite (pending review)</p>
        `}
      </div>
      
      <p style="margin: 0 0 16px 0;">During this suspension period, you will not be able to access your account or any platform features.</p>
      
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #92400e;">What You Can Do:</p>
        <ul style="margin: 0; padding-left: 20px; color: #78350f;">
          <li>Review our Terms of Service and Community Guidelines</li>
          <li>Submit an appeal if you believe this is a mistake</li>
          <li>Contact support for more information</li>
        </ul>
      </div>
      
      <p style="margin: 0 0 16px 0;">If you believe this suspension was made in error, you can submit an appeal for review.</p>
      
      <p style="margin: 0 0 16px 0;">For questions or concerns, please contact our support team at <strong>${data.supportEmail}</strong>.</p>
      
      <p style="margin: 0;">Click below to submit an appeal or learn more about this suspension.</p>
    `,
    actionUrl: data.appealUrl,
    actionText: 'Submit Appeal',
    footerText: 'This is an automated message. Replies to this email are not monitored.',
  });
}
