import { getBaseEmailTemplate } from '../base.template';

export interface QuizGradedData {
  userName: string;
  quizTitle: string;
  courseName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  quizUrl: string;
}

export function getQuizGradedTemplate(data: QuizGradedData): string {
  const emoji = data.passed ? '🎉' : '📚';
  const statusColor = data.passed ? '#16a34a' : '#ea580c';
  const statusBg = data.passed ? '#f0fdf4' : '#fff7ed';
  
  return getBaseEmailTemplate({
    title: 'Quiz Results Available',
    preheader: `You scored ${data.percentage}% on ${data.quizTitle}`,
    userName: data.userName,
    content: `
      <p style="margin: 0 0 16px 0;">Your quiz results for <strong>${data.quizTitle}</strong> in <strong>${data.courseName}</strong> are ready!</p>
      
      <div style="background-color: ${statusBg}; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <div style="text-align: center; font-size: 48px; margin-bottom: 10px;">${emoji}</div>
        <div style="text-align: center; font-size: 32px; font-weight: 700; color: ${statusColor};">
          ${data.score}/${data.totalQuestions}
        </div>
        <div style="text-align: center; font-size: 18px; color: ${statusColor}; margin-top: 5px;">
          ${data.percentage}% - ${data.passed ? 'Passed' : 'Not Passed'}
        </div>
      </div>
      
      ${data.passed ? `
        <p style="margin: 0 0 16px 0;">Congratulations! You've successfully passed this quiz. Keep up the great work!</p>
      ` : `
        <p style="margin: 0 0 16px 0;">You didn't pass this time, but don't worry! Review the material and try again when you're ready.</p>
      `}
      
      <p style="margin: 0;">Click below to review your answers and see detailed feedback.</p>
    `,
    actionUrl: data.quizUrl,
    actionText: 'View Quiz Results',
  });
}
