import { getBaseEmailTemplate } from '../base.template';

export interface JobPostedData {
  userName: string;
  jobTitle: string;
  companyName: string;
  location: string;
  jobType: string;
  salary?: string;
  jobUrl: string;
}

export function getJobPostedTemplate(data: JobPostedData): string {
  return getBaseEmailTemplate({
    title: 'New Job Opportunity Matching Your Profile! 💼',
    preheader: `${data.jobTitle} at ${data.companyName}`,
    userName: data.userName,
    content: `
      <p style="margin: 0 0 16px 0;">A new job that matches your profile and preferences has been posted!</p>
      
      <div style="background-color: #f0f9ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 12px 0; font-size: 20px; font-weight: 600; color: #075985;">${data.jobTitle}</p>
        <p style="margin: 0 0 8px 0; color: #0c4a6e;"><strong>Company:</strong> ${data.companyName}</p>
        <p style="margin: 0 0 8px 0; color: #0c4a6e;"><strong>Location:</strong> ${data.location}</p>
        <p style="margin: 0 0 8px 0; color: #0c4a6e;"><strong>Job Type:</strong> ${data.jobType}</p>
        ${data.salary ? `<p style="margin: 0; color: #0c4a6e;"><strong>Salary:</strong> ${data.salary}</p>` : ''}
      </div>
      
      <p style="margin: 0 0 16px 0;">This opportunity was matched based on your skills, experience, and job preferences.</p>
      
      <p style="margin: 0;">Click below to view the full job details and apply before the position fills up!</p>
    `,
    actionUrl: data.jobUrl,
    actionText: 'View Job & Apply',
  });
}
