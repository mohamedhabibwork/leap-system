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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsGateway = exports.AdminNotificationEvent = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
var AdminNotificationEvent;
(function (AdminNotificationEvent) {
    AdminNotificationEvent["TICKET_CREATED"] = "admin:ticket:created";
    AdminNotificationEvent["TICKET_UPDATED"] = "admin:ticket:updated";
    AdminNotificationEvent["REPORT_CREATED"] = "admin:report:created";
    AdminNotificationEvent["REPORT_UPDATED"] = "admin:report:updated";
    AdminNotificationEvent["USER_REGISTERED"] = "admin:user:registered";
    AdminNotificationEvent["CONTENT_FLAGGED"] = "admin:content:flagged";
    AdminNotificationEvent["STATS_UPDATED"] = "admin:stats:updated";
})(AdminNotificationEvent || (exports.AdminNotificationEvent = AdminNotificationEvent = {}));
let NotificationsGateway = NotificationsGateway_1 = class NotificationsGateway {
    server;
    logger = new common_1.Logger(NotificationsGateway_1.name);
    connectedClients = new Map();
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        this.connectedClients.delete(client.id);
    }
    handleSubscribe(client, data) {
        client.join(`user-${data.userId}`);
        this.connectedClients.set(client.id, { userId: data.userId, roles: data.roles || [] });
        this.logger.log(`User ${data.userId} subscribed to notifications`);
        return { success: true };
    }
    handleAdminSubscribe(client, data) {
        client.join('admin:general');
        data.roles.forEach(role => {
            client.join(`admin:role:${role.toLowerCase()}`);
        });
        client.join(`admin:user:${data.userId}`);
        this.connectedClients.set(client.id, { userId: data.userId, roles: data.roles });
        this.logger.log(`Admin user ${data.userId} subscribed with roles: ${data.roles.join(', ')}`);
        return { success: true };
    }
    handleUnsubscribe(client, userId) {
        client.leave(`user-${userId}`);
        this.logger.log(`User ${userId} unsubscribed from notifications`);
        return { success: true };
    }
    handleMarkAsRead(client, notificationId) {
        this.logger.log(`Notification ${notificationId} marked as read`);
        return { success: true };
    }
    sendNotification(userId, notification) {
        this.server.to(`user-${userId}`).emit('notification', notification);
    }
    sendToMultiple(userIds, notification) {
        userIds.forEach(userId => {
            this.sendNotification(userId, notification);
        });
    }
    notifyAdmins(notification) {
        this.logger.log(`Broadcasting to all admins: ${notification.type}`);
        this.server.to('admin:general').emit('admin:notification', {
            ...notification,
            timestamp: new Date(),
        });
    }
    notifyRoles(roles, notification) {
        roles.forEach(role => {
            this.logger.log(`Broadcasting to role ${role}: ${notification.type}`);
            this.server.to(`admin:role:${role.toLowerCase()}`).emit('admin:notification', {
                ...notification,
                timestamp: new Date(),
            });
        });
    }
    notifyAdminUser(userId, notification) {
        this.logger.log(`Sending to admin user ${userId}: ${notification.type}`);
        this.server.to(`admin:user:${userId}`).emit('admin:notification', {
            ...notification,
            timestamp: new Date(),
        });
    }
    broadcastStatsUpdate(stats) {
        this.server.to('admin:general').emit(AdminNotificationEvent.STATS_UPDATED, stats);
    }
    getConnectedClientsCount() {
        return this.connectedClients.size;
    }
    getAdminClientsCount() {
        return Array.from(this.connectedClients.values()).filter(client => client.roles.some(role => ['admin', 'superadmin', 'moderator'].includes(role.toLowerCase()))).length;
    }
};
exports.NotificationsGateway = NotificationsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationsGateway.prototype, "server", void 0);
__decorate([
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], NotificationsGateway.prototype, "handleConnection", null);
__decorate([
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], NotificationsGateway.prototype, "handleDisconnect", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], NotificationsGateway.prototype, "handleSubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe:admin'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], NotificationsGateway.prototype, "handleAdminSubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('unsubscribe'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Number]),
    __metadata("design:returntype", void 0)
], NotificationsGateway.prototype, "handleUnsubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('notification:read'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Number]),
    __metadata("design:returntype", void 0)
], NotificationsGateway.prototype, "handleMarkAsRead", null);
exports.NotificationsGateway = NotificationsGateway = NotificationsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({ namespace: '/notifications', cors: true })
], NotificationsGateway);
//# sourceMappingURL=notifications.gateway.js.map