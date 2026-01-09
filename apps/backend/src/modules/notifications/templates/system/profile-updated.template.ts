import { getBaseEmailTemplate } from '../base.template';

export interface ProfileUpdatedData {
  userName: string;
  updatedFields: string[];
  updatedAt: string;
  profileUrl: string;
}

export function getProfileUpdatedTemplate(data: ProfileUpdatedData): string {
  return getBaseEmailTemplate({
    title: 'Profile Updated Successfully',
    preheader: 'Your profile information has been updated',
    userName: data.userName,
    content: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 64px;">✏️</div>
      </div>
      
      <p style="margin: 0 0 16px 0;">Your profile information has been successfully updated.</p>
      
      <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 12px 0; font-weight: 600; color: #166534;">Updated Fields:</p>
        <ul style="margin: 0; padding-left: 20px; color: #15803d;">
          ${data.updatedFields.map(field => `<li>${field}</li>`).join('')}
        </ul>
        <p style="margin: 16px 0 0 0; color: #15803d; font-size: 14px;">Updated on: ${data.updatedAt}</p>
      </div>
      
      <p style="margin: 0;">Click below to view your updated profile!</p>
    `,
    actionUrl: data.profileUrl,
    actionText: 'View Profile',
    footerText: 'If you didn\'t make these changes, please contact support immediately.',
  });
}
