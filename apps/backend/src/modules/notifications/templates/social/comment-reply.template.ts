import { getBaseEmailTemplate } from '../base.template';

export interface CommentReplyData {
  userName: string;
  replierName: string;
  replyPreview: string;
  postUrl: string;
  originalComment: string;
}

export function getCommentReplyTemplate(data: CommentReplyData): string {
  return getBaseEmailTemplate({
    title: 'New Reply to Your Comment 💬',
    preheader: `${data.replierName} replied to your comment`,
    userName: data.userName,
    content: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 64px;">💬</div>
      </div>
      
      <p style="margin: 0 0 16px 0;"><strong>${data.replierName}</strong> replied to your comment!</p>
      
      <div style="background-color: #f4f4f5; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p style="margin: 0 0 8px 0; font-size: 12px; color: #71717a;">Your comment:</p>
        <p style="margin: 0; color: #52525b; font-style: italic;">"${data.originalComment}"</p>
      </div>
      
      <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0 0 8px 0; font-size: 12px; color: #075985; font-weight: 600;">${data.replierName}'s reply:</p>
        <p style="margin: 0; color: #0c4a6e; font-style: italic;">"${data.replyPreview}"</p>
      </div>
      
      <p style="margin: 0;">Click below to view the full conversation and respond!</p>
    `,
    actionUrl: data.postUrl,
    actionText: 'View Conversation',
  });
}
