import { getBaseEmailTemplate } from '../base.template';

export interface GroupInvitationData {
  userName: string;
  groupName: string;
  invitedByName: string;
  groupUrl: string;
  memberCount?: number;
  groupDescription?: string;
}

export function getGroupInvitationTemplate(data: GroupInvitationData): string {
  return getBaseEmailTemplate({
    title: 'Group Invitation 🏘️',
    preheader: `${data.invitedByName} invited you to join ${data.groupName}`,
    userName: data.userName,
    content: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 64px;">🏘️</div>
      </div>
      
      <p style="margin: 0 0 16px 0;"><strong>${data.invitedByName}</strong> has invited you to join the group <strong>${data.groupName}</strong>!</p>
      
      ${data.groupDescription ? `
        <div style="background-color: #f4f4f5; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; color: #52525b;">${data.groupDescription}</p>
        </div>
      ` : ''}
      
      ${data.memberCount ? `
        <div style="background-color: #f0f9ff; border-radius: 6px; padding: 12px; margin: 16px 0;">
          <p style="margin: 0; color: #0c4a6e; text-align: center;">
            👥 ${data.memberCount} ${data.memberCount === 1 ? 'member' : 'members'}
          </p>
        </div>
      ` : ''}
      
      <p style="margin: 0 0 16px 0;">Join this community to connect with like-minded people, share ideas, and participate in discussions!</p>
      
      <p style="margin: 0;">Click below to view the group and accept the invitation!</p>
    `,
    actionUrl: data.groupUrl,
    actionText: 'View Group',
  });
}
