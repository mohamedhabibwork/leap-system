import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

export interface RichNotificationData {
  title: string;
  body: string;
  imageUrl?: string;
  icon?: string;
  badge?: string;
  clickAction?: string;
  sound?: string;
  tag?: string;
  color?: string;
  data?: Record<string, string>;
  actions?: Array<{ action: string; title: string; icon?: string }>;
}

@Injectable()
export class FCMService implements OnModuleInit {
  private readonly logger = new Logger(FCMService.name);
  private isInitialized = false;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    try {
      const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
      const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
      const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');

      if (!projectId || !clientEmail || !privateKey) {
        this.logger.warn('Firebase credentials not configured. FCM service will be disabled.');
        return;
      }

      // Check if already initialized
      if (admin.apps.length === 0) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
          }),
        });
        this.isInitialized = true;
        this.logger.log('Firebase Admin initialized successfully');
      }
    } catch (error) {
      this.logger.error('Error initializing Firebase Admin:', error);
    }
  }

  /**
   * Send a basic notification
   */
  async sendNotification(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<string | null> {
    if (!this.isInitialized) {
      this.logger.warn('FCM service not initialized');
      return null;
    }

    const message = {
      notification: { title, body },
      data: data || {},
      token,
    };

    try {
      const response = await admin.messaging().send(message);
      this.logger.log(`Successfully sent FCM message: ${response}`);
      return response;
    } catch (error) {
      this.logger.error('Error sending FCM notification:', error);
      throw error;
    }
  }

  /**
   * Send rich notification with images, actions, and custom styling
   */
  async sendRichNotification(
    token: string,
    notificationData: RichNotificationData
  ): Promise<string | null> {
    if (!this.isInitialized) {
      this.logger.warn('FCM service not initialized');
      return null;
    }

    const {
      title,
      body,
      imageUrl,
      icon,
      badge,
      clickAction,
      sound,
      tag,
      color,
      data,
    } = notificationData;

    const message: any = {
      notification: {
        title,
        body,
      },
      data: data || {},
      token,
      android: {
        notification: {
          imageUrl,
          icon,
          color: color || '#4f46e5',
          sound: sound || 'default',
          tag,
          clickAction,
          channelId: 'default',
          priority: 'high' as const,
          defaultSound: true,
          defaultVibrateTimings: true,
          defaultLightSettings: true,
        },
        priority: 'high' as const,
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title,
              body,
            },
            badge: badge ? parseInt(badge) : undefined,
            sound: sound || 'default',
            contentAvailable: true,
            category: clickAction,
            mutableContent: true,
          },
        },
        fcmOptions: {
          imageUrl,
        },
      },
      webpush: {
        notification: {
          title,
          body,
          icon: icon || '/icon.png',
          badge: badge || '/badge.png',
          image: imageUrl,
          tag,
          requireInteraction: false,
          silent: false,
        },
        fcmOptions: {
          link: clickAction,
        },
      },
    };

    try {
      const response = await admin.messaging().send(message);
      this.logger.log(`Successfully sent rich FCM message: ${response}`);
      return response;
    } catch (error) {
      this.logger.error('Error sending rich FCM notification:', error);
      throw error;
    }
  }

  /**
   * Send notification with action buttons
   */
  async sendNotificationWithActions(
    token: string,
    title: string,
    body: string,
    actions: Array<{ action: string; title: string; icon?: string }>,
    data?: Record<string, string>
  ): Promise<string | null> {
    return this.sendRichNotification(token, {
      title,
      body,
      actions,
      data,
    });
  }

  /**
   * Send notification to multiple devices
   */
  async sendToMultiple(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>
  ) {
    if (!this.isInitialized) {
      this.logger.warn('FCM service not initialized');
      return null;
    }

    const message = {
      notification: { title, body },
      data: data || {},
      tokens,
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      this.logger.log(`Successfully sent ${response.successCount} messages, ${response.failureCount} failures`);
      return response;
    } catch (error) {
      this.logger.error('Error sending FCM notifications:', error);
      throw error;
    }
  }

  /**
   * Send rich notification to multiple devices
   */
  async sendRichToMultiple(
    tokens: string[],
    notificationData: RichNotificationData
  ) {
    if (!this.isInitialized) {
      this.logger.warn('FCM service not initialized');
      return null;
    }

    // Build base message
    const baseMessage = this.buildRichMessage(notificationData);

    // Send to each token
    const messages = tokens.map(token => ({
      ...baseMessage,
      token,
    }));

    try {
      const response = await admin.messaging().sendEach(messages);
      this.logger.log(`Successfully sent ${response.successCount} rich messages, ${response.failureCount} failures`);
      return response;
    } catch (error) {
      this.logger.error('Error sending rich FCM notifications:', error);
      throw error;
    }
  }

  /**
   * Send notification to a topic
   */
  async sendToTopic(
    topic: string,
    title: string,
    body: string,
    data?: Record<string, string>
  ) {
    if (!this.isInitialized) {
      this.logger.warn('FCM service not initialized');
      return null;
    }

    const message = {
      notification: { title, body },
      data: data || {},
      topic,
    };

    try {
      const response = await admin.messaging().send(message);
      this.logger.log(`Successfully sent message to topic: ${response}`);
      return response;
    } catch (error) {
      this.logger.error('Error sending topic notification:', error);
      throw error;
    }
  }

  /**
   * Send rich notification to a topic
   */
  async sendRichToTopic(
    topic: string,
    notificationData: RichNotificationData
  ) {
    if (!this.isInitialized) {
      this.logger.warn('FCM service not initialized');
      return null;
    }

    const message = {
      ...this.buildRichMessage(notificationData),
      topic,
    };

    try {
      const response = await admin.messaging().send(message);
      this.logger.log(`Successfully sent rich message to topic: ${response}`);
      return response;
    } catch (error) {
      this.logger.error('Error sending rich topic notification:', error);
      throw error;
    }
  }

  /**
   * Subscribe token to topic
   */
  async subscribeToTopic(tokens: string | string[], topic: string) {
    if (!this.isInitialized) {
      this.logger.warn('FCM service not initialized');
      return null;
    }

    try {
      const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
      const response = await admin.messaging().subscribeToTopic(tokenArray, topic);
      this.logger.log(`Successfully subscribed ${response.successCount} tokens to topic: ${topic}`);
      return response;
    } catch (error) {
      this.logger.error(`Error subscribing to topic ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Unsubscribe token from topic
   */
  async unsubscribeFromTopic(tokens: string | string[], topic: string) {
    if (!this.isInitialized) {
      this.logger.warn('FCM service not initialized');
      return null;
    }

    try {
      const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
      const response = await admin.messaging().unsubscribeFromTopic(tokenArray, topic);
      this.logger.log(`Successfully unsubscribed ${response.successCount} tokens from topic: ${topic}`);
      return response;
    } catch (error) {
      this.logger.error(`Error unsubscribing from topic ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Send silent/data-only notification
   */
  async sendSilentNotification(
    token: string,
    data: Record<string, string>
  ): Promise<string | null> {
    if (!this.isInitialized) {
      this.logger.warn('FCM service not initialized');
      return null;
    }

    const message = {
      data,
      token,
      android: {
        priority: 'high' as const,
      },
      apns: {
        headers: {
          'apns-priority': '5',
        },
        payload: {
          aps: {
            contentAvailable: true,
          },
        },
      },
    };

    try {
      const response = await admin.messaging().send(message);
      this.logger.log(`Successfully sent silent notification: ${response}`);
      return response;
    } catch (error) {
      this.logger.error('Error sending silent notification:', error);
      throw error;
    }
  }

  /**
   * Build rich message object
   */
  private buildRichMessage(notificationData: RichNotificationData): any {
    const {
      title,
      body,
      imageUrl,
      icon,
      badge,
      clickAction,
      sound,
      tag,
      color,
      data,
    } = notificationData;

    return {
      notification: {
        title,
        body,
      },
      data: data || {},
      android: {
        notification: {
          imageUrl,
          icon,
          color: color || '#4f46e5',
          sound: sound || 'default',
          tag,
          clickAction,
          channelId: 'default',
          priority: 'high' as const,
        },
        priority: 'high' as const,
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title,
              body,
            },
            badge: badge ? parseInt(badge) : undefined,
            sound: sound || 'default',
            contentAvailable: true,
            category: clickAction,
            mutableContent: true,
          },
        },
        fcmOptions: {
          imageUrl,
        },
      },
      webpush: {
        notification: {
          title,
          body,
          icon: icon || '/icon.png',
          badge: badge || '/badge.png',
          image: imageUrl,
          tag,
        },
        fcmOptions: {
          link: clickAction,
        },
      },
    };
  }
}
