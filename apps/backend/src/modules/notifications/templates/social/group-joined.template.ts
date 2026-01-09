import { getBaseEmailTemplate } from '../base.template';

export interface GroupJoinedData {
  userName: string;
  groupName: string;
  joinedUserName: string;
  groupUrl: string;
}

export function getGroupJoinedTemplate(data: GroupJoinedData): string {
  return getBaseEmailTemplate({
    title: 'New Group Member',
    preheader: `${data.joinedUserName} joined ${data.groupName}`,
    userName: data.userName,
    content: `
      <p style="margin: 0 0 16px 0;"><strong>${data.joinedUserName}</strong> has joined your group <strong>${data.groupName}</strong>!</p>
      
      <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0; color: #15803d; text-align: center;">
          🎉 Your community is growing! Welcome the new member and help them feel at home.
        </p>
      </div>
      
      <p style="margin: 0;">Click below to visit the group and say hello!</p>
    `,
    actionUrl: data.groupUrl,
    actionText: 'View Group',
  });
}
