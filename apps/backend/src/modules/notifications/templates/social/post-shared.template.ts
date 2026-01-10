import { getBaseEmailTemplate } from '../base.template';

export interface PostSharedData {
  userName: string;
  sharerName: string;
  postUrl: string;
  postTitle?: string;
  shareCount: number;
}

export function getPostSharedTemplate(data: PostSharedData): string {
  return getBaseEmailTemplate({
    title: `${data.sharerName} Shared Your Post!`,
    preheader: `${data.sharerName} shared your post with their network`,
    userName: data.userName,
    content: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 48px;">📤</div>
      </div>
      
      <p style="margin: 0 0 16px 0;"><strong>${data.sharerName}</strong> shared your post${data.postTitle ? ` "${data.postTitle}"` : ''} with their network!</p>
      
      ${data.shareCount > 1 ? `
        <div style="background-color: #f0f9ff; border-radius: 6px; padding: 12px; margin: 16px 0;">
          <p style="margin: 0; color: #0c4a6e; text-align: center;">
            Your post has been shared <strong>${data.shareCount}</strong> times!
          </p>
        </div>
      ` : ''}
      
      <p style="margin: 0;">Your content is resonating with the community!</p>
    `,
    actionUrl: data.postUrl,
    actionText: 'View Post',
  });
}
