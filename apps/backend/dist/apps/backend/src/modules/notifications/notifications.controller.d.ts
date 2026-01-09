import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
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
    remove(id: number): Promise<void>;
}
//# sourceMappingURL=notifications.controller.d.ts.map