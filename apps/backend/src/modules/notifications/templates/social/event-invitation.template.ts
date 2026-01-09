import { getBaseEmailTemplate } from '../base.template';

export interface EventInvitationData {
  userName: string;
  eventName: string;
  invitedByName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventUrl: string;
  eventDescription?: string;
}

export function getEventInvitationTemplate(data: EventInvitationData): string {
  return getBaseEmailTemplate({
    title: 'Event Invitation 📅',
    preheader: `${data.invitedByName} invited you to ${data.eventName}`,
    userName: data.userName,
    content: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 64px;">📅</div>
      </div>
      
      <p style="margin: 0 0 16px 0;"><strong>${data.invitedByName}</strong> has invited you to attend <strong>${data.eventName}</strong>!</p>
      
      <div style="background-color: #dbeafe; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #1e40af;">Event Details:</p>
        <p style="margin: 0 0 4px 0; color: #1e3a8a;"><strong>Date:</strong> ${data.eventDate}</p>
        <p style="margin: 0 0 4px 0; color: #1e3a8a;"><strong>Time:</strong> ${data.eventTime}</p>
        <p style="margin: 0; color: #1e3a8a;"><strong>Location:</strong> ${data.eventLocation}</p>
      </div>
      
      ${data.eventDescription ? `
        <div style="background-color: #f4f4f5; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; color: #52525b;">${data.eventDescription}</p>
        </div>
      ` : ''}
      
      <p style="margin: 0;">Click below to RSVP and view full event details!</p>
    `,
    actionUrl: data.eventUrl,
    actionText: 'RSVP to Event',
  });
}
