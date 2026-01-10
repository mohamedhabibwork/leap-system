import { getBaseEmailTemplate } from '../base.template';

export interface PageLikedData {
  userName: string;
  likerName: string;
  pageName: string;
  pageUrl: string;
  totalLikes: number;
}

export function getPageLikedTemplate(data: PageLikedData): string {
  return getBaseEmailTemplate({
    title: `${data.likerName} Liked Your Page!`,
    preheader: `${data.likerName} liked ${data.pageName}`,
    userName: data.userName,
    content: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 48px;">❤️</div>
      </div>
      
      <p style="margin: 0 0 16px 0;"><strong>${data.likerName}</strong> liked your page <strong>${data.pageName}</strong>!</p>
      
      <div style="background-color: #f0f9ff; border-radius: 6px; padding: 12px; margin: 16px 0;">
        <p style="margin: 0; color: #0c4a6e; text-align: center;">
          Your page has <strong>${data.totalLikes}</strong> like${data.totalLikes !== 1 ? 's' : ''}!
        </p>
      </div>
      
      <p style="margin: 0;">People are loving your page!</p>
    `,
    actionUrl: data.pageUrl,
    actionText: 'View Page',
  });
}
