import { getBaseEmailTemplate } from '../base.template';

export interface TicketStatusChangedData {
  userName: string;
  ticketId: string;
  subject: string;
  oldStatus: string;
  newStatus: string;
  ticketUrl: string;
  statusNote?: string;
}

export function getTicketStatusChangedTemplate(data: TicketStatusChangedData): string {
  const statusColors: Record<string, { bg: string; text: string }> = {
    open: { bg: '#dbeafe', text: '#1e40af' },
    in_progress: { bg: '#fef3c7', text: '#92400e' },
    waiting: { bg: '#fef2f2', text: '#991b1b' },
    resolved: { bg: '#f0fdf4', text: '#166534' },
    closed: { bg: '#f4f4f5', text: '#3f3f46' },
  };
  
  const color = statusColors[data.newStatus] || statusColors.open;
  
  return getBaseEmailTemplate({
    title: 'Ticket Status Updated',
    preheader: `Ticket #${data.ticketId} status changed to ${data.newStatus}`,
    userName: data.userName,
    content: `
      <p style="margin: 0 0 16px 0;">The status of your support ticket <strong>#${data.ticketId}</strong> has been updated.</p>
      
      <div style="background-color: #f4f4f5; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #71717a;">Subject:</p>
        <p style="margin: 0; color: #18181b;">${data.subject}</p>
      </div>
      
      <div style="background-color: ${color.bg}; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 12px 0; font-weight: 600; color: ${color.text};">Status Change:</p>
        <div style="display: flex; align-items: center; justify-content: center;">
          <span style="color: #71717a; text-decoration: line-through;">${data.oldStatus}</span>
          <span style="margin: 0 12px; color: ${color.text};">→</span>
          <span style="color: ${color.text}; font-weight: 700; font-size: 18px;">${data.newStatus.toUpperCase()}</span>
        </div>
      </div>
      
      ${data.statusNote ? `
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0 0 8px 0; font-weight: 600; color: #92400e;">Note:</p>
          <p style="margin: 0; color: #78350f;">${data.statusNote}</p>
        </div>
      ` : ''}
      
      <p style="margin: 0;">Click below to view your ticket and any additional updates!</p>
    `,
    actionUrl: data.ticketUrl,
    actionText: 'View Ticket',
  });
}
