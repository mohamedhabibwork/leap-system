import { getBaseEmailTemplate } from '../base.template';

export interface InstructorMessageData {
  userName: string;
  instructorName: string;
  courseName: string;
  message: string;
  messageUrl: string;
}

export function getInstructorMessageTemplate(data: InstructorMessageData): string {
  return getBaseEmailTemplate({
    title: 'Message from Your Instructor',
    preheader: `${data.instructorName} sent you a message about ${data.courseName}`,
    userName: data.userName,
    content: `
      <p style="margin: 0 0 16px 0;">You have a new message from <strong>${data.instructorName}</strong> regarding <strong>${data.courseName}</strong>.</p>
      
      <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #075985;">From: ${data.instructorName}</p>
        <p style="margin: 0; color: #0c4a6e; white-space: pre-wrap;">${data.message}</p>
      </div>
      
      <p style="margin: 0;">Click below to view the full message and reply if needed.</p>
    `,
    actionUrl: data.messageUrl,
    actionText: 'View Message',
  });
}
