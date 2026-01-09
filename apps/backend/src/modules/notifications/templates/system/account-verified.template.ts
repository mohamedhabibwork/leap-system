import { getBaseEmailTemplate } from '../base.template';

export interface AccountVerifiedData {
  userName: string;
  dashboardUrl: string;
}

export function getAccountVerifiedTemplate(data: AccountVerifiedData): string {
  return getBaseEmailTemplate({
    title: 'Email Verified Successfully! ✓',
    preheader: 'Your email has been verified',
    userName: data.userName,
    content: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 64px;">✅</div>
      </div>
      
      <p style="margin: 0 0 16px 0;">Congratulations! Your email address has been successfully verified.</p>
      
      <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0; color: #15803d; text-align: center; font-weight: 600;">
          🎉 Your account is now fully activated!
        </p>
      </div>
      
      <p style="margin: 0 0 16px 0;">You now have full access to all platform features, including:</p>
      
      <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #52525b;">
        <li>Browse and enroll in courses</li>
        <li>Connect with other learners</li>
        <li>Access job opportunities</li>
        <li>Participate in community discussions</li>
      </ul>
      
      <p style="margin: 0;">Click below to explore the platform and start your learning journey!</p>
    `,
    actionUrl: data.dashboardUrl,
    actionText: 'Go to Dashboard',
  });
}
