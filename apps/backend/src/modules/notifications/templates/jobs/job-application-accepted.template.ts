import { getBaseEmailTemplate } from '../base.template';

export interface JobApplicationAcceptedData {
  userName: string;
  jobTitle: string;
  companyName: string;
  startDate?: string;
  applicationUrl: string;
  recruiterEmail?: string;
  nextSteps?: string;
}

export function getJobApplicationAcceptedTemplate(data: JobApplicationAcceptedData): string {
  return getBaseEmailTemplate({
    title: 'Congratulations! Job Offer Received! 🎉',
    preheader: `You've been offered the ${data.jobTitle} position at ${data.companyName}`,
    userName: data.userName,
    content: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 64px;">🎉</div>
        <div style="font-size: 48px; margin-top: 10px;">🎊</div>
      </div>
      
      <p style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #16a34a; text-align: center;">
        CONGRATULATIONS!
      </p>
      
      <p style="margin: 0 0 16px 0;">We're thrilled to inform you that your application for <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong> has been accepted!</p>
      
      <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0; border: 2px solid #16a34a;">
        <p style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #166534;">Offer Details:</p>
        <p style="margin: 0 0 8px 0; color: #15803d;"><strong>Position:</strong> ${data.jobTitle}</p>
        <p style="margin: 0 0 8px 0; color: #15803d;"><strong>Company:</strong> ${data.companyName}</p>
        ${data.startDate ? `<p style="margin: 0; color: #15803d;"><strong>Start Date:</strong> ${data.startDate}</p>` : ''}
      </div>
      
      ${data.nextSteps ? `
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0 0 8px 0; font-weight: 600; color: #92400e;">Next Steps:</p>
          <p style="margin: 0; color: #78350f;">${data.nextSteps}</p>
        </div>
      ` : ''}
      
      ${data.recruiterEmail ? `
        <p style="margin: 0 0 16px 0;">The recruiter will contact you at <strong>${data.recruiterEmail}</strong> with your formal offer letter and additional details.</p>
      ` : ''}
      
      <p style="margin: 0;">Click below to view your complete application details and offer information.</p>
    `,
    actionUrl: data.applicationUrl,
    actionText: 'View Offer Details',
    footerText: 'Congratulations on your new role! We wish you all the best in your new position.',
  });
}
