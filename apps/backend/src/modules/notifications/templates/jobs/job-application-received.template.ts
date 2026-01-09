import { getBaseEmailTemplate } from '../base.template';

export interface JobApplicationReceivedData {
  userName: string;
  jobTitle: string;
  companyName: string;
  appliedAt: string;
  applicationUrl: string;
}

export function getJobApplicationReceivedTemplate(data: JobApplicationReceivedData): string {
  return getBaseEmailTemplate({
    title: 'Application Received! ✓',
    preheader: `Your application for ${data.jobTitle} has been received`,
    userName: data.userName,
    content: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 64px;">📨</div>
      </div>
      
      <p style="margin: 0 0 16px 0;">Thank you for applying! Your application for <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong> has been successfully received.</p>
      
      <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #166534;">Application Status:</p>
        <p style="margin: 0 0 4px 0; color: #15803d;"><strong>Position:</strong> ${data.jobTitle}</p>
        <p style="margin: 0 0 4px 0; color: #15803d;"><strong>Company:</strong> ${data.companyName}</p>
        <p style="margin: 0 0 4px 0; color: #15803d;"><strong>Applied:</strong> ${data.appliedAt}</p>
        <p style="margin: 0; color: #15803d;"><strong>Status:</strong> Under Review</p>
      </div>
      
      <p style="margin: 0 0 16px 0;">The recruiter will review your application and contact you if your profile matches their requirements.</p>
      
      <p style="margin: 0;">You can track your application status by clicking below.</p>
    `,
    actionUrl: data.applicationUrl,
    actionText: 'Track Application',
    footerText: 'Tip: Make sure to check your email regularly for updates from the recruiter.',
  });
}
