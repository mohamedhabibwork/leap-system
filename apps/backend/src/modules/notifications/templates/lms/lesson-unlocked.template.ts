import { getBaseEmailTemplate } from '../base.template';

export interface LessonUnlockedData {
  userName: string;
  lessonTitle: string;
  courseName: string;
  lessonUrl: string;
  lessonNumber: number;
  totalLessons: number;
}

export function getLessonUnlockedTemplate(data: LessonUnlockedData): string {
  return getBaseEmailTemplate({
    title: 'New Lesson Available! 🔓',
    preheader: `${data.lessonTitle} is now available in ${data.courseName}`,
    userName: data.userName,
    content: `
      <p style="margin: 0 0 16px 0;">Great progress! You've unlocked a new lesson in <strong>${data.courseName}</strong>.</p>
      
      <div style="background-color: #f0f9ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #0369a1;">Lesson ${data.lessonNumber} of ${data.totalLessons}</p>
        <p style="margin: 0; font-size: 20px; font-weight: 600; color: #075985;">${data.lessonTitle}</p>
      </div>
      
      <p style="margin: 0 0 16px 0;">Continue your learning journey and stay on track to complete the course!</p>
      
      <div style="background-color: #f4f4f5; border-radius: 6px; padding: 12px; margin: 16px 0;">
        <div style="background-color: #4f46e5; height: 8px; border-radius: 4px; width: ${((data.lessonNumber / data.totalLessons) * 100).toFixed(0)}%;"></div>
        <p style="margin: 8px 0 0 0; font-size: 12px; color: #71717a; text-align: center;">
          ${((data.lessonNumber / data.totalLessons) * 100).toFixed(0)}% Complete
        </p>
      </div>
      
      <p style="margin: 0;">Ready to continue? Click below to start this lesson!</p>
    `,
    actionUrl: data.lessonUrl,
    actionText: 'Start Lesson',
  });
}
