import { getBaseEmailTemplate } from '../base.template';

export interface TicketAssignedData {
  userName: string;
  ticketId: string;
  subject: string;
  agentName: string;
  ticketUrl: string;
}

export function getTicketAssignedTemplate(data: TicketAssignedData): string {
  return getBaseEmailTemplate({
    title: 'Ticket Assigned to Agent',
    preheader: `Ticket #${data.ticketId} has been assigned to ${data.agentName}`,
    userName: data.userName,
    content: `
      <p style="margin: 0 0 16px 0;">Good news! Your support ticket <strong>#${data.ticketId}</strong> has been assigned to one of our support agents.</p>
      
      <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #166534;">Assigned Agent:</p>
        <p style="margin: 0; color: #15803d; font-size: 18px;">${data.agentName}</p>
      </div>
      
      <div style="background-color: #f4f4f5; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0 0 4px 0; color: #52525b;"><strong>Ticket:</strong> #${data.ticketId}</p>
        <p style="margin: 0; color: #52525b;"><strong>Subject:</strong> ${data.subject}</p>
      </div>
      
      <p style="margin: 0 0 16px 0;">${data.agentName} is now working on your issue and will respond shortly with an update or solution.</p>
      
      <p style="margin: 0;">Click below to view your ticket and any updates!</p>
    `,
    actionUrl: data.ticketUrl,
    actionText: 'View Ticket',
  });
}
