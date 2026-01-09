import { getBaseEmailTemplate } from '../base.template';

export interface PostReactionData {
  userName: string;
  reactorName: string;
  reactionType: string; // 'like', 'love', 'celebrate', etc.
  postUrl: string;
  totalReactions: number;
  postTitle?: string;
}

export function getPostReactionTemplate(data: PostReactionData): string {
  const reactionEmojis: Record<string, string> = {
    like: '👍',
    love: '❤️',
    celebrate: '🎉',
    insightful: '💡',
    curious: '🤔',
  };
  
  const emoji = reactionEmojis[data.reactionType] || '👍';
  
  return getBaseEmailTemplate({
    title: `${data.reactorName} Reacted to Your Post ${emoji}`,
    preheader: `${data.reactorName} reacted to your post`,
    userName: data.userName,
    content: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 64px;">${emoji}</div>
      </div>
      
      <p style="margin: 0 0 16px 0;"><strong>${data.reactorName}</strong> reacted to your post${data.postTitle ? ` "${data.postTitle}"` : ''} with a ${data.reactionType}!</p>
      
      ${data.totalReactions > 1 ? `
        <div style="background-color: #f0f9ff; border-radius: 6px; padding: 12px; margin: 16px 0;">
          <p style="margin: 0; color: #0c4a6e; text-align: center;">
            Your post now has <strong>${data.totalReactions}</strong> reactions!
          </p>
        </div>
      ` : ''}
      
      <p style="margin: 0;">Click below to view your post and see all reactions!</p>
    `,
    actionUrl: data.postUrl,
    actionText: 'View Post',
  });
}
