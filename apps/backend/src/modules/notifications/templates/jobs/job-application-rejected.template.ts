import { getBaseEmailTemplate } from '../base.template';

export interface JobApplicationRejectedData {
  userName: string;
  jobTitle: string;
  companyName: string;
  feedback?: string;
  applicationUrl: string;
}

export function getJobApplicationRejectedTemplate(data: JobApplicationRejectedData): string {
  return getBaseEmailTemplate({
    title: 'Application Status Update',
    preheader: `Update on your application for ${data.jobTitle}`,
    userName: data.userName,
    content: `
      <p style="margin: 0 0 16px 0;">Thank you for your interest in the <strong>${data.jobTitle}</strong> position at <strong>${data.companyName}</strong>.</p>
      
      <p style="margin: 0 0 16px 0;">After careful consideration, we regret to inform you that we have decided to move forward with other candidates whose qualifications more closely match our current needs.</p>
      
      ${data.feedback ? `
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0 0 8px 0; font-weight: 600; color: #92400e;">Feedback:</p>
          <p style="margin: 0; color: #78350f;">${data.feedback}</p>
        </div>
      ` : ''}
      
      <div style="background-color: #f0f9ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 12px 0; font-weight: 600; color: #075985;">Don't Get Discouraged!</p>
        <p style="margin: 0; color: #0c4a6e;">This decision doesn't reflect on your worth or capabilities. Keep applying, improving your skills, and the right opportunity will come your way.</p>
      </div>
      
      <p style="margin: 0 0 16px 0;">We appreciate the time and effort you put into your application. We encourage you to continue exploring other opportunities on our platform.</p>
      
      <p style="margin: 0;">Keep your profile updated and stay connected – we may have other positions that match your skills in the future!</p>
    `,
    actionUrl: data.applicationUrl,
    actionText: 'Browse More Jobs',
    footerText: 'Remember: Every "no" brings you one step closer to the right "yes".',
  });
}
