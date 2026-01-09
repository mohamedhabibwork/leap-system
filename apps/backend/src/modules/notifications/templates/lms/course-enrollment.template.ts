import { getBaseEmailTemplate } from '../base.template';

export interface CourseEnrollmentData {
  userName: string;
  courseName: string;
  courseUrl: string;
  instructorName: string;
  startDate?: string;
}

export function getCourseEnrollmentTemplate(data: CourseEnrollmentData): string {
  return getBaseEmailTemplate({
    title: 'Welcome to Your New Course!',
    preheader: `You've been enrolled in ${data.courseName}`,
    userName: data.userName,
    content: `
      <p style="margin: 0 0 16px 0;">Great news! You've been successfully enrolled in <strong>${data.courseName}</strong>.</p>
      <p style="margin: 0 0 16px 0;">This course is taught by <strong>${data.instructorName}</strong> and you can start learning right away.</p>
      ${data.startDate ? `<p style="margin: 0 0 16px 0;">Course starts on: <strong>${data.startDate}</strong></p>` : ''}
      <p style="margin: 0;">Click the button below to access your course dashboard and begin your learning journey!</p>
    `,
    actionUrl: data.courseUrl,
    actionText: 'Start Learning',
    footerText: 'If you didn\'t enroll in this course, please contact our support team.',
  });
}
