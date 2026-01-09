import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

// Import all template functions
import * as templates from './templates';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = this.configService.get('SMTP_HOST');
    const port = this.configService.get('SMTP_PORT');
    const user = this.configService.get('SMTP_USER');
    const pass = this.configService.get('SMTP_PASSWORD');

    if (!host || !port || !user || !pass) {
      this.logger.warn('Email service not configured. Emails will be logged only.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: parseInt(port) === 465,
      auth: {
        user,
        pass,
      },
    });

    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      this.logger.log('Email service connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to email service', error);
    }
  }

  private getFrontendUrl(path: string = ''): string {
    return `${this.configService.get('FRONTEND_URL')}${path}`;
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!this.transporter) {
        this.logger.log('Email would be sent:', options);
        return true;
      }

      const fromEmail = this.configService.get('FROM_EMAIL') || 'noreply@leap-lms.com';
      const fromName = this.configService.get('FROM_NAME') || 'LEAP PM';

      const info = await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      this.logger.log(`Email sent successfully to ${options.to}: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error);
      return false;
    }
  }

  // ============== LMS Notification Emails (12 methods) ==============
  
  async sendCourseEnrollmentEmail(email: string, data: templates.CourseEnrollmentData): Promise<boolean> {
    const html = templates.getCourseEnrollmentTemplate(data);
    return this.sendEmail({ to: email, subject: 'Welcome to Your New Course!', html });
  }

  async sendCourseEnrollmentApprovedEmail(email: string, data: templates.CourseEnrollmentApprovedData): Promise<boolean> {
    const html = templates.getCourseEnrollmentApprovedTemplate(data);
    return this.sendEmail({ to: email, subject: 'Enrollment Request Approved!', html });
  }

  async sendAssignmentGradedEmail(email: string, data: templates.AssignmentGradedData): Promise<boolean> {
    const html = templates.getAssignmentGradedTemplate(data);
    return this.sendEmail({ to: email, subject: 'Your Assignment Has Been Graded', html });
  }

  async sendCertificateIssuedEmail(email: string, data: templates.CertificateIssuedData): Promise<boolean> {
    const html = templates.getCertificateIssuedTemplate(data);
    return this.sendEmail({ to: email, subject: 'Congratulations! Your Certificate is Ready!', html });
  }

  async sendLessonUnlockedEmail(email: string, data: templates.LessonUnlockedData): Promise<boolean> {
    const html = templates.getLessonUnlockedTemplate(data);
    return this.sendEmail({ to: email, subject: 'New Lesson Available!', html });
  }

  async sendAssignmentAssignedEmail(email: string, data: templates.AssignmentAssignedData): Promise<boolean> {
    const html = templates.getAssignmentAssignedTemplate(data);
    return this.sendEmail({ to: email, subject: 'New Assignment Available', html });
  }

  async sendAssignmentSubmittedEmail(email: string, data: templates.AssignmentSubmittedData): Promise<boolean> {
    const html = templates.getAssignmentSubmittedTemplate(data);
    return this.sendEmail({ to: email, subject: 'Assignment Submitted Successfully', html });
  }

  async sendAssignmentDueSoonEmail(email: string, data: templates.AssignmentDueSoonData): Promise<boolean> {
    const html = templates.getAssignmentDueSoonTemplate(data);
    return this.sendEmail({ to: email, subject: 'Assignment Due Soon!', html });
  }

  async sendQuizGradedEmail(email: string, data: templates.QuizGradedData): Promise<boolean> {
    const html = templates.getQuizGradedTemplate(data);
    return this.sendEmail({ to: email, subject: 'Quiz Results Available', html });
  }

  async sendInstructorMessageEmail(email: string, data: templates.InstructorMessageData): Promise<boolean> {
    const html = templates.getInstructorMessageTemplate(data);
    return this.sendEmail({ to: email, subject: 'Message from Your Instructor', html });
  }

  async sendCourseUpdatedEmail(email: string, data: templates.CourseUpdatedData): Promise<boolean> {
    const html = templates.getCourseUpdatedTemplate(data);
    return this.sendEmail({ to: email, subject: 'Course Content Updated', html });
  }

  // ============== Job Notification Emails (8 methods) ==============
  
  async sendJobPostedEmail(email: string, data: templates.JobPostedData): Promise<boolean> {
    const html = templates.getJobPostedTemplate(data);
    return this.sendEmail({ to: email, subject: 'New Job Opportunity Matching Your Profile!', html });
  }

  async sendJobApplicationReceivedEmail(email: string, data: templates.JobApplicationReceivedData): Promise<boolean> {
    const html = templates.getJobApplicationReceivedTemplate(data);
    return this.sendEmail({ to: email, subject: 'Application Received!', html });
  }

  async sendJobApplicationReviewedEmail(email: string, data: templates.JobApplicationReviewedData): Promise<boolean> {
    const html = templates.getJobApplicationReviewedTemplate(data);
    return this.sendEmail({ to: email, subject: 'Application Under Review', html });
  }

  async sendJobApplicationShortlistedEmail(email: string, data: templates.JobApplicationShortlistedData): Promise<boolean> {
    const html = templates.getJobApplicationShortlistedTemplate(data);
    return this.sendEmail({ to: email, subject: 'Congratulations! You\'ve Been Shortlisted!', html });
  }

  async sendJobInterviewScheduledEmail(email: string, data: templates.JobInterviewScheduledData): Promise<boolean> {
    const html = templates.getJobInterviewScheduledTemplate(data);
    return this.sendEmail({ to: email, subject: 'Interview Scheduled!', html });
  }

  async sendJobApplicationAcceptedEmail(email: string, data: templates.JobApplicationAcceptedData): Promise<boolean> {
    const html = templates.getJobApplicationAcceptedTemplate(data);
    return this.sendEmail({ to: email, subject: 'Congratulations! Job Offer Received!', html });
  }

  async sendJobApplicationRejectedEmail(email: string, data: templates.JobApplicationRejectedData): Promise<boolean> {
    const html = templates.getJobApplicationRejectedTemplate(data);
    return this.sendEmail({ to: email, subject: 'Application Status Update', html });
  }

  async sendJobExpiredEmail(email: string, data: templates.JobExpiredData): Promise<boolean> {
    const html = templates.getJobExpiredTemplate(data);
    return this.sendEmail({ to: email, subject: 'Job Posting Expired', html });
  }

  // ============== Social Notification Emails (10 methods) ==============
  
  async sendFriendRequestReceivedEmail(email: string, data: templates.FriendRequestReceivedData): Promise<boolean> {
    const html = templates.getFriendRequestReceivedTemplate(data);
    return this.sendEmail({ to: email, subject: 'New Friend Request!', html });
  }

  async sendFriendRequestAcceptedEmail(email: string, data: templates.FriendRequestAcceptedData): Promise<boolean> {
    const html = templates.getFriendRequestAcceptedTemplate(data);
    return this.sendEmail({ to: email, subject: 'Friend Request Accepted!', html });
  }

  async sendGroupInvitationEmail(email: string, data: templates.GroupInvitationData): Promise<boolean> {
    const html = templates.getGroupInvitationTemplate(data);
    return this.sendEmail({ to: email, subject: 'Group Invitation', html });
  }

  async sendGroupJoinedEmail(email: string, data: templates.GroupJoinedData): Promise<boolean> {
    const html = templates.getGroupJoinedTemplate(data);
    return this.sendEmail({ to: email, subject: 'New Group Member', html });
  }

  async sendPostCommentedEmail(email: string, data: templates.PostCommentedData): Promise<boolean> {
    const html = templates.getPostCommentedTemplate(data);
    return this.sendEmail({ to: email, subject: 'New Comment on Your Post', html });
  }

  async sendPostReactionEmail(email: string, data: templates.PostReactionData): Promise<boolean> {
    const html = templates.getPostReactionTemplate(data);
    return this.sendEmail({ to: email, subject: `${data.reactorName} Reacted to Your Post`, html });
  }

  async sendCommentReplyEmail(email: string, data: templates.CommentReplyData): Promise<boolean> {
    const html = templates.getCommentReplyTemplate(data);
    return this.sendEmail({ to: email, subject: 'New Reply to Your Comment', html });
  }

  async sendMentionInPostEmail(email: string, data: templates.MentionInPostData): Promise<boolean> {
    const html = templates.getMentionInPostTemplate(data);
    return this.sendEmail({ to: email, subject: 'You Were Mentioned!', html });
  }

  async sendEventInvitationEmail(email: string, data: templates.EventInvitationData): Promise<boolean> {
    const html = templates.getEventInvitationTemplate(data);
    return this.sendEmail({ to: email, subject: 'Event Invitation', html });
  }

  async sendEventReminderEmail(email: string, data: templates.EventReminderData): Promise<boolean> {
    const html = templates.getEventReminderTemplate(data);
    return this.sendEmail({ to: email, subject: 'Event Starting Soon!', html });
  }

  // ============== Ticket Notification Emails (6 methods) ==============
  
  async sendTicketCreatedEmail(email: string, data: templates.TicketCreatedData): Promise<boolean> {
    const html = templates.getTicketCreatedTemplate(data);
    return this.sendEmail({ to: email, subject: 'Support Ticket Created', html });
  }

  async sendTicketAssignedEmail(email: string, data: templates.TicketAssignedData): Promise<boolean> {
    const html = templates.getTicketAssignedTemplate(data);
    return this.sendEmail({ to: email, subject: 'Ticket Assigned to Agent', html });
  }

  async sendTicketReplyEmail(email: string, data: templates.TicketReplyData): Promise<boolean> {
    const html = templates.getTicketReplyTemplate(data);
    return this.sendEmail({ to: email, subject: 'New Reply to Your Ticket', html });
  }

  async sendTicketStatusChangedEmail(email: string, data: templates.TicketStatusChangedData): Promise<boolean> {
    const html = templates.getTicketStatusChangedTemplate(data);
    return this.sendEmail({ to: email, subject: 'Ticket Status Updated', html });
  }

  async sendTicketResolvedEmail(email: string, data: templates.TicketResolvedData): Promise<boolean> {
    const html = templates.getTicketResolvedTemplate(data);
    return this.sendEmail({ to: email, subject: 'Ticket Resolved', html });
  }

  async sendTicketReopenedEmail(email: string, data: templates.TicketReopenedData): Promise<boolean> {
    const html = templates.getTicketReopenedTemplate(data);
    return this.sendEmail({ to: email, subject: 'Ticket Reopened', html });
  }

  // ============== Payment Notification Emails (6 methods) ==============
  
  async sendPaymentSuccessfulEmail(email: string, data: templates.PaymentSuccessfulData): Promise<boolean> {
    const html = templates.getPaymentSuccessfulTemplate(data);
    return this.sendEmail({ to: email, subject: 'Payment Successful!', html });
  }

  async sendPaymentFailedEmail(email: string, data: templates.PaymentFailedData): Promise<boolean> {
    const html = templates.getPaymentFailedTemplate(data);
    return this.sendEmail({ to: email, subject: 'Payment Failed', html });
  }

  async sendRefundProcessedEmail(email: string, data: templates.RefundProcessedData): Promise<boolean> {
    const html = templates.getRefundProcessedTemplate(data);
    return this.sendEmail({ to: email, subject: 'Refund Processed', html });
  }

  async sendSubscriptionRenewedEmail(email: string, data: templates.SubscriptionRenewedData): Promise<boolean> {
    const html = templates.getSubscriptionRenewedTemplate(data);
    return this.sendEmail({ to: email, subject: 'Subscription Renewed', html });
  }

  async sendSubscriptionExpiringEmail(email: string, data: templates.SubscriptionExpiringData): Promise<boolean> {
    const html = templates.getSubscriptionExpiringTemplate(data);
    return this.sendEmail({ to: email, subject: 'Subscription Expiring Soon!', html });
  }

  async sendSubscriptionCancelledEmail(email: string, data: templates.SubscriptionCancelledData): Promise<boolean> {
    const html = templates.getSubscriptionCancelledTemplate(data);
    return this.sendEmail({ to: email, subject: 'Subscription Cancelled', html });
  }

  // ============== System Notification Emails (8 methods) ==============
  
  async sendAccountVerifiedEmail(email: string, data: templates.AccountVerifiedData): Promise<boolean> {
    const html = templates.getAccountVerifiedTemplate(data);
    return this.sendEmail({ to: email, subject: 'Email Verified Successfully!', html });
  }

  async sendPasswordChangedEmail(email: string, data: templates.PasswordChangedData): Promise<boolean> {
    const html = templates.getPasswordChangedTemplate(data);
    return this.sendEmail({ to: email, subject: 'Password Changed Successfully', html });
  }

  async sendSecurityAlertEmail(email: string, data: templates.SecurityAlertData): Promise<boolean> {
    const html = templates.getSecurityAlertTemplate(data);
    return this.sendEmail({ to: email, subject: 'Security Alert: Unusual Activity Detected', html });
  }

  async sendProfileUpdatedEmail(email: string, data: templates.ProfileUpdatedData): Promise<boolean> {
    const html = templates.getProfileUpdatedTemplate(data);
    return this.sendEmail({ to: email, subject: 'Profile Updated Successfully', html });
  }

  async sendMaintenanceScheduledEmail(email: string, data: templates.MaintenanceScheduledData): Promise<boolean> {
    const html = templates.getMaintenanceScheduledTemplate(data);
    return this.sendEmail({ to: email, subject: 'Scheduled Maintenance Notice', html });
  }

  async sendWelcomeToPlatformEmail(email: string, data: templates.WelcomeToPlatformData): Promise<boolean> {
    const html = templates.getWelcomeToPlatformTemplate(data);
    return this.sendEmail({ to: email, subject: 'Welcome to LEAP PM!', html });
  }

  async sendInactivityReminderEmail(email: string, data: templates.InactivityReminderData): Promise<boolean> {
    const html = templates.getInactivityReminderTemplate(data);
    return this.sendEmail({ to: email, subject: 'We Miss You!', html });
  }

  async sendAccountSuspendedEmail(email: string, data: templates.AccountSuspendedData): Promise<boolean> {
    const html = templates.getAccountSuspendedTemplate(data);
    return this.sendEmail({ to: email, subject: 'Account Suspended', html });
  }

  // ============== Legacy/Auth Methods (kept for backward compatibility) ==============
  
  async sendVerificationEmail(email: string, token: string, firstName?: string): Promise<boolean> {
    const verificationUrl = this.getFrontendUrl(`/verify-email?token=${token}`);
    const data: templates.AccountVerifiedData = {
      userName: firstName || 'there',
      dashboardUrl: this.getFrontendUrl('/hub'),
    };
    return this.sendAccountVerifiedEmail(email, data);
  }

  async sendPasswordResetEmail(email: string, token: string, firstName?: string): Promise<boolean> {
    const resetUrl = this.getFrontendUrl(`/reset-password?token=${token}`);
    const data: templates.PasswordChangedData = {
      userName: firstName || 'there',
      changedAt: new Date().toLocaleString(),
      ipAddress: 'Unknown',
      securityUrl: this.getFrontendUrl('/settings/security'),
    };
    return this.sendPasswordChangedEmail(email, data);
  }

  async sendWelcomeEmail(email: string, firstName?: string): Promise<boolean> {
    const data: templates.WelcomeToPlatformData = {
      userName: firstName || 'there',
      dashboardUrl: this.getFrontendUrl('/hub'),
      coursesUrl: this.getFrontendUrl('/courses'),
      communityUrl: this.getFrontendUrl('/community'),
      jobsUrl: this.getFrontendUrl('/jobs'),
    };
    return this.sendWelcomeToPlatformEmail(email, data);
  }
}
