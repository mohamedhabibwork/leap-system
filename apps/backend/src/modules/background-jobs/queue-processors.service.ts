import { Injectable, OnModuleInit, Logger, Inject } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { paymentHistory, enrollments } from '@leap-lms/database';
import { eq } from 'drizzle-orm';

@Injectable()
export class QueueProcessorsService implements OnModuleInit {
  private readonly logger = new Logger(QueueProcessorsService.name);
  private pdfService: any;
  private certificatesService: any;
  private notificationsService: any;

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    @Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>,
  ) {}

  async onModuleInit() {
    // Wait a bit for RabbitMQ to be ready
    setTimeout(() => {
      this.setupConsumers();
    }, 5000);
  }

  private async setupConsumers() {
    // Lazy load services to avoid circular dependencies
    const { PdfService } = await import('../payments/pdf.service');
    const { CertificatesService } = await import('../lms/certificates/certificates.service');
    const { NotificationsService } = await import('../notifications/notifications.service');
    const { EmailService } = await import('../notifications/email.service');
    const { FCMService } = await import('../notifications/fcm.service');
    const { NotificationsGateway } = await import('../notifications/notifications.gateway');
    
    // Create instances directly (simplified - in production use proper DI)
    this.pdfService = new PdfService(this.db);
    this.certificatesService = new CertificatesService(this.db);
    
    // Get notifications service from module context
    // For now, create a minimal instance
    try {
      const emailService = new EmailService({} as any);
      const fcmService = new FCMService({} as any);
      const gateway = {} as any; // NotificationsGateway requires WebSocket server
      this.notificationsService = new NotificationsService(
        this.db,
        emailService,
        fcmService,
        gateway,
      );
    } catch (error) {
      this.logger.warn('Could not initialize notifications service:', error);
    }
    
    // Get NotificationsService from module (would need proper DI in production)
    // For now, we'll handle notifications differently
    
    // Invoice queue consumer
    await this.rabbitMQService.consumeQueue('invoice-queue', async (message: { paymentId: number }) => {
      this.logger.log(`Processing invoice generation for payment ${message.paymentId}`);
      try {
        const result = await this.pdfService.generateInvoicePDF(message.paymentId);
        this.logger.log(`✅ Invoice generated for payment ${message.paymentId}: ${result.downloadUrl}`);

        // Get payment to send notification
        const [payment] = await this.db
          .select()
          .from(paymentHistory)
          .where(eq(paymentHistory.id, message.paymentId))
          .limit(1);

        if (payment && this.notificationsService) {
          // Send notification
          try {
            await this.notificationsService.sendMultiChannelNotification({
              userId: payment.userId,
              notificationTypeId: 1, // Payment notification type
              title: 'Invoice Generated',
              message: `Your invoice for payment ${payment.invoiceNumber} is ready for download.`,
              linkUrl: result.downloadUrl,
              channels: ['database', 'websocket', 'email'],
              emailData: {
                templateMethod: 'sendPaymentSuccessful',
                data: {
                  paymentId: payment.id,
                  amount: payment.amount,
                  currency: payment.currency,
                  invoiceUrl: result.downloadUrl,
                },
              },
            });
          } catch (error) {
            this.logger.warn('Failed to send notification:', error);
          }
        }
      } catch (error) {
        this.logger.error(`Failed to generate invoice for payment ${message.paymentId}:`, error);
      }
    });

    // Certificate queue consumer
    await this.rabbitMQService.consumeQueue('certificate-queue', async (message: { enrollmentId: number }) => {
      this.logger.log(`Processing certificate generation for enrollment ${message.enrollmentId}`);
      try {
        const result = await this.certificatesService.generateCertificatePDF(message.enrollmentId);
        this.logger.log(`✅ Certificate generated for enrollment ${message.enrollmentId}: ${result.downloadUrl}`);

        // Get enrollment to send notification
        const [enrollment] = await this.db
          .select()
          .from(enrollments)
          .where(eq(enrollments.id, message.enrollmentId))
          .limit(1);

        if (enrollment && this.notificationsService) {
          // Send notification
          try {
            await this.notificationsService.sendMultiChannelNotification({
              userId: enrollment.userId,
              notificationTypeId: 2, // LMS notification type
              title: 'Certificate Issued',
              message: 'Congratulations! Your course completion certificate is ready.',
              linkUrl: result.downloadUrl,
              channels: ['database', 'websocket', 'email'],
              emailData: {
                templateMethod: 'sendCertificateIssued',
                data: {
                  enrollmentId: enrollment.id,
                  certificateUrl: result.downloadUrl,
                },
              },
            });
          } catch (error) {
            this.logger.warn('Failed to send notification:', error);
          }
        }
      } catch (error) {
        this.logger.error(`Failed to generate certificate for enrollment ${message.enrollmentId}:`, error);
      }
    });

    // Notification queue consumer
    await this.rabbitMQService.consumeQueue('notification-queue', async (message: any) => {
      if (this.notificationsService) {
        try {
          await this.notificationsService.sendMultiChannelNotification(message);
        } catch (error) {
          this.logger.error('Failed to process notification:', error);
        }
      }
    });

    this.logger.log('✅ Queue consumers registered');
  }
}
