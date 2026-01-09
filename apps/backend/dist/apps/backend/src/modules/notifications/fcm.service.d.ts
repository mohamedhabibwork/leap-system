import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class FCMService implements OnModuleInit {
    private configService;
    private isInitialized;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    sendNotification(token: string, title: string, body: string, data?: Record<string, string>): Promise<string | null>;
    sendToMultiple(tokens: string[], title: string, body: string, data?: Record<string, string>): Promise<import("firebase-admin/lib/messaging/messaging-api").BatchResponse>;
    sendToTopic(topic: string, title: string, body: string, data?: Record<string, string>): Promise<string>;
}
//# sourceMappingURL=fcm.service.d.ts.map