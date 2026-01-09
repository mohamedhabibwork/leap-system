import { getBaseEmailTemplate } from '../base.template';

export interface FriendRequestReceivedData {
  userName: string;
  fromUserName: string;
  fromUserProfileUrl: string;
  requestUrl: string;
  mutualFriends?: number;
}

export function getFriendRequestReceivedTemplate(data: FriendRequestReceivedData): string {
  return getBaseEmailTemplate({
    title: 'New Friend Request! 👥',
    preheader: `${data.fromUserName} sent you a friend request`,
    userName: data.userName,
    content: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 64px;">👥</div>
      </div>
      
      <p style="margin: 0 0 16px 0;"><strong>${data.fromUserName}</strong> wants to connect with you on LEAP PM!</p>
      
      ${data.mutualFriends && data.mutualFriends > 0 ? `
        <div style="background-color: #f0f9ff; border-radius: 6px; padding: 12px; margin: 16px 0;">
          <p style="margin: 0; color: #0c4a6e; text-align: center;">
            👥 You have <strong>${data.mutualFriends}</strong> mutual ${data.mutualFriends === 1 ? 'friend' : 'friends'}
          </p>
        </div>
      ` : ''}
      
      <p style="margin: 0 0 16px 0;">Accepting this request will allow you to see each other's posts, share content, and stay connected on the platform.</p>
      
      <p style="margin: 0;">Click below to view their profile and respond to the friend request!</p>
    `,
    actionUrl: data.requestUrl,
    actionText: 'View Request',
    secondaryActionUrl: data.fromUserProfileUrl,
    secondaryActionText: 'View Profile',
  });
}
