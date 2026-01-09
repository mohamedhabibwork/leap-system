import { Injectable, OnModuleInit, Logger } from '@nestjs/common';

@Injectable()
export class KafkaService implements OnModuleInit {
  private readonly logger = new Logger(KafkaService.name);

  async onModuleInit() {
    this.logger.log('Kafka service initialized (mock mode)');
  }

  async publishEvent(topic: string, event: any) {
    this.logger.log(`[MOCK] Publishing to topic ${topic}: ${JSON.stringify(event)}`);
    // Mock implementation - in production, use actual Kafka
    return true;
  }

  async publishAuditLog(action: string, userId: number, metadata: any) {
    return this.publishEvent('audit-events', { action, userId, metadata, timestamp: new Date() });
  }

  async publishCourseEvent(eventType: string, courseId: number, data: any) {
    return this.publishEvent('lms-events', { eventType, courseId, data, timestamp: new Date() });
  }

  async publishSocialEvent(eventType: string, entityType: string, entityId: number, data: any) {
    return this.publishEvent('social-events', { eventType, entityType, entityId, data, timestamp: new Date() });
  }
}
