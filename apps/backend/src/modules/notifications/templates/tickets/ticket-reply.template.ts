import { getBaseEmailTemplate } from '../base.template';

export interface TicketReplyData {
  userName: string;
  ticketId: string;
  subject: string;
  replierName: string;
  replyPreview: string;
  ticketUrl: string;
}

export function getTicketReplyTemplate(data: TicketReplyData): string {
  return getBaseEmailTemplate({
    title: 'New Reply to Your Ticket 💬',
    preheader: `${data.replierName} replied to ticket #${data.ticketId}`,
    userName: data.userName,
    content: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 64px;">💬</div>
      </div>
      
      <p style="margin: 0 0 16px 0;"><strong>${data.replierName}</strong> has replied to your support ticket <strong>#${data.ticketId}</strong>.</p>
      
      <div style="background-color: #f4f4f5; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #71717a;">Subject:</p>
        <p style="margin: 0; color: #18181b;">${data.subject}</p>
      </div>
      
      <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0 0 8px 0; font-size: 12px; color: #075985; font-weight: 600;">${data.replierName}'s Reply:</p>
        <p style="margin: 0; color: #0c4a6e;">${data.replyPreview}</p>
      </div>
      
      <p style="margin: 0;">Click below to view the full reply and continue the conversation!</p>
    `,
    actionUrl: data.ticketUrl,
    actionText: 'View & Reply',
  });
}
