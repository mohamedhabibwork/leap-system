import { getBaseEmailTemplate } from '../base.template';

export interface PageFollowedData {
  userName: string;
  followerName: string;
  pageName: string;
  pageUrl: string;
  totalFollowers: number;
}

export function getPageFollowedTemplate(data: PageFollowedData): string {
  return getBaseEmailTemplate({
    title: `New Follower for ${data.pageName}!`,
    preheader: `${data.followerName} started following your page`,
    userName: data.userName,
    content: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 48px;">👥</div>
      </div>
      
      <p style="margin: 0 0 16px 0;"><strong>${data.followerName}</strong> started following your page <strong>${data.pageName}</strong>!</p>
      
      <div style="background-color: #f0f9ff; border-radius: 6px; padding: 12px; margin: 16px 0;">
        <p style="margin: 0; color: #0c4a6e; text-align: center;">
          Your page now has <strong>${data.totalFollowers}</strong> follower${data.totalFollowers !== 1 ? 's' : ''}!
        </p>
      </div>
      
      <p style="margin: 0;">Keep growing your community!</p>
    `,
    actionUrl: data.pageUrl,
    actionText: 'View Page',
  });
}
