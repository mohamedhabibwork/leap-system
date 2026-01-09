import { NotificationsGateway, AdminNotificationEvent } from './notifications.gateway';
interface AdminNotificationData {
    title: string;
    message: string;
    type: AdminNotificationEvent;
    data?: any;
    actionUrl?: string;
}
export declare class AdminNotificationsService {
    private readonly notificationsGateway;
    private readonly logger;
    constructor(notificationsGateway: NotificationsGateway);
    notifyTicketCreated(ticket: any): void;
    notifyTicketUpdated(ticket: any, assigneeId?: number): void;
    notifyReportCreated(report: any): void;
    notifyReportUpdated(report: any): void;
    notifyUserRegistered(user: any): void;
    notifyContentFlagged(content: any): void;
    broadcastStatsUpdate(stats: any): void;
    notify(data: AdminNotificationData, roles?: string[], userId?: number): void;
    getConnectionStats(): {
        totalConnections: number;
        adminConnections: number;
    };
}
export {};
//# sourceMappingURL=admin-notifications.service.d.ts.map