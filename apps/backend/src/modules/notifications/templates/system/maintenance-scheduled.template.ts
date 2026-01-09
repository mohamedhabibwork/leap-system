import { getBaseEmailTemplate } from '../base.template';

export interface MaintenanceScheduledData {
  userName: string;
  maintenanceDate: string;
  maintenanceTime: string;
  estimatedDuration: string;
  impactedServices: string[];
  statusUrl: string;
}

export function getMaintenanceScheduledTemplate(data: MaintenanceScheduledData): string {
  return getBaseEmailTemplate({
    title: 'Scheduled Maintenance Notice 🔧',
    preheader: `System maintenance scheduled for ${data.maintenanceDate}`,
    userName: data.userName,
    content: `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 64px;">🔧</div>
      </div>
      
      <p style="margin: 0 0 16px 0;">We wanted to let you know about upcoming scheduled maintenance for our platform.</p>
      
      <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 12px 0; font-weight: 600; color: #92400e;">Maintenance Schedule:</p>
        <p style="margin: 0 0 8px 0; color: #78350f;"><strong>Date:</strong> ${data.maintenanceDate}</p>
        <p style="margin: 0 0 8px 0; color: #78350f;"><strong>Time:</strong> ${data.maintenanceTime}</p>
        <p style="margin: 0; color: #78350f;"><strong>Expected Duration:</strong> ${data.estimatedDuration}</p>
      </div>
      
      <div style="background-color: #f0f9ff; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #075985;">Impacted Services:</p>
        <ul style="margin: 0; padding-left: 20px; color: #0c4a6e;">
          ${data.impactedServices.map(service => `<li>${service}</li>`).join('')}
        </ul>
      </div>
      
      <p style="margin: 0 0 16px 0;">During this time, you may experience temporary service disruptions. We apologize for any inconvenience and appreciate your patience.</p>
      
      <p style="margin: 0;">We're working to improve your experience and will be back better than ever!</p>
    `,
    actionUrl: data.statusUrl,
    actionText: 'Check Status Page',
    footerText: 'Follow our status page for real-time updates during maintenance.',
  });
}
