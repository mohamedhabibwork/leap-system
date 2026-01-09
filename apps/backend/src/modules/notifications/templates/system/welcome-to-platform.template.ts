import { getBaseEmailTemplate } from '../base.template';

export interface WelcomeToPlatformData {
  userName: string;
  dashboardUrl: string;
  coursesUrl: string;
  communityUrl: string;
  jobsUrl: string;
}

export function getWelcomeToPlatformTemplate(data: WelcomeToPlatformData): string {
  return getBaseEmailTemplate({
    title: 'Welcome to LEAP LMS! 🎉',
    preheader: 'Start your learning journey today',
    userName: data.userName,
    content: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 64px;">🎉</div>
        <div style="font-size: 48px; margin-top: 10px;">🎓</div>
      </div>
      
      <p style="margin: 0 0 16px 0; font-size: 18px; text-align: center; font-weight: 600; color: #4f46e5;">
        Welcome to LEAP LMS!
      </p>
      
      <p style="margin: 0 0 16px 0;">We're thrilled to have you join our learning community! LEAP LMS is your comprehensive platform for education, networking, and career growth.</p>
      
      <div style="background-color: #f0f9ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 16px 0; font-weight: 600; color: #075985;">Here's what you can do:</p>
        
        <div style="margin-bottom: 12px;">
          <p style="margin: 0 0 4px 0; color: #0c4a6e; font-weight: 600;">📚 Learn</p>
          <p style="margin: 0; color: #0c4a6e; font-size: 14px;">Browse thousands of courses and start learning new skills</p>
        </div>
        
        <div style="margin-bottom: 12px;">
          <p style="margin: 0 0 4px 0; color: #0c4a6e; font-weight: 600;">👥 Connect</p>
          <p style="margin: 0; color: #0c4a6e; font-size: 14px;">Join groups, make friends, and build your professional network</p>
        </div>
        
        <div style="margin-bottom: 12px;">
          <p style="margin: 0 0 4px 0; color: #0c4a6e; font-weight: 600;">💼 Grow</p>
          <p style="margin: 0; color: #0c4a6e; font-size: 14px;">Explore job opportunities and advance your career</p>
        </div>
        
        <div>
          <p style="margin: 0 0 4px 0; color: #0c4a6e; font-weight: 600;">🏆 Achieve</p>
          <p style="margin: 0; color: #0c4a6e; font-size: 14px;">Earn certificates and showcase your accomplishments</p>
        </div>
      </div>
      
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #92400e;">Quick Start Guide:</p>
        <ol style="margin: 0; padding-left: 20px; color: #78350f;">
          <li>Complete your profile</li>
          <li>Browse our course catalog</li>
          <li>Join relevant groups</li>
          <li>Set up job alerts</li>
        </ol>
      </div>
      
      <p style="margin: 0;">Ready to begin? Click below to explore the platform!</p>
    `,
    actionUrl: data.dashboardUrl,
    actionText: 'Get Started',
    secondaryActionUrl: data.coursesUrl,
    secondaryActionText: 'Browse Courses',
    footerText: 'Need help getting started? Check out our help center or contact support.',
  });
}
