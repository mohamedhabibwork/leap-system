import { CreateNotificationDto } from './dto/create-notification.dto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
export declare class NotificationsService {
    private readonly db;
    constructor(db: NodePgDatabase<any>);
    create(dto: CreateNotificationDto): Promise<{
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
    private deliverNotification;
    findByUser(userId: number): Promise<{
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
    findUnread(userId: number): Promise<{
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
    markAllAsRead(userId: number): Promise<void>;
    remove(id: number): Promise<void>;
}
//# sourceMappingURL=notifications.service.d.ts.map