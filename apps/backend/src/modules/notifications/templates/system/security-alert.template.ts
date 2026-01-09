import { getBaseEmailTemplate } from '../base.template';

export interface SecurityAlertData {
  userName: string;
  alertType: string;
  detectedAt: string;
  ipAddress: string;
  location?: string;
  device?: string;
  securityUrl: string;
}

export function getSecurityAlertTemplate(data: SecurityAlertData): string {
  return getBaseEmailTemplate({
    title: '⚠️ Security Alert: Unusual Activity Detected',
    preheader: 'We detected unusual activity on your account',
    userName: data.userName,
    content: `
      <div style="background-color: #fef2f2; border-radius: 8px; padding: 20px; margin: 20px 0; border: 2px solid #ef4444;">
        <div style="text-align: center; font-size: 48px; margin-bottom: 10px;">⚠️</div>
        <p style="margin: 0; text-align: center; font-size: 18px; color: #991b1b; font-weight: 600;">
          Security Alert
        </p>
      </div>
      
      <p style="margin: 0 0 16px 0;">We detected unusual activity on your account and wanted to make sure it was you.</p>
      
      <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 12px 0; font-weight: 600; color: #92400e;">Activity Details:</p>
        <p style="margin: 0 0 8px 0; color: #78350f;"><strong>Alert Type:</strong> ${data.alertType}</p>
        <p style="margin: 0 0 8px 0; color: #78350f;"><strong>Detected At:</strong> ${data.detectedAt}</p>
        <p style="margin: 0 0 8px 0; color: #78350f;"><strong>IP Address:</strong> ${data.ipAddress}</p>
        ${data.location ? `<p style="margin: 0 0 8px 0; color: #78350f;"><strong>Location:</strong> ${data.location}</p>` : ''}
        ${data.device ? `<p style="margin: 0; color: #78350f;"><strong>Device:</strong> ${data.device}</p>` : ''}
      </div>
      
      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #991b1b;">Was this you?</p>
        <p style="margin: 0; color: #7f1d1d;">If this wasn't you, secure your account immediately by:</p>
        <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #7f1d1d;">
          <li>Changing your password right away</li>
          <li>Enabling two-factor authentication</li>
          <li>Reviewing recent account activity</li>
          <li>Logging out of all devices</li>
        </ul>
      </div>
      
      <p style="margin: 0;">Click below to review your security settings and secure your account!</p>
    `,
    actionUrl: data.securityUrl,
    actionText: 'Secure My Account',
    footerText: 'If you recognize this activity, no action is needed. Your account is safe.',
  });
}
