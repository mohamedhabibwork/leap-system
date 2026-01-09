import { getBaseEmailTemplate } from '../base.template';

export interface JobInterviewScheduledData {
  userName: string;
  jobTitle: string;
  companyName: string;
  interviewDate: string;
  interviewTime: string;
  interviewType: string; // 'video', 'phone', 'in-person'
  location?: string;
  meetingLink?: string;
  interviewerName?: string;
  applicationUrl: string;
}

export function getJobInterviewScheduledTemplate(data: JobInterviewScheduledData): string {
  return getBaseEmailTemplate({
    title: 'Interview Scheduled! 📅',
    preheader: `Your interview for ${data.jobTitle} is scheduled for ${data.interviewDate}`,
    userName: data.userName,
    content: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 64px;">📅</div>
      </div>
      
      <p style="margin: 0 0 16px 0;">Great news! Your interview for <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong> has been scheduled!</p>
      
      <div style="background-color: #dbeafe; border-radius: 8px; padding: 20px; margin: 20px 0; border: 2px solid #3b82f6;">
        <p style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #1e40af;">Interview Details:</p>
        <p style="margin: 0 0 8px 0; color: #1e3a8a;"><strong>Date:</strong> ${data.interviewDate}</p>
        <p style="margin: 0 0 8px 0; color: #1e3a8a;"><strong>Time:</strong> ${data.interviewTime}</p>
        <p style="margin: 0 0 8px 0; color: #1e3a8a;"><strong>Type:</strong> ${data.interviewType}</p>
        ${data.location ? `<p style="margin: 0 0 8px 0; color: #1e3a8a;"><strong>Location:</strong> ${data.location}</p>` : ''}
        ${data.interviewerName ? `<p style="margin: 0; color: #1e3a8a;"><strong>Interviewer:</strong> ${data.interviewerName}</p>` : ''}
      </div>
      
      ${data.meetingLink ? `
        <div style="background-color: #f0fdf4; border-radius: 6px; padding: 12px; margin: 16px 0;">
          <p style="margin: 0; color: #15803d; text-align: center;">
            🔗 <strong>Meeting Link:</strong> <a href="${data.meetingLink}" style="color: #16a34a;">${data.meetingLink}</a>
          </p>
        </div>
      ` : ''}
      
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #92400e;">Preparation Tips:</p>
        <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #78350f;">
          <li>Research the company and position</li>
          <li>Prepare answers to common interview questions</li>
          <li>Have questions ready to ask the interviewer</li>
          <li>Test your ${data.interviewType === 'video' ? 'camera and microphone' : 'phone connection'} beforehand</li>
          <li>Dress professionally and arrive 10 minutes early</li>
        </ul>
      </div>
      
      <p style="margin: 0;">Good luck with your interview! We're rooting for you!</p>
    `,
    actionUrl: data.applicationUrl,
    actionText: 'View Application Details',
    footerText: 'Remember to add this interview to your calendar!',
  });
}
