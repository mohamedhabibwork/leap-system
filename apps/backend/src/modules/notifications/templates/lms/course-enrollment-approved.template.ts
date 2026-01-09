import { getBaseEmailTemplate } from '../base.template';

export interface CourseEnrollmentApprovedData {
  userName: string;
  courseName: string;
  instructorName: string;
  courseUrl: string;
  approvalMessage?: string;
}

export function getCourseEnrollmentApprovedTemplate(data: CourseEnrollmentApprovedData): string {
  return getBaseEmailTemplate({
    title: 'Enrollment Request Approved! 🎉',
    preheader: `Your request to join ${data.courseName} has been approved`,
    userName: data.userName,
    content: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 64px;">🎉</div>
      </div>
      
      <p style="margin: 0 0 16px 0;">Great news! Your enrollment request for <strong>${data.courseName}</strong> has been approved by ${data.instructorName}.</p>
      
      ${data.approvalMessage ? `
        <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0 0 8px 0; font-weight: 600; color: #166534;">Message from Instructor:</p>
          <p style="margin: 0; color: #15803d;">${data.approvalMessage}</p>
        </div>
      ` : ''}
      
      <p style="margin: 0 0 16px 0;">You now have full access to all course materials, lessons, and assignments.</p>
      
      <p style="margin: 0;">Click below to start your learning journey!</p>
    `,
    actionUrl: data.courseUrl,
    actionText: 'Access Course',
  });
}
