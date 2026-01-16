import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WsAuthMiddleware } from '../../common/middleware/ws-auth.middleware';
import { Role } from '../../common/enums/roles.enum';
import { env, isDevelopment, getArrayEnv } from '../../config/env';

/**
 * Get CORS origins for WebSocket connections
 */
function getCorsOrigins(): string[] | string {
  const corsOrigin = env.CORS_ORIGIN || '';
  const frontendUrl = env.FRONTEND_URL;
  
  if (corsOrigin) {
    const origins = corsOrigin.split(',').map(o => o.trim()).filter(Boolean);
    return origins.length === 1 ? origins[0] : origins;
  }
  
  return [
    frontendUrl,
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3002',
  ];
}

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

/**
 * Notifications Gateway with Authentication
 * 
 * Handles real-time notifications with:
 * - JWT authentication on connection
 * - User-specific notification channels
 * - Admin notification channels
 * - Role-based room access
 */
@WebSocketGateway({ 
  namespace: '/notifications',
  cors: {
    origin: getCorsOrigins(),
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization', 'Content-Type'],
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private readonly connectedClients = new Map<string, { userId: number; roles: string[] }>();

  constructor(
    private wsAuthMiddleware: WsAuthMiddleware,
    private configService: ConfigService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Notifications Gateway initialized');
    // Log CORS configuration in development
    if (isDevelopment()) {
      this.logger.debug('CORS origins:', getCorsOrigins());
    }
  }

  async handleConnection(@ConnectedSocket() client: Socket) {
    try {
      // Authenticate connection
      const user = await this.wsAuthMiddleware.authenticate(client);
      this.logger.log(
        `Notifications client connected: ${client.id} - User: ${user.id}, Role: ${user.role}`
      );
      
      // Auto-join user's personal notification channel
      client.join(`user-${user.id}`);
      
      // Store client info
      this.connectedClients.set(client.id, { 
        userId: user.id, 
        roles: [user.role] 
      });
      
      // Notify user about successful connection
      client.emit('connected', { userId: user.id, socketId: client.id });
    } catch (error) {
      this.logger.error(`Notifications connection rejected: ${error.message}`);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    const clientInfo = this.connectedClients.get(client.id);
    this.logger.log(
      `Notifications client disconnected: ${client.id}${clientInfo ? ` - User: ${clientInfo.userId}` : ''}`
    );
    this.connectedClients.delete(client.id);
  }

  /**
   * Subscribe to user-specific notifications
   * Users can only subscribe to their own notifications
   */
  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: number; roles?: string[] }
  ) {
    const user = client.data.user;
    
    if (!user) {
      throw new WsException('Authentication required');
    }

    // Users can only subscribe to their own notifications
    if (user.id !== data.userId && user.role !== Role.SUPER_ADMIN) {
      this.logger.warn(
        `User ${user.id} attempted to subscribe to user ${data.userId}'s notifications`
      );
      throw new WsException('Cannot subscribe to another user\'s notifications');
    }

    client.join(`user-${data.userId}`);
    this.connectedClients.set(client.id, { userId: data.userId, roles: data.roles || [user.role] });
    this.logger.log(`User ${data.userId} subscribed to notifications`);
    return { success: true, userId: data.userId };
  }

  /**
   * Subscribe to admin notifications
   * Only admin and super admin can subscribe
   */
  @SubscribeMessage('subscribe:admin')
  handleAdminSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: number; roles: string[] }
  ) {
    const user = client.data.user;
    
    if (!user) {
      throw new WsException('Authentication required');
    }

    // Only admins can subscribe to admin notifications
    const isAdmin = user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN;
    if (!isAdmin) {
      this.logger.warn(
        `Non-admin user ${user.id} with role ${user.role} attempted to subscribe to admin notifications`
      );
      throw new WsException('Admin privileges required');
    }

    // Verify user is subscribing for themselves
    if (user.id !== data.userId && user.role !== Role.SUPER_ADMIN) {
      throw new WsException('Cannot subscribe to another user\'s admin notifications');
    }

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
    
    return { success: true, rooms: ['admin:general', ...data.roles.map(r => `admin:role:${r.toLowerCase()}`)] };
  }

  /**
   * Unsubscribe from notifications
   * Users can only unsubscribe from their own notifications
   */
  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(@ConnectedSocket() client: Socket, @MessageBody() userId: number) {
    const user = client.data.user;
    
    if (!user) {
      throw new WsException('Authentication required');
    }

    // Users can only unsubscribe from their own notifications
    if (user.id !== userId && user.role !== Role.SUPER_ADMIN) {
      throw new WsException('Cannot unsubscribe from another user\'s notifications');
    }

    client.leave(`user-${userId}`);
    this.logger.log(`User ${userId} unsubscribed from notifications`);
    return { success: true };
  }

  /**
   * Mark notification as read
   * Ownership verification should be done at service level
   */
  @SubscribeMessage('notification:read')
  handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() notificationId: number
  ) {
    const user = client.data.user;
    
    if (!user) {
      throw new WsException('Authentication required');
    }

    // This would typically update the database with ownership check
    this.logger.log(`Notification ${notificationId} marked as read by user ${user.id}`);
    return { success: true, notificationId };
  }

  /**
   * Check if a user is currently connected
   */
  isUserConnected(userId: number): boolean {
    return Array.from(this.connectedClients.values()).some(
      client => client.userId === userId
    );
  }

  /**
   * Get all connected user IDs
   */
  getConnectedUserIds(): number[] {
    return Array.from(new Set(
      Array.from(this.connectedClients.values()).map(client => client.userId)
    ));
  }

  /**
   * Send notification to a specific user
   */
  sendNotification(userId: number, notification: any) {
    const isConnected = this.isUserConnected(userId);
    if (isConnected) {
      this.server.to(`user-${userId}`).emit('notification', notification);
      this.logger.log(`Notification sent to user ${userId} via WebSocket`);
    } else {
      this.logger.log(`User ${userId} not connected, skipping WebSocket delivery`);
    }
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
