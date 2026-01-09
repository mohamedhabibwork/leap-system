import { getBaseEmailTemplate } from '../base.template';

export interface JobApplicationReviewedData {
  userName: string;
  jobTitle: string;
  companyName: string;
  applicationUrl: string;
}

export function getJobApplicationReviewedTemplate(data: JobApplicationReviewedData): string {
  return getBaseEmailTemplate({
    title: 'Application Under Review 👀',
    preheader: `Your application for ${data.jobTitle} is being reviewed`,
    userName: data.userName,
    content: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 64px;">👀</div>
      </div>
      
      <p style="margin: 0 0 16px 0;">Good news! Your application for <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong> is currently being reviewed by the hiring team.</p>
      
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #92400e;">What This Means:</p>
        <p style="margin: 0; color: #78350f;">Your profile has caught the attention of the recruiter and they're carefully reviewing your qualifications and experience for this position.</p>
      </div>
      
      <p style="margin: 0 0 16px 0;">You'll receive an update soon about the next steps in the hiring process.</p>
      
      <p style="margin: 0;">Keep an eye on your email and check your application status regularly.</p>
    `,
    actionUrl: data.applicationUrl,
    actionText: 'View Application',
  });
}
