import { getBaseEmailTemplate } from '../base.template';

export interface AssignmentAssignedData {
  userName: string;
  assignmentTitle: string;
  courseName: string;
  dueDate: string;
  assignmentUrl: string;
  description?: string;
  points: number;
}

export function getAssignmentAssignedTemplate(data: AssignmentAssignedData): string {
  return getBaseEmailTemplate({
    title: 'New Assignment Available',
    preheader: `${data.assignmentTitle} has been assigned in ${data.courseName}`,
    userName: data.userName,
    content: `
      <p style="margin: 0 0 16px 0;">A new assignment has been posted in <strong>${data.courseName}</strong>!</p>
      
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #92400e;">${data.assignmentTitle}</p>
        ${data.description ? `<p style="margin: 0 0 8px 0; color: #78350f;">${data.description}</p>` : ''}
        <p style="margin: 0; color: #78350f;"><strong>Points:</strong> ${data.points}</p>
      </div>
      
      <div style="background-color: #fee2e2; border-radius: 6px; padding: 12px; margin: 16px 0;">
        <p style="margin: 0; color: #991b1b; text-align: center;">
          ⏰ <strong>Due Date:</strong> ${data.dueDate}
        </p>
      </div>
      
      <p style="margin: 0;">Start working on your assignment now to submit it on time!</p>
    `,
    actionUrl: data.assignmentUrl,
    actionText: 'View Assignment',
  });
}
