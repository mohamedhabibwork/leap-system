import { getBaseEmailTemplate } from '../base.template';

export interface AssignmentSubmittedData {
  userName: string;
  assignmentTitle: string;
  courseName: string;
  submittedAt: string;
  assignmentUrl: string;
}

export function getAssignmentSubmittedTemplate(data: AssignmentSubmittedData): string {
  return getBaseEmailTemplate({
    title: 'Assignment Submitted Successfully ✓',
    preheader: `Your submission for ${data.assignmentTitle} has been received`,
    userName: data.userName,
    content: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 64px;">✅</div>
      </div>
      
      <p style="margin: 0 0 16px 0;">Great work! Your assignment has been successfully submitted.</p>
      
      <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #166534;">Submission Details:</p>
        <p style="margin: 0 0 4px 0; color: #15803d;"><strong>Assignment:</strong> ${data.assignmentTitle}</p>
        <p style="margin: 0 0 4px 0; color: #15803d;"><strong>Course:</strong> ${data.courseName}</p>
        <p style="margin: 0; color: #15803d;"><strong>Submitted:</strong> ${data.submittedAt}</p>
      </div>
      
      <p style="margin: 0 0 16px 0;">Your instructor will review your submission and provide feedback soon.</p>
      
      <p style="margin: 0;">You can view your submission and check for updates by clicking below.</p>
    `,
    actionUrl: data.assignmentUrl,
    actionText: 'View Submission',
  });
}
