import { getBaseEmailTemplate } from '../base.template';

export interface MentionInPostData {
  userName: string;
  mentionedByName: string;
  postUrl: string;
  postPreview: string;
}

export function getMentionInPostTemplate(data: MentionInPostData): string {
  return getBaseEmailTemplate({
    title: 'You Were Mentioned! @',
    preheader: `${data.mentionedByName} mentioned you in a post`,
    userName: data.userName,
    content: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 64px;">@</div>
      </div>
      
      <p style="margin: 0 0 16px 0;"><strong>${data.mentionedByName}</strong> mentioned you in a post!</p>
      
      <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #0c4a6e;">${data.postPreview}</p>
      </div>
      
      <p style="margin: 0;">Click below to view the post and join the conversation!</p>
    `,
    actionUrl: data.postUrl,
    actionText: 'View Post',
  });
}
