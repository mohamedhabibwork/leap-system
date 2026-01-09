import { getBaseEmailTemplate } from '../base.template';

export interface PasswordChangedData {
  userName: string;
  changedAt: string;
  ipAddress: string;
  location?: string;
  securityUrl: string;
}

export function getPasswordChangedTemplate(data: PasswordChangedData): string {
  return getBaseEmailTemplate({
    title: 'Password Changed Successfully',
    preheader: 'Your password was changed',
    userName: data.userName,
    content: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 64px;">🔐</div>
      </div>
      
      <p style="margin: 0 0 16px 0;">Your password has been successfully changed.</p>
      
      <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #166534;">Change Details:</p>
        <p style="margin: 0 0 4px 0; color: #15803d;"><strong>Date & Time:</strong> ${data.changedAt}</p>
        <p style="margin: 0 0 4px 0; color: #15803d;"><strong>IP Address:</strong> ${data.ipAddress}</p>
        ${data.location ? `<p style="margin: 0; color: #15803d;"><strong>Location:</strong> ${data.location}</p>` : ''}
      </div>
      
      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #991b1b;">Didn't make this change?</p>
        <p style="margin: 0; color: #7f1d1d;">If you didn't change your password, your account may be compromised. Please secure your account immediately by resetting your password and enabling two-factor authentication.</p>
      </div>
      
      <p style="margin: 0;">For your security, you may want to:</p>
      
      <ul style="margin: 8px 0 20px 0; padding-left: 20px; color: #52525b;">
        <li>Review your recent account activity</li>
        <li>Enable two-factor authentication</li>
        <li>Check your connected devices</li>
      </ul>
    `,
    actionUrl: data.securityUrl,
    actionText: 'Review Security Settings',
  });
}
