import { getBaseEmailTemplate } from '../base.template';

export interface PostCommentedData {
  userName: string;
  commenterName: string;
  postUrl: string;
  commentPreview: string;
  postTitle?: string;
}

export function getPostCommentedTemplate(data: PostCommentedData): string {
  return getBaseEmailTemplate({
    title: 'New Comment on Your Post 💬',
    preheader: `${data.commenterName} commented on your post`,
    userName: data.userName,
    content: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 64px;">💬</div>
      </div>
      
      <p style="margin: 0 0 16px 0;"><strong>${data.commenterName}</strong> commented on your post${data.postTitle ? ` "${data.postTitle}"` : ''}!</p>
      
      <div style="background-color: #f4f4f5; border-left: 4px solid #71717a; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #52525b; font-style: italic;">"${data.commentPreview}"</p>
      </div>
      
      <p style="margin: 0;">Click below to view the full comment and join the conversation!</p>
    `,
    actionUrl: data.postUrl,
    actionText: 'View Comment',
  });
}
