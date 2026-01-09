import { getBaseEmailTemplate } from '../base.template';

export interface JobExpiredData {
  userName: string;
  jobTitle: string;
  companyName: string;
  postedDate: string;
  similarJobsUrl: string;
}

export function getJobExpiredTemplate(data: JobExpiredData): string {
  return getBaseEmailTemplate({
    title: 'Job Posting Expired',
    preheader: `The ${data.jobTitle} position is no longer available`,
    userName: data.userName,
    content: `
      <p style="margin: 0 0 16px 0;">The job posting for <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong> that you were interested in has expired and is no longer accepting applications.</p>
      
      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #991b1b;">Position Closed:</p>
        <p style="margin: 0 0 4px 0; color: #7f1d1d;"><strong>Position:</strong> ${data.jobTitle}</p>
        <p style="margin: 0 0 4px 0; color: #7f1d1d;"><strong>Company:</strong> ${data.companyName}</p>
        <p style="margin: 0; color: #7f1d1d;"><strong>Posted:</strong> ${data.postedDate}</p>
      </div>
      
      <p style="margin: 0 0 16px 0;">While this particular opportunity is no longer available, we have many other exciting positions that might interest you!</p>
      
      <div style="background-color: #f0f9ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #075985;">What's Next?</p>
        <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #0c4a6e;">
          <li>Browse similar job openings</li>
          <li>Set up job alerts to be notified of new opportunities</li>
          <li>Update your profile to match more positions</li>
          <li>Continue building your skills through our courses</li>
        </ul>
      </div>
      
      <p style="margin: 0;">Click below to explore similar job opportunities that match your profile!</p>
    `,
    actionUrl: data.similarJobsUrl,
    actionText: 'Find Similar Jobs',
    footerText: 'Don\'t give up! The right opportunity is just around the corner.',
  });
}
