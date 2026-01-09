import { getBaseEmailTemplate } from '../base.template';

export interface TicketReopenedData {
  userName: string;
  ticketId: string;
  subject: string;
  reopenedBy: string;
  reason?: string;
  ticketUrl: string;
}

export function getTicketReopenedTemplate(data: TicketReopenedData): string {
  return getBaseEmailTemplate({
    title: 'Ticket Reopened',
    preheader: `Ticket #${data.ticketId} has been reopened`,
    userName: data.userName,
    content: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 64px;">🔄</div>
      </div>
      
      <p style="margin: 0 0 16px 0;">Your support ticket <strong>#${data.ticketId}</strong> has been reopened by <strong>${data.reopenedBy}</strong>.</p>
      
      <div style="background-color: #f4f4f5; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #71717a;">Subject:</p>
        <p style="margin: 0; color: #18181b;">${data.subject}</p>
      </div>
      
      ${data.reason ? `
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0 0 8px 0; font-weight: 600; color: #92400e;">Reason for Reopening:</p>
          <p style="margin: 0; color: #78350f;">${data.reason}</p>
        </div>
      ` : ''}
      
      <p style="margin: 0 0 16px 0;">Our support team will review the ticket and provide additional assistance to fully resolve your issue.</p>
      
      <p style="margin: 0;">Click below to view the ticket and add any additional information that might help!</p>
    `,
    actionUrl: data.ticketUrl,
    actionText: 'View Ticket',
    footerText: 'We\'re committed to resolving your issue completely.',
  });
}
