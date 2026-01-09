export interface EmailTemplateData {
  title: string;
  preheader?: string;
  content: string;
  actionUrl?: string;
  actionText?: string;
  secondaryActionUrl?: string;
  secondaryActionText?: string;
  footerText?: string;
  userName?: string;
}

/**
 * Base email template for all notifications
 * Features:
 * - Responsive HTML design
 * - Brand colors (#4f46e5 primary)
 * - Mobile-friendly
 * - Dark mode compatible (inline styles)
 * - Action buttons
 * - Footer with unsubscribe link
 */
export function getBaseEmailTemplate(data: EmailTemplateData): string {
  const {
    title,
    preheader = '',
    content,
    actionUrl,
    actionText,
    secondaryActionUrl,
    secondaryActionText,
    footerText,
    userName = 'there',
  } = data;

  const currentYear = new Date().getFullYear();

  return `
    <!DOCTYPE html>
    <html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="x-apple-disable-message-reformatting">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>${title}</title>
      <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
      <![endif]-->
      <style>
        /* Reset styles */
        body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
        
        /* Responsive styles */
        @media only screen and (max-width: 600px) {
          .container { width: 100% !important; }
          .mobile-padding { padding: 20px !important; }
          .mobile-text { font-size: 16px !important; line-height: 24px !important; }
          .button { width: 100% !important; display: block !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
      ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden;">${preheader}</div>` : ''}
      
      <!-- Main wrapper -->
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f4f4f5; padding: 20px 0;">
        <tr>
          <td align="center">
            <!-- Container -->
            <table class="container" width="600" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); padding: 40px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                    LEAP LMS
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td class="mobile-padding" style="padding: 40px;">
                  <h2 style="color: #18181b; margin: 0 0 20px 0; font-size: 24px; font-weight: 600; line-height: 32px;">
                    ${title}
                  </h2>
                  
                  <p style="color: #3f3f46; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                    Hi ${userName},
                  </p>
                  
                  <div class="mobile-text" style="color: #52525b; font-size: 16px; line-height: 26px; margin: 0 0 30px 0;">
                    ${content}
                  </div>
                  
                  ${actionUrl && actionText ? `
                  <!-- Primary Action Button -->
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: ${secondaryActionUrl ? '15px' : '30px'};">
                    <tr>
                      <td align="center">
                        <a href="${actionUrl}" class="button" style="background-color: #4f46e5; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; display: inline-block; min-width: 200px; text-align: center; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.3);">
                          ${actionText}
                        </a>
                      </td>
                    </tr>
                  </table>
                  ` : ''}
                  
                  ${secondaryActionUrl && secondaryActionText ? `
                  <!-- Secondary Action Button -->
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 30px;">
                    <tr>
                      <td align="center">
                        <a href="${secondaryActionUrl}" class="button" style="background-color: #ffffff; color: #4f46e5; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; display: inline-block; min-width: 200px; text-align: center; border: 2px solid #4f46e5;">
                          ${secondaryActionText}
                        </a>
                      </td>
                    </tr>
                  </table>
                  ` : ''}
                  
                  ${actionUrl ? `
                  <!-- Alternative link -->
                  <p style="color: #71717a; font-size: 14px; line-height: 20px; margin: 20px 0 0 0;">
                    If the button doesn't work, copy and paste this link into your browser:
                  </p>
                  <p style="color: #4f46e5; font-size: 13px; word-break: break-all; margin: 10px 0 20px 0;">
                    ${actionUrl}
                  </p>
                  ` : ''}
                  
                  ${footerText ? `
                  <p style="color: #a1a1aa; font-size: 14px; line-height: 20px; margin: 20px 0 0 0; padding-top: 20px; border-top: 1px solid #e4e4e7;">
                    ${footerText}
                  </p>
                  ` : ''}
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #fafafa; padding: 30px; text-align: center; border-top: 1px solid #e4e4e7;">
                  <p style="color: #71717a; font-size: 14px; margin: 0 0 10px 0;">
                    © ${currentYear} LEAP LMS. All rights reserved.
                  </p>
                  <p style="color: #a1a1aa; font-size: 12px; margin: 10px 0 0 0;">
                    You're receiving this email because you have an account with LEAP LMS.
                  </p>
                  <p style="margin: 15px 0 0 0;">
                    <a href="{{unsubscribe_url}}" style="color: #4f46e5; text-decoration: none; font-size: 12px;">
                      Unsubscribe
                    </a>
                    <span style="color: #d4d4d8; margin: 0 8px;">|</span>
                    <a href="{{preferences_url}}" style="color: #4f46e5; text-decoration: none; font-size: 12px;">
                      Email Preferences
                    </a>
                    <span style="color: #d4d4d8; margin: 0 8px;">|</span>
                    <a href="{{help_url}}" style="color: #4f46e5; text-decoration: none; font-size: 12px;">
                      Help Center
                    </a>
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
