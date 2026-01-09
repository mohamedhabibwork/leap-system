import { getBaseEmailTemplate } from '../base.template';

export interface FriendRequestAcceptedData {
  userName: string;
  acceptedByName: string;
  profileUrl: string;
}

export function getFriendRequestAcceptedTemplate(data: FriendRequestAcceptedData): string {
  return getBaseEmailTemplate({
    title: 'Friend Request Accepted! 🎉',
    preheader: `${data.acceptedByName} accepted your friend request`,
    userName: data.userName,
    content: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 64px;">🤝</div>
      </div>
      
      <p style="margin: 0 0 16px 0;">Great news! <strong>${data.acceptedByName}</strong> has accepted your friend request!</p>
      
      <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0; color: #15803d; text-align: center;">
          You and ${data.acceptedByName} are now connected! You can now see each other's posts, share content, and stay in touch.
        </p>
      </div>
      
      <p style="margin: 0;">Click below to visit their profile and start interacting!</p>
    `,
    actionUrl: data.profileUrl,
    actionText: 'Visit Profile',
  });
}
