import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WsAuthMiddleware } from '../../common/middleware/ws-auth.middleware';
import { ChatService } from './chat.service';
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

/**
 * Chat Gateway with Authentication and Message Persistence
 * 
 * Handles real-time chat functionality with:
 * - JWT authentication on connection
 * - Room-based authorization
 * - Message sender verification
 * - Database persistence for all messages
 * - Message editing and deletion
 * - Online/presence status tracking
 */
@WebSocketGateway({ 
  cors: {
    origin: getCorsOrigins(),
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization', 'Content-Type'],
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer() server: Server;
  private logger = new Logger('ChatGateway');
  
  // Track online users: userId -> Set of socket IDs
  private onlineUsers = new Map<number, Set<string>>();

  constructor(
    private readonly wsAuthMiddleware: WsAuthMiddleware,
    private readonly chatService: ChatService,
    private readonly configService: ConfigService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Chat Gateway initialized');
    // Log CORS configuration in development
    if (isDevelopment()) {
      this.logger.debug('CORS origins:', getCorsOrigins());
    }
  }

  async handleConnection(client: Socket) {
    try {
      // Authenticate connection
      const user = await this.wsAuthMiddleware.authenticate(client);
      this.logger.log(
        `Chat client connected: ${client.id} - User: ${user.id}, Role: ${user.role}`
      );
      
      // Join user's personal room for direct messages
      client.join(`user:${user.id}`);
      
      // Track online status
      if (!this.onlineUsers.has(user.id)) {
        this.onlineUsers.set(user.id, new Set());
      }
      this.onlineUsers.get(user.id)!.add(client.id);
      
      // Broadcast online status to all connected clients
      this.server.emit('user:online', { 
        userId: user.id,
        timestamp: new Date(),
      });
      
      // Notify user about successful connection and send online users list
      client.emit('connected', { 
        userId: user.id, 
        socketId: client.id,
        onlineUsers: Array.from(this.onlineUsers.keys()),
      });
    } catch (error) {
      this.logger.error(`Chat connection rejected: ${error.message}`);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user;
    
    if (user) {
      // Remove socket from user's connections
      const userSockets = this.onlineUsers.get(user.id);
      if (userSockets) {
        userSockets.delete(client.id);
        
        // If no more sockets, user is offline
        if (userSockets.size === 0) {
          this.onlineUsers.delete(user.id);
          
          // Broadcast offline status
          this.server.emit('user:offline', { 
            userId: user.id,
            timestamp: new Date(),
          });
        }
      }
    }
    
    this.logger.log(
      `Chat client disconnected: ${client.id}${user ? ` - User: ${user.id}` : ''}`
    );
  }

  @SubscribeMessage('presence:get')
  async handleGetPresence(@ConnectedSocket() client: Socket) {
    const user = client.data.user;
    
    if (!user) {
      throw new WsException('Authentication required');
    }

    return { 
      success: true, 
      onlineUsers: Array.from(this.onlineUsers.keys()),
    };
  }

  @SubscribeMessage('presence:check')
  async handleCheckPresence(
    @MessageBody() data: { userIds: number[] }, 
    @ConnectedSocket() client: Socket
  ) {
    const user = client.data.user;
    
    if (!user) {
      throw new WsException('Authentication required');
    }

    const onlineStatuses = data.userIds.reduce((acc, userId) => {
      acc[userId] = this.onlineUsers.has(userId);
      return acc;
    }, {} as Record<number, boolean>);

    return { 
      success: true, 
      statuses: onlineStatuses,
    };
  }

  @SubscribeMessage('message:send')
  async handleMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const user = client.data.user;
    
    if (!user) {
      throw new WsException('Authentication required');
    }

    const roomId = typeof data.roomId === 'string' ? parseInt(data.roomId, 10) : data.roomId;

    // Verify user is authorized to send to this room
    const canAccess = await this.chatService.checkUserAccess(roomId, user.id);
    if (!canAccess) {
      this.logger.warn(
        `User ${user.id} attempted to send message to unauthorized room ${roomId}`
      );
      throw new WsException('Not authorized to send messages to this room');
    }

    try {
      // Persist message to database
      const savedMessage = await this.chatService.sendMessage({
        roomId,
        content: data.content,
        attachmentUrl: data.attachmentUrl,
        replyToMessageId: data.replyToMessageId,
      }, user.id);

      this.logger.log(`Message ${savedMessage.id} from user ${user.id} to room ${roomId}`);
      
      // Prepare message payload for broadcast
      const messagePayload = {
        ...savedMessage,
        senderEmail: user.email,
        timestamp: savedMessage.createdAt,
      };

      // Broadcast to room (excluding sender)
      client.to(roomId.toString()).emit('message:received', messagePayload);
      
      // Return success with the saved message
      return { success: true, message: messagePayload };
    } catch (error) {
      this.logger.error(`Failed to save message: ${error.message}`);
      throw new WsException('Failed to send message');
    }
  }

  @SubscribeMessage('message:edit')
  async handleMessageEdit(@MessageBody() data: { messageId: number; content: string }, @ConnectedSocket() client: Socket) {
    const user = client.data.user;
    
    if (!user) {
      throw new WsException('Authentication required');
    }

    try {
      const updatedMessage = await this.chatService.editMessage({
        messageId: data.messageId,
        content: data.content,
      }, user.id);

      this.logger.log(`Message ${data.messageId} edited by user ${user.id}`);
      
      // Broadcast edited message to room
      const roomId = updatedMessage.roomId.toString();
      this.server.to(roomId).emit('message:edited', {
        ...updatedMessage,
        editedBy: user.id,
      });
      
      return { success: true, message: updatedMessage };
    } catch (error) {
      this.logger.error(`Failed to edit message: ${error.message}`);
      throw new WsException(error.message || 'Failed to edit message');
    }
  }

  @SubscribeMessage('message:delete')
  async handleMessageDelete(@MessageBody() data: { messageId: number }, @ConnectedSocket() client: Socket) {
    const user = client.data.user;
    
    if (!user) {
      throw new WsException('Authentication required');
    }

    try {
      const result = await this.chatService.deleteMessage(data.messageId, user.id);

      this.logger.log(`Message ${data.messageId} deleted by user ${user.id}`);
      
      // Broadcast deletion to room
      this.server.to(result.roomId.toString()).emit('message:deleted', {
        messageId: result.messageId,
        roomId: result.roomId,
        deletedBy: user.id,
      });
      
      return { success: true, ...result };
    } catch (error) {
      this.logger.error(`Failed to delete message: ${error.message}`);
      throw new WsException(error.message || 'Failed to delete message');
    }
  }

  @SubscribeMessage('room:join')
  async handleJoinRoom(@MessageBody() data: { roomId: string }, @ConnectedSocket() client: Socket) {
    const user = client.data.user;
    
    if (!user) {
      throw new WsException('Authentication required');
    }

    const roomId = typeof data.roomId === 'string' ? parseInt(data.roomId, 10) : data.roomId;

    // Verify user can join this room using ChatService
    const canAccess = await this.chatService.checkUserAccess(roomId, user.id);
    if (!canAccess) {
      this.logger.warn(`User ${user.id} attempted to join unauthorized room ${roomId}`);
      throw new WsException('Not authorized to join this room');
    }

    client.join(roomId.toString());
    this.logger.log(`User ${user.id} (${client.id}) joined room ${roomId}`);
    
    // Notify room about new member with online status
    client.to(roomId.toString()).emit('user:joined', { 
      userId: user.id, 
      email: user.email,
      isOnline: true,
      timestamp: new Date(),
    });
    
    // Get online users in this room
    const roomParticipants = await this.chatService.getRoomParticipantsWithInfo(roomId);
    const onlineInRoom = roomParticipants
      .filter(p => this.onlineUsers.has(p.userId))
      .map(p => p.userId);
    
    return { 
      success: true, 
      roomId: roomId.toString(),
      onlineUsers: onlineInRoom,
    };
  }

  @SubscribeMessage('room:leave')
  async handleLeaveRoom(@MessageBody() data: { roomId: string }, @ConnectedSocket() client: Socket) {
    const user = client.data.user;
    
    if (!user) {
      throw new WsException('Authentication required');
    }

    const roomId = typeof data.roomId === 'string' ? parseInt(data.roomId, 10) : data.roomId;

    client.leave(roomId.toString());
    this.logger.log(`User ${user.id} (${client.id}) left room ${roomId}`);
    
    // Notify room about member leaving
    client.to(roomId.toString()).emit('user:left', { 
      userId: user.id, 
      email: user.email,
      timestamp: new Date(),
    });
    
    return { success: true, roomId: roomId.toString() };
  }

  @SubscribeMessage('room:read')
  async handleMarkAsRead(@MessageBody() data: { roomId: string }, @ConnectedSocket() client: Socket) {
    const user = client.data.user;
    
    if (!user) {
      throw new WsException('Authentication required');
    }

    const roomId = typeof data.roomId === 'string' ? parseInt(data.roomId, 10) : data.roomId;

    try {
      await this.chatService.markAsRead(roomId, user.id);
      
      // Notify room that user has read messages
      client.to(roomId.toString()).emit('user:read', { 
        userId: user.id,
        roomId: roomId.toString(),
        timestamp: new Date(),
      });
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to mark as read: ${error.message}`);
      throw new WsException('Failed to mark messages as read');
    }
  }

  @SubscribeMessage('typing:start')
  async handleTypingStart(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const user = client.data.user;
    
    if (!user) {
      throw new WsException('Authentication required');
    }

    const roomId = typeof data.roomId === 'string' ? parseInt(data.roomId, 10) : data.roomId;

    // Verify user is in the room
    const canAccess = await this.chatService.checkUserAccess(roomId, user.id);
    if (!canAccess) {
      throw new WsException('Not authorized to access this room');
    }

    client.to(roomId.toString()).emit('user:typing', { 
      userId: user.id,
      email: user.email,
      roomId: roomId.toString(),
    });
    
    return { success: true };
  }

  @SubscribeMessage('typing:stop')
  async handleTypingStop(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const user = client.data.user;
    
    if (!user) {
      throw new WsException('Authentication required');
    }

    const roomId = typeof data.roomId === 'string' ? parseInt(data.roomId, 10) : data.roomId;

    client.to(roomId.toString()).emit('user:stopped-typing', { 
      userId: user.id,
      email: user.email,
      roomId: roomId.toString(),
    });
    
    return { success: true };
  }

  /**
   * Check if a user is online
   */
  isUserOnline(userId: number): boolean {
    return this.onlineUsers.has(userId);
  }

  /**
   * Get all online user IDs
   */
  getOnlineUsers(): number[] {
    return Array.from(this.onlineUsers.keys());
  }

  /**
   * Broadcast a message to all users in a room
   * Can be called from other services
   */
  broadcastToRoom(roomId: string | number, event: string, data: any) {
    this.server.to(roomId.toString()).emit(event, data);
  }

  /**
   * Send a notification to a specific user
   * Can be called from other services
   */
  sendToUser(userId: number, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }
}
