"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AdminNotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminNotificationsService = void 0;
const common_1 = require("@nestjs/common");
const notifications_gateway_1 = require("./notifications.gateway");
let AdminNotificationsService = AdminNotificationsService_1 = class AdminNotificationsService {
    notificationsGateway;
    logger = new common_1.Logger(AdminNotificationsService_1.name);
    constructor(notificationsGateway) {
        this.notificationsGateway = notificationsGateway;
    }
    notifyTicketCreated(ticket) {
        this.notificationsGateway.notifyAdmins({
            type: notifications_gateway_1.AdminNotificationEvent.TICKET_CREATED,
            title: 'New Ticket Created',
            message: `Ticket #${ticket.id}: ${ticket.subject}`,
            data: ticket,
            actionUrl: `/admin/tickets/${ticket.id}`,
            timestamp: new Date(),
        });
    }
    notifyTicketUpdated(ticket, assigneeId) {
        const notification = {
            type: notifications_gateway_1.AdminNotificationEvent.TICKET_UPDATED,
            title: 'Ticket Updated',
            message: `Ticket #${ticket.id} has been updated`,
            data: ticket,
            actionUrl: `/admin/tickets/${ticket.id}`,
            timestamp: new Date(),
        };
        if (assigneeId) {
            this.notificationsGateway.notifyAdminUser(assigneeId, notification);
        }
        else {
            this.notificationsGateway.notifyAdmins(notification);
        }
    }
    notifyReportCreated(report) {
        this.notificationsGateway.notifyRoles(['admin', 'superadmin', 'moderator'], {
            type: notifications_gateway_1.AdminNotificationEvent.REPORT_CREATED,
            title: 'New Report Submitted',
            message: `${report.reportableType} reported: ${report.reason}`,
            data: report,
            actionUrl: `/admin/reports/${report.id}`,
            timestamp: new Date(),
        });
    }
    notifyReportUpdated(report) {
        this.notificationsGateway.notifyRoles(['admin', 'superadmin', 'moderator'], {
            type: notifications_gateway_1.AdminNotificationEvent.REPORT_UPDATED,
            title: 'Report Reviewed',
            message: `Report #${report.id} has been ${report.status}`,
            data: report,
            actionUrl: `/admin/reports/${report.id}`,
            timestamp: new Date(),
        });
    }
    notifyUserRegistered(user) {
        this.notificationsGateway.notifyAdmins({
            type: notifications_gateway_1.AdminNotificationEvent.USER_REGISTERED,
            title: 'New User Registered',
            message: `${user.firstName} ${user.lastName} (${user.email}) has registered`,
            data: user,
            actionUrl: `/admin/users/${user.id}`,
            timestamp: new Date(),
        });
    }
    notifyContentFlagged(content) {
        this.notificationsGateway.notifyRoles(['admin', 'superadmin', 'moderator', 'contentmanager'], {
            type: notifications_gateway_1.AdminNotificationEvent.CONTENT_FLAGGED,
            title: 'Content Flagged for Review',
            message: `${content.type} has been flagged for moderation`,
            data: content,
            actionUrl: `/admin/moderation/${content.id}`,
            timestamp: new Date(),
        });
    }
    broadcastStatsUpdate(stats) {
        this.notificationsGateway.broadcastStatsUpdate(stats);
    }
    notify(data, roles, userId) {
        const notification = {
            ...data,
            timestamp: new Date(),
        };
        if (userId) {
            this.notificationsGateway.notifyAdminUser(userId, notification);
        }
        else if (roles && roles.length > 0) {
            this.notificationsGateway.notifyRoles(roles, notification);
        }
        else {
            this.notificationsGateway.notifyAdmins(notification);
        }
    }
    getConnectionStats() {
        return {
            totalConnections: this.notificationsGateway.getConnectedClientsCount(),
            adminConnections: this.notificationsGateway.getAdminClientsCount(),
        };
    }
};
exports.AdminNotificationsService = AdminNotificationsService;
exports.AdminNotificationsService = AdminNotificationsService = AdminNotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_gateway_1.NotificationsGateway])
], AdminNotificationsService);
//# sourceMappingURL=admin-notifications.service.js.map