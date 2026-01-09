import { NotificationsService } from './notifications.service';
import { FCMService } from './fcm.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    private readonly fcmService;
    constructor(notificationsService: NotificationsService, fcmService: FCMService);
    create(createNotificationDto: CreateNotificationDto): Promise<{
        id: number;
        uuid: string;
        isDeleted: boolean;
        createdAt: Date;
        deletedAt: Date;
        userId: number;
        readAt: Date;
        notificationTypeId: number;
        title: string;
        message: string;
        linkUrl: string;
        isRead: boolean;
    }>;
    getMyNotifications(user: any): Promise<{
        id: number;
        uuid: string;
        isDeleted: boolean;
        createdAt: Date;
        deletedAt: Date;
        userId: number;
        readAt: Date;
        notificationTypeId: number;
        title: string;
        message: string;
        linkUrl: string;
        isRead: boolean;
    }[]>;
    getUnread(user: any): Promise<{
        id: number;
        uuid: string;
        isDeleted: boolean;
        createdAt: Date;
        deletedAt: Date;
        userId: number;
        readAt: Date;
        notificationTypeId: number;
        title: string;
        message: string;
        linkUrl: string;
        isRead: boolean;
    }[]>;
    markAsRead(id: number): Promise<void>;
    markAllAsRead(user: any): Promise<void>;
    registerDevice(body: {
        token: string;
    }, user: any): Promise<{
        message: string;
        userId: any;
    }>;
    sendTestNotification(body: {
        token: string;
    }): Promise<{
        success: boolean;
        messageId: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        messageId?: undefined;
    }>;
    remove(id: number): Promise<void>;
}
//# sourceMappingURL=notifications.controller.d.ts.map