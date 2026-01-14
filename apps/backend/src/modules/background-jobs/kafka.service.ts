import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private producer: Producer | null = null;
  private kafka: Kafka | null = null;
  private isConnecting = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.connectProducer();
  }

  async onModuleDestroy() {
    await this.disconnectProducer();
  }

  private async connectProducer() {
    if (this.isConnecting || this.producer) {
      return;
    }

    this.isConnecting = true;

    try {
      const brokersValue = this.configService.get<string>('KAFKA_BROKERS');
      if (!brokersValue) {
        this.logger.warn('Kafka brokers not configured. Kafka producer will be disabled.');
        return;
      }

      const brokers = brokersValue
        .split(',')
        .map((broker) => broker.trim())
        .filter(Boolean);

      if (brokers.length === 0) {
        this.logger.warn('Kafka brokers list is empty. Kafka producer will be disabled.');
        return;
      }

      const clientId = this.configService.get<string>('KAFKA_CLIENT_ID') || 'leap-lms-backend';

      this.kafka = new Kafka({ clientId, brokers });
      this.producer = this.kafka.producer();

      await this.producer.connect();

      this.logger.log(`✅ Kafka producer connected (${brokers.join(', ')})`);
    } catch (error) {
      this.logger.error('Failed to connect Kafka producer:', error);
      this.producer = null;
      this.kafka = null;
    } finally {
      this.isConnecting = false;
    }
  }

  private async disconnectProducer() {
    if (!this.producer) {
      return;
    }

    try {
      await this.producer.disconnect();
      this.logger.log('Kafka producer disconnected');
    } catch (error) {
      this.logger.error('Failed to disconnect Kafka producer:', error);
    } finally {
      this.producer = null;
      this.kafka = null;
    }
  }

  private async ensureProducer() {
    if (!this.producer) {
      await this.connectProducer();
    }

    if (!this.producer) {
      throw new Error('Kafka producer not available');
    }
  }

  async publishEvent(topic: string, event: unknown) {
    await this.ensureProducer();

    try {
      await this.producer.send({
        topic,
        messages: [{ value: JSON.stringify(event) }],
      });
      this.logger.log(`✅ Published event to topic ${topic}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to publish event to topic ${topic}:`, error);
      throw error;
    }
  }

  async publishAuditLog(action: string, userId: number, metadata: unknown) {
    return this.publishEvent('audit-events', { action, userId, metadata, timestamp: new Date() });
  }

  async publishCourseEvent(eventType: string, courseId: number, data: unknown) {
    return this.publishEvent('lms-events', { eventType, courseId, data, timestamp: new Date() });
  }

  async publishSocialEvent(eventType: string, entityType: string, entityId: number, data: unknown) {
    return this.publishEvent('social-events', { eventType, entityType, entityId, data, timestamp: new Date() });
  }
}
