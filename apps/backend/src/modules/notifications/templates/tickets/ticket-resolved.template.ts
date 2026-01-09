import { getBaseEmailTemplate } from '../base.template';

export interface TicketResolvedData {
  userName: string;
  ticketId: string;
  subject: string;
  resolvedBy: string;
  resolution: string;
  ticketUrl: string;
  feedbackUrl?: string;
}

export function getTicketResolvedTemplate(data: TicketResolvedData): string {
  return getBaseEmailTemplate({
    title: 'Ticket Resolved ✓',
    preheader: `Ticket #${data.ticketId} has been marked as resolved`,
    userName: data.userName,
    content: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 64px;">✅</div>
      </div>
      
      <p style="margin: 0 0 16px 0;">Your support ticket <strong>#${data.ticketId}</strong> has been marked as resolved by <strong>${data.resolvedBy}</strong>.</p>
      
      <div style="background-color: #f4f4f5; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #71717a;">Subject:</p>
        <p style="margin: 0; color: #18181b;">${data.subject}</p>
      </div>
      
      <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #166534;">Resolution:</p>
        <p style="margin: 0; color: #15803d;">${data.resolution}</p>
      </div>
      
      <p style="margin: 0 0 16px 0;">If your issue has been fully resolved, the ticket will be automatically closed in 48 hours.</p>
      
      <p style="margin: 0 0 16px 0;">If you're satisfied with the resolution, please consider providing feedback on your support experience!</p>
      
      <p style="margin: 0;">If your issue is NOT resolved, you can reopen the ticket by replying.</p>
    `,
    actionUrl: data.ticketUrl,
    actionText: 'View Ticket',
    secondaryActionUrl: data.feedbackUrl,
    secondaryActionText: data.feedbackUrl ? 'Rate Support' : undefined,
    footerText: 'If this issue reoccurs, please create a new ticket with reference to this one.',
  });
}
