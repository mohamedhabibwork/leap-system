import { Injectable, OnModuleInit, OnModuleDestroy, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private readonly logger = new Logger(RabbitMQService.name);
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000;
  private isConnecting = false;

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.connect();
    await this.setupConsumers();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    if (this.isConnecting || (this.connection && this.connection.connection.readyState === 'open')) {
      return;
    }

    this.isConnecting = true;

    try {
      const rabbitmqUrl = this.configService.get<string>('RABBITMQ_URL') || 
        `amqp://${this.configService.get<string>('RABBITMQ_USER') || 'guest'}:${this.configService.get<string>('RABBITMQ_PASSWORD') || 'guest'}@${this.configService.get<string>('RABBITMQ_HOST') || 'localhost'}:${this.configService.get<number>('RABBITMQ_PORT') || 5672}`;

      this.logger.log(`Connecting to RabbitMQ at ${rabbitmqUrl.replace(/:[^:@]+@/, ':****@')}`);

      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      // Handle connection errors
      this.connection.on('error', (err) => {
        this.logger.error('RabbitMQ connection error:', err);
        this.connection = null;
        this.channel = null;
      });

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed. Attempting to reconnect...');
        this.connection = null;
        this.channel = null;
        this.reconnect();
      });

      this.reconnectAttempts = 0;
      this.logger.log('✅ RabbitMQ connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ:', error);
      this.connection = null;
      this.channel = null;
      this.reconnect();
    } finally {
      this.isConnecting = false;
    }
  }

  private async reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error(`Max reconnection attempts (${this.maxReconnectAttempts}) reached. RabbitMQ will not be available.`);
      return;
    }

    this.reconnectAttempts++;
    this.logger.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectDelay}ms...`);

    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay);
  }

  private async disconnect() {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      this.logger.log('RabbitMQ disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting from RabbitMQ:', error);
    }
  }

  private async ensureConnection() {
    if (!this.connection || !this.channel) {
      await this.connect();
    }
    if (!this.channel) {
      throw new Error('RabbitMQ channel not available');
    }
  }

  private async setupConsumers() {
    try {
      await this.ensureConnection();
      if (!this.channel) return;

      // Assert queues
      await this.channel.assertQueue('invoice-queue', { durable: true });
      await this.channel.assertQueue('certificate-queue', { durable: true });
      await this.channel.assertQueue('email-queue', { durable: true });

      this.logger.log('✅ RabbitMQ queues asserted');
    } catch (error) {
      this.logger.error('Failed to setup RabbitMQ consumers:', error);
    }
  }

  async sendToQueue(queue: string, message: any, options?: amqp.Options.Publish) {
    try {
      await this.ensureConnection();
      if (!this.channel) {
        throw new Error('RabbitMQ channel not available');
      }

      // Ensure queue exists
      await this.channel.assertQueue(queue, { durable: true });

      const sent = this.channel.sendToQueue(
        queue,
        Buffer.from(JSON.stringify(message)),
        {
          persistent: true,
          ...options,
        }
      );

      if (sent) {
        this.logger.log(`✅ Message sent to queue ${queue}`);
        return true;
      } else {
        this.logger.warn(`⚠️ Message not sent to queue ${queue} (buffer full)`);
        return false;
      }
    } catch (error) {
      this.logger.error(`Failed to send message to queue ${queue}:`, error);
      throw error;
    }
  }

  async consumeQueue(queue: string, handler: (message: any) => Promise<void>) {
    try {
      await this.ensureConnection();
      if (!this.channel) {
        throw new Error('RabbitMQ channel not available');
      }

      await this.channel.assertQueue(queue, { durable: true });

      await this.channel.consume(queue, async (msg) => {
        if (!msg) return;

        try {
          const content = JSON.parse(msg.content.toString());
          await handler(content);
          this.channel?.ack(msg);
        } catch (error) {
          this.logger.error(`Error processing message from queue ${queue}:`, error);
          this.channel?.nack(msg, false, false); // Reject and don't requeue
        }
      });

      this.logger.log(`✅ Consumer registered for queue ${queue}`);
    } catch (error) {
      this.logger.error(`Failed to consume queue ${queue}:`, error);
      throw error;
    }
  }

  async sendEmail(to: string, subject: string, body: string) {
    return this.sendToQueue('email-queue', { to, subject, body });
  }

  async generateInvoice(paymentId: number) {
    return this.sendToQueue('invoice-queue', { paymentId });
  }

  async generateCertificate(enrollmentId: number) {
    return this.sendToQueue('certificate-queue', { enrollmentId });
  }
}
