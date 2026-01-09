import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

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

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!this.transporter) {
        this.logger.log('Email would be sent:', options);
        return true;
      }

      const fromEmail = this.configService.get('FROM_EMAIL') || 'noreply@leap-lms.com';
      const fromName = this.configService.get('FROM_NAME') || 'LEAP LMS';

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

  async sendVerificationEmail(email: string, token: string, firstName?: string): Promise<boolean> {
    const verificationUrl = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${token}`;
    const subject = 'Verify Your Email - LEAP LMS';
    
    const html = this.getVerificationEmailTemplate(verificationUrl, firstName);
    const text = `Hi ${firstName || ''},\n\nPlease verify your email by clicking this link: ${verificationUrl}\n\nIf you didn't create an account, please ignore this email.\n\nBest regards,\nLEAP LMS Team`;

    return this.sendEmail({ to: email, subject, html, text });
  }

  async sendPasswordResetEmail(email: string, token: string, firstName?: string): Promise<boolean> {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;
    const subject = 'Reset Your Password - LEAP LMS';
    
    const html = this.getPasswordResetEmailTemplate(resetUrl, firstName);
    const text = `Hi ${firstName || ''},\n\nYou requested to reset your password. Click this link to reset it: ${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nLEAP LMS Team`;

    return this.sendEmail({ to: email, subject, html, text });
  }

  async sendWelcomeEmail(email: string, firstName?: string): Promise<boolean> {
    const subject = 'Welcome to LEAP LMS!';
    const dashboardUrl = `${this.configService.get('FRONTEND_URL')}/hub`;
    
    const html = this.getWelcomeEmailTemplate(dashboardUrl, firstName);
    const text = `Hi ${firstName || ''},\n\nWelcome to LEAP LMS! We're excited to have you on board.\n\nGet started by exploring our courses: ${dashboardUrl}\n\nBest regards,\nLEAP LMS Team`;

    return this.sendEmail({ to: email, subject, html, text });
  }

  private getVerificationEmailTemplate(verificationUrl: string, firstName?: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="background-color: #4f46e5; padding: 40px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">LEAP LMS</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="color: #333333; margin: 0 0 20px 0;">Verify Your Email Address</h2>
                    <p style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                      Hi ${firstName || 'there'},
                    </p>
                    <p style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
                      Thank you for signing up for LEAP LMS! To complete your registration, please verify your email address by clicking the button below:
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="${verificationUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">
                            Verify Email
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="color: #666666; font-size: 14px; line-height: 20px; margin: 30px 0 0 0;">
                      If the button doesn't work, copy and paste this link into your browser:
                    </p>
                    <p style="color: #4f46e5; font-size: 14px; word-break: break-all; margin: 10px 0 20px 0;">
                      ${verificationUrl}
                    </p>
                    <p style="color: #999999; font-size: 14px; line-height: 20px; margin: 20px 0 0 0;">
                      If you didn't create an account, please ignore this email.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f9fafb; padding: 30px; text-align: center;">
                    <p style="color: #999999; font-size: 14px; margin: 0;">
                      © ${new Date().getFullYear()} LEAP LMS. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  private getPasswordResetEmailTemplate(resetUrl: string, firstName?: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="background-color: #4f46e5; padding: 40px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">LEAP LMS</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="color: #333333; margin: 0 0 20px 0;">Reset Your Password</h2>
                    <p style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                      Hi ${firstName || 'there'},
                    </p>
                    <p style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
                      We received a request to reset your password. Click the button below to create a new password:
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">
                            Reset Password
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="color: #666666; font-size: 14px; line-height: 20px; margin: 30px 0 0 0;">
                      If the button doesn't work, copy and paste this link into your browser:
                    </p>
                    <p style="color: #4f46e5; font-size: 14px; word-break: break-all; margin: 10px 0 20px 0;">
                      ${resetUrl}
                    </p>
                    <p style="color: #ef4444; font-size: 14px; line-height: 20px; margin: 20px 0 0 0;">
                      ⚠️ This link will expire in 1 hour.
                    </p>
                    <p style="color: #999999; font-size: 14px; line-height: 20px; margin: 20px 0 0 0;">
                      If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f9fafb; padding: 30px; text-align: center;">
                    <p style="color: #999999; font-size: 14px; margin: 0;">
                      © ${new Date().getFullYear()} LEAP LMS. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  private getWelcomeEmailTemplate(dashboardUrl: string, firstName?: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to LEAP LMS</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="background-color: #4f46e5; padding: 40px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Welcome to LEAP LMS! 🎉</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="color: #333333; margin: 0 0 20px 0;">Hi ${firstName || 'there'}!</h2>
                    <p style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                      We're thrilled to have you join LEAP LMS, your comprehensive learning management platform!
                    </p>
                    <p style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
                      Here's what you can do:
                    </p>
                    <ul style="color: #666666; font-size: 16px; line-height: 28px; margin: 0 0 30px 0; padding-left: 20px;">
                      <li>Browse and enroll in courses</li>
                      <li>Connect with instructors and fellow learners</li>
                      <li>Track your learning progress</li>
                      <li>Earn certificates</li>
                    </ul>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="${dashboardUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">
                            Get Started
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="color: #666666; font-size: 14px; line-height: 20px; margin: 30px 0 0 0;">
                      If you have any questions, feel free to reach out to our support team.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f9fafb; padding: 30px; text-align: center;">
                    <p style="color: #999999; font-size: 14px; margin: 0;">
                      © ${new Date().getFullYear()} LEAP LMS. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }
}
