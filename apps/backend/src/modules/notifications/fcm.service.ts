import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FCMService implements OnModuleInit {
  private isInitialized = false;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    try {
      const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
      const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
      const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');

      if (!projectId || !clientEmail || !privateKey) {
        console.warn('Firebase credentials not configured. FCM service will be disabled.');
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
        console.log('Firebase Admin initialized successfully');
      }
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error);
    }
  }

  async sendNotification(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<string | null> {
    if (!this.isInitialized) {
      console.warn('FCM service not initialized');
      return null;
    }

    const message = {
      notification: { title, body },
      data: data || {},
      token,
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('Successfully sent FCM message:', response);
      return response;
    } catch (error) {
      console.error('Error sending FCM notification:', error);
      throw error;
    }
  }

  async sendToMultiple(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>
  ) {
    if (!this.isInitialized) {
      console.warn('FCM service not initialized');
      return null;
    }

    const message = {
      notification: { title, body },
      data: data || {},
      tokens,
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      console.log(`Successfully sent ${response.successCount} messages`);
      return response;
    } catch (error) {
      console.error('Error sending FCM notifications:', error);
      throw error;
    }
  }

  async sendToTopic(
    topic: string,
    title: string,
    body: string,
    data?: Record<string, string>
  ) {
    if (!this.isInitialized) {
      console.warn('FCM service not initialized');
      return null;
    }

    const message = {
      notification: { title, body },
      data: data || {},
      topic,
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('Successfully sent message to topic:', response);
      return response;
    } catch (error) {
      console.error('Error sending topic notification:', error);
      throw error;
    }
  }
}
