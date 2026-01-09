import { getBaseEmailTemplate } from '../base.template';

export interface EventReminderData {
  userName: string;
  eventName: string;
  eventTime: string;
  eventLocation: string;
  eventUrl: string;
  minutesUntilStart: number;
}

export function getEventReminderTemplate(data: EventReminderData): string {
  return getBaseEmailTemplate({
    title: '⏰ Event Starting Soon!',
    preheader: `${data.eventName} starts in ${data.minutesUntilStart} minutes`,
    userName: data.userName,
    content: `
      <div style="background-color: #fef2f2; border-radius: 8px; padding: 20px; margin: 20px 0; border: 2px solid #ef4444;">
        <div style="text-align: center; font-size: 48px; margin-bottom: 10px;">⏰</div>
        <p style="margin: 0; text-align: center; font-size: 18px; color: #991b1b; font-weight: 600;">
          Event Starting Soon!
        </p>
      </div>
      
      <p style="margin: 0 0 16px 0;">This is a friendly reminder that <strong>${data.eventName}</strong> starts in <strong>${data.minutesUntilStart} minutes</strong>!</p>
      
      <div style="background-color: #dbeafe; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #1e40af;">Event Details:</p>
        <p style="margin: 0 0 4px 0; color: #1e3a8a;"><strong>Event:</strong> ${data.eventName}</p>
        <p style="margin: 0 0 4px 0; color: #1e3a8a;"><strong>Time:</strong> ${data.eventTime}</p>
        <p style="margin: 0; color: #1e3a8a;"><strong>Location:</strong> ${data.eventLocation}</p>
      </div>
      
      <p style="margin: 0 0 16px 0;">Don't be late! Make sure you're ready to join.</p>
      
      <p style="margin: 0;">Click below to access the event now!</p>
    `,
    actionUrl: data.eventUrl,
    actionText: 'Join Event',
  });
}
