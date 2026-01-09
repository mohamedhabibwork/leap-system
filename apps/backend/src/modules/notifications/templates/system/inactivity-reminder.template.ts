import { getBaseEmailTemplate } from '../base.template';

export interface InactivityReminderData {
  userName: string;
  daysSinceLastLogin: number;
  dashboardUrl: string;
  newCoursesCount?: number;
  newJobsCount?: number;
  unreadMessagesCount?: number;
}

export function getInactivityReminderTemplate(data: InactivityReminderData): string {
  return getBaseEmailTemplate({
    title: 'We Miss You! 😊',
    preheader: `It's been ${data.daysSinceLastLogin} days since your last visit`,
    userName: data.userName,
    content: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 64px;">😊</div>
      </div>
      
      <p style="margin: 0 0 16px 0;">We noticed it's been <strong>${data.daysSinceLastLogin} days</strong> since you last visited LEAP LMS. We miss you!</p>
      
      <div style="background-color: #f0f9ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 12px 0; font-weight: 600; color: #075985;">What's New Since Your Last Visit:</p>
        
        ${data.newCoursesCount ? `
          <p style="margin: 0 0 8px 0; color: #0c4a6e;">
            📚 <strong>${data.newCoursesCount}</strong> new ${data.newCoursesCount === 1 ? 'course' : 'courses'} added
          </p>
        ` : ''}
        
        ${data.newJobsCount ? `
          <p style="margin: 0 0 8px 0; color: #0c4a6e;">
            💼 <strong>${data.newJobsCount}</strong> new job ${data.newJobsCount === 1 ? 'opportunity' : 'opportunities'} posted
          </p>
        ` : ''}
        
        ${data.unreadMessagesCount ? `
          <p style="margin: 0; color: #0c4a6e;">
            💬 <strong>${data.unreadMessagesCount}</strong> unread ${data.unreadMessagesCount === 1 ? 'message' : 'messages'} waiting for you
          </p>
        ` : ''}
      </div>
      
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #78350f;">
          Don't let your learning momentum fade! Come back and continue your journey toward achieving your goals.
        </p>
      </div>
      
      <p style="margin: 0 0 16px 0;">Your learning community is waiting for you. Take a few minutes today to:</p>
      
      <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #52525b;">
        <li>Check your course progress</li>
        <li>Explore new content</li>
        <li>Connect with your network</li>
        <li>Discover career opportunities</li>
      </ul>
      
      <p style="margin: 0;">Click below to pick up where you left off!</p>
    `,
    actionUrl: data.dashboardUrl,
    actionText: 'Welcome Back',
    footerText: 'Not interested anymore? You can adjust your email preferences anytime.',
  });
}
