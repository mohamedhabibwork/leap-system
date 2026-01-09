import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare enum AdminNotificationEvent {
    TICKET_CREATED = "admin:ticket:created",
    TICKET_UPDATED = "admin:ticket:updated",
    REPORT_CREATED = "admin:report:created",
    REPORT_UPDATED = "admin:report:updated",
    USER_REGISTERED = "admin:user:registered",
    CONTENT_FLAGGED = "admin:content:flagged",
    STATS_UPDATED = "admin:stats:updated"
}
interface AdminNotification {
    id?: number;
    type: AdminNotificationEvent;
    title: string;
    message: string;
    data?: any;
    timestamp: Date;
    actionUrl?: string;
}
export declare class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    private readonly connectedClients;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleSubscribe(client: Socket, data: {
        userId: number;
        roles?: string[];
    }): {
        success: boolean;
    };
    handleAdminSubscribe(client: Socket, data: {
        userId: number;
        roles: string[];
    }): {
        success: boolean;
    };
    handleUnsubscribe(client: Socket, userId: number): {
        success: boolean;
    };
    handleMarkAsRead(client: Socket, notificationId: number): {
        success: boolean;
    };
    sendNotification(userId: number, notification: any): void;
    sendToMultiple(userIds: number[], notification: any): void;
    notifyAdmins(notification: AdminNotification): void;
    notifyRoles(roles: string[], notification: AdminNotification): void;
    notifyAdminUser(userId: number, notification: AdminNotification): void;
    broadcastStatsUpdate(stats: any): void;
    getConnectedClientsCount(): number;
    getAdminClientsCount(): number;
}
export {};
//# sourceMappingURL=notifications.gateway.d.ts.map