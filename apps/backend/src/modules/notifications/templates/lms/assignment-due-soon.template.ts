import { getBaseEmailTemplate } from '../base.template';

export interface AssignmentDueSoonData {
  userName: string;
  assignmentTitle: string;
  courseName: string;
  dueDate: string;
  hoursRemaining: number;
  assignmentUrl: string;
}

export function getAssignmentDueSoonTemplate(data: AssignmentDueSoonData): string {
  return getBaseEmailTemplate({
    title: '⚠️ Assignment Due Soon!',
    preheader: `${data.assignmentTitle} is due in ${data.hoursRemaining} hours`,
    userName: data.userName,
    content: `
      <div style="background-color: #fef2f2; border-radius: 8px; padding: 20px; margin: 20px 0; border: 2px solid #ef4444;">
        <div style="text-align: center; font-size: 48px; margin-bottom: 10px;">⏰</div>
        <p style="margin: 0; text-align: center; font-size: 18px; color: #991b1b; font-weight: 600;">
          Reminder: Assignment Due Soon!
        </p>
      </div>
      
      <p style="margin: 0 0 16px 0;">This is a friendly reminder that your assignment is due soon!</p>
      
      <div style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #18181b;">${data.assignmentTitle}</p>
        <p style="margin: 0 0 4px 0; color: #71717a;"><strong>Course:</strong> ${data.courseName}</p>
        <p style="margin: 0 0 4px 0; color: #71717a;"><strong>Due:</strong> ${data.dueDate}</p>
        <p style="margin: 0; color: #ef4444; font-weight: 600;">
          ⚠️ Time Remaining: ${data.hoursRemaining} hours
        </p>
      </div>
      
      <p style="margin: 0 0 16px 0;">Don't miss the deadline! Make sure to submit your work before the due date.</p>
      
      <p style="margin: 0;">Click below to complete and submit your assignment now.</p>
    `,
    actionUrl: data.assignmentUrl,
    actionText: 'Complete Assignment',
    footerText: 'Submissions after the due date may receive reduced points.',
  });
}
