import { getBaseEmailTemplate } from '../base.template';

export interface CourseUpdatedData {
  userName: string;
  courseName: string;
  updateDescription: string;
  courseUrl: string;
  updatedAt: string;
}

export function getCourseUpdatedTemplate(data: CourseUpdatedData): string {
  return getBaseEmailTemplate({
    title: 'Course Content Updated',
    preheader: `${data.courseName} has new content available`,
    userName: data.userName,
    content: `
      <p style="margin: 0 0 16px 0;"><strong>${data.courseName}</strong> has been updated with new content!</p>
      
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #92400e;">What's New:</p>
        <p style="margin: 0; color: #78350f;">${data.updateDescription}</p>
      </div>
      
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #71717a;">Updated on: ${data.updatedAt}</p>
      
      <p style="margin: 0;">Check out the latest content and continue your learning journey!</p>
    `,
    actionUrl: data.courseUrl,
    actionText: 'View Updates',
  });
}
