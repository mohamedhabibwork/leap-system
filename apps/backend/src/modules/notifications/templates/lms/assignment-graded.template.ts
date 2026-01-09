import { getBaseEmailTemplate } from '../base.template';

export interface AssignmentGradedData {
  userName: string;
  assignmentTitle: string;
  courseName: string;
  grade: number;
  maxGrade: number;
  feedback?: string;
  assignmentUrl: string;
}

export function getAssignmentGradedTemplate(data: AssignmentGradedData): string {
  const percentage = ((data.grade / data.maxGrade) * 100).toFixed(1);
  const gradeEmoji = Number(percentage) >= 90 ? '🌟' : Number(percentage) >= 70 ? '👍' : '📚';
  
  return getBaseEmailTemplate({
    title: 'Your Assignment Has Been Graded',
    preheader: `You scored ${data.grade}/${data.maxGrade} on ${data.assignmentTitle}`,
    userName: data.userName,
    content: `
      <p style="margin: 0 0 16px 0;">Your assignment <strong>${data.assignmentTitle}</strong> in <strong>${data.courseName}</strong> has been graded!</p>
      
      <div style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <div style="text-align: center; margin-bottom: 10px; font-size: 48px;">${gradeEmoji}</div>
        <div style="text-align: center; font-size: 32px; font-weight: 700; color: #18181b;">
          ${data.grade}/${data.maxGrade}
        </div>
        <div style="text-align: center; font-size: 18px; color: #71717a; margin-top: 5px;">
          ${percentage}%
        </div>
      </div>
      
      ${data.feedback ? `
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0 0 8px 0; font-weight: 600; color: #92400e;">Instructor Feedback:</p>
          <p style="margin: 0; color: #78350f;">${data.feedback}</p>
        </div>
      ` : ''}
      
      <p style="margin: 0;">Click below to view the full details and continue your learning journey!</p>
    `,
    actionUrl: data.assignmentUrl,
    actionText: 'View Assignment Details',
  });
}
