import { getBaseEmailTemplate } from '../base.template';

export interface CertificateIssuedData {
  userName: string;
  courseName: string;
  certificateUrl: string;
  completionDate: string;
  certificateId: string;
}

export function getCertificateIssuedTemplate(data: CertificateIssuedData): string {
  return getBaseEmailTemplate({
    title: 'Congratulations! Your Certificate is Ready! 🎉',
    preheader: `You've earned a certificate for completing ${data.courseName}`,
    userName: data.userName,
    content: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 64px; margin-bottom: 20px;">🎓</div>
      </div>
      
      <p style="margin: 0 0 16px 0;">Congratulations! You've successfully completed <strong>${data.courseName}</strong>!</p>
      
      <p style="margin: 0 0 16px 0;">Your dedication and hard work have paid off. Your certificate of completion is now available for download.</p>
      
      <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #166534;">Certificate Details:</p>
        <p style="margin: 0 0 4px 0; color: #15803d;"><strong>Course:</strong> ${data.courseName}</p>
        <p style="margin: 0 0 4px 0; color: #15803d;"><strong>Completed:</strong> ${data.completionDate}</p>
        <p style="margin: 0; color: #15803d;"><strong>Certificate ID:</strong> ${data.certificateId}</p>
      </div>
      
      <p style="margin: 0;">Share your achievement on LinkedIn or add it to your portfolio!</p>
    `,
    actionUrl: data.certificateUrl,
    actionText: 'Download Certificate',
    secondaryActionUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.certificateUrl)}`,
    secondaryActionText: 'Share on LinkedIn',
  });
}
