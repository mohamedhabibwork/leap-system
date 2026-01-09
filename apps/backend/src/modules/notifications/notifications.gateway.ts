import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

export enum AdminNotificationEvent {
  TICKET_CREATED = 'admin:ticket:created',
  TICKET_UPDATED = 'admin:ticket:updated',
  REPORT_CREATED = 'admin:report:created',
  REPORT_UPDATED = 'admin:report:updated',
  USER_REGISTERED = 'admin:user:registered',
  CONTENT_FLAGGED = 'admin:content:flagged',
  STATS_UPDATED = 'admin:stats:updated',
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

@WebSocketGateway({ namespace: '/notifications', cors: true })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private readonly connectedClients = new Map<string, { userId: number; roles: string[] }>();

  handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  /**
   * Subscribe to user-specific notifications
   */
  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: number; roles?: string[] }
  ) {
    client.join(`user-${data.userId}`);
    this.connectedClients.set(client.id, { userId: data.userId, roles: data.roles || [] });
    this.logger.log(`User ${data.userId} subscribed to notifications`);
    return { success: true };
  }

  /**
   * Subscribe to admin notifications
   */
  @SubscribeMessage('subscribe:admin')
  handleAdminSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: number; roles: string[] }
  ) {
    // Join general admin room
    client.join('admin:general');
    
    // Join role-specific rooms
    data.roles.forEach(role => {
      client.join(`admin:role:${role.toLowerCase()}`);
    });

    // Join user-specific room
    client.join(`admin:user:${data.userId}`);

    this.connectedClients.set(client.id, { userId: data.userId, roles: data.roles });
    this.logger.log(`Admin user ${data.userId} subscribed with roles: ${data.roles.join(', ')}`);
    
    return { success: true };
  }

  /**
   * Unsubscribe from notifications
   */
  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(@ConnectedSocket() client: Socket, @MessageBody() userId: number) {
    client.leave(`user-${userId}`);
    this.logger.log(`User ${userId} unsubscribed from notifications`);
    return { success: true };
  }

  /**
   * Mark notification as read
   */
  @SubscribeMessage('notification:read')
  handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() notificationId: number
  ) {
    // This would typically update the database
    this.logger.log(`Notification ${notificationId} marked as read`);
    return { success: true };
  }

  /**
   * Send notification to a specific user
   */
  sendNotification(userId: number, notification: any) {
    this.server.to(`user-${userId}`).emit('notification', notification);
  }

  /**
   * Send notification to multiple users
   */
  sendToMultiple(userIds: number[], notification: any) {
    userIds.forEach(userId => {
      this.sendNotification(userId, notification);
    });
  }

  /**
   * Broadcast to all admins
   */
  notifyAdmins(notification: AdminNotification) {
    this.logger.log(`Broadcasting to all admins: ${notification.type}`);
    this.server.to('admin:general').emit('admin:notification', {
      ...notification,
      timestamp: new Date(),
    });
  }

  /**
   * Send notification to admins with specific roles
   */
  notifyRoles(roles: string[], notification: AdminNotification) {
    roles.forEach(role => {
      this.logger.log(`Broadcasting to role ${role}: ${notification.type}`);
      this.server.to(`admin:role:${role.toLowerCase()}`).emit('admin:notification', {
        ...notification,
        timestamp: new Date(),
      });
    });
  }

  /**
   * Send notification to a specific admin user
   */
  notifyAdminUser(userId: number, notification: AdminNotification) {
    this.logger.log(`Sending to admin user ${userId}: ${notification.type}`);
    this.server.to(`admin:user:${userId}`).emit('admin:notification', {
      ...notification,
      timestamp: new Date(),
    });
  }

  /**
   * Broadcast real-time stats update
   */
  broadcastStatsUpdate(stats: any) {
    this.server.to('admin:general').emit(AdminNotificationEvent.STATS_UPDATED, stats);
  }

  /**
   * Get connected clients count
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Get admin clients count
   */
  getAdminClientsCount(): number {
    return Array.from(this.connectedClients.values()).filter(
      client => client.roles.some(role => ['admin', 'superadmin', 'moderator'].includes(role.toLowerCase()))
    ).length;
  }
}
