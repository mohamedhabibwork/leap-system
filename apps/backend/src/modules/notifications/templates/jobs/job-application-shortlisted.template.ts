import { getBaseEmailTemplate } from '../base.template';

export interface JobApplicationShortlistedData {
  userName: string;
  jobTitle: string;
  companyName: string;
  applicationUrl: string;
  nextSteps?: string;
}

export function getJobApplicationShortlistedTemplate(data: JobApplicationShortlistedData): string {
  return getBaseEmailTemplate({
    title: 'Congratulations! You\'ve Been Shortlisted! 🌟',
    preheader: `You're shortlisted for ${data.jobTitle} at ${data.companyName}`,
    userName: data.userName,
    content: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 64px;">🌟</div>
      </div>
      
      <p style="margin: 0 0 16px 0;">Excellent news! You've been shortlisted for the <strong>${data.jobTitle}</strong> position at <strong>${data.companyName}</strong>!</p>
      
      <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 12px 0; font-weight: 600; color: #166534;">You're One Step Closer!</p>
        <p style="margin: 0; color: #15803d;">Your qualifications and experience have impressed the hiring team. You've been selected from among many applicants to move forward in the hiring process.</p>
      </div>
      
      ${data.nextSteps ? `
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0 0 8px 0; font-weight: 600; color: #92400e;">Next Steps:</p>
          <p style="margin: 0; color: #78350f;">${data.nextSteps}</p>
        </div>
      ` : ''}
      
      <p style="margin: 0 0 16px 0;">The recruiter will contact you soon with more details about the next stage of the interview process.</p>
      
      <p style="margin: 0;">Prepare well and good luck!</p>
    `,
    actionUrl: data.applicationUrl,
    actionText: 'View Application Details',
    footerText: 'Tip: Research the company and prepare questions to ask during your interview.',
  });
}
