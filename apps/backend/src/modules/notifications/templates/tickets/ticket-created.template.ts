import { getBaseEmailTemplate } from '../base.template';

export interface TicketCreatedData {
  userName: string;
  ticketId: string;
  subject: string;
  category: string;
  priority: string;
  ticketUrl: string;
}

export function getTicketCreatedTemplate(data: TicketCreatedData): string {
  return getBaseEmailTemplate({
    title: 'Support Ticket Created ✓',
    preheader: `Ticket #${data.ticketId}: ${data.subject}`,
    userName: data.userName,
    content: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 64px;">🎫</div>
      </div>
      
      <p style="margin: 0 0 16px 0;">Your support ticket has been successfully created. Our team will review it and respond as soon as possible.</p>
      
      <div style="background-color: #f0f9ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #075985;">Ticket Details:</p>
        <p style="margin: 0 0 4px 0; color: #0c4a6e;"><strong>Ticket ID:</strong> #${data.ticketId}</p>
        <p style="margin: 0 0 4px 0; color: #0c4a6e;"><strong>Subject:</strong> ${data.subject}</p>
        <p style="margin: 0 0 4px 0; color: #0c4a6e;"><strong>Category:</strong> ${data.category}</p>
        <p style="margin: 0; color: #0c4a6e;"><strong>Priority:</strong> ${data.priority}</p>
      </div>
      
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #78350f;">
          <strong>Expected Response Time:</strong><br>
          ${data.priority === 'urgent' ? '2-4 hours' : data.priority === 'high' ? '1 business day' : '2-3 business days'}
        </p>
      </div>
      
      <p style="margin: 0;">You can track your ticket status and add additional information by clicking below.</p>
    `,
    actionUrl: data.ticketUrl,
    actionText: 'View Ticket',
    footerText: 'You\'ll receive updates via email when there are changes to your ticket.',
  });
}
