import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { WsAuthMiddleware } from '../../common/middleware/ws-auth.middleware';

/**
 * Chat Gateway with Authentication
 * 
 * Handles real-time chat functionality with:
 * - JWT authentication on connection
 * - Room-based authorization
 * - Message sender verification
 */
@WebSocketGateway({ 
  cors: { origin: '*' }, 
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger('ChatGateway');

  constructor(private wsAuthMiddleware: WsAuthMiddleware) {}

  async handleConnection(client: Socket) {
    try {
      // Authenticate connection
      const user = await this.wsAuthMiddleware.authenticate(client);
      this.logger.log(
        `Chat client connected: ${client.id} - User: ${user.id}, Role: ${user.role}`
      );
      
      // Join user's personal room for direct messages
      client.join(`user:${user.id}`);
      
      // Notify user about successful connection
      client.emit('connected', { userId: user.id, socketId: client.id });
    } catch (error) {
      this.logger.error(`Chat connection rejected: ${error.message}`);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user;
    this.logger.log(
      `Chat client disconnected: ${client.id}${user ? ` - User: ${user.id}` : ''}`
    );
  }

  @SubscribeMessage('message:send')
  async handleMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const user = client.data.user;
    
    if (!user) {
      throw new WsException('Authentication required');
    }

    // Verify user is authorized to send to this room
    const canAccess = await this.wsAuthMiddleware.canAccessRoom(client, data.roomId);
    if (!canAccess) {
      this.logger.warn(
        `User ${user.id} attempted to send message to unauthorized room ${data.roomId}`
      );
      throw new WsException('Not authorized to send messages to this room');
    }

    // Attach sender info
    const message = {
      ...data,
      senderId: user.id,
      senderEmail: user.email,
      timestamp: new Date(),
    };

    this.logger.log(`Message from user ${user.id} to room ${data.roomId}`);
    
    // Broadcast to room
    if (data.roomId) {
      client.to(data.roomId).emit('message:received', message);
    }
    
    return { success: true, messageId: Date.now(), message };
  }

  @SubscribeMessage('room:join')
  async handleJoinRoom(@MessageBody() data: { roomId: string }, @ConnectedSocket() client: Socket) {
    const user = client.data.user;
    
    if (!user) {
      throw new WsException('Authentication required');
    }

    // Verify user can join this room
    const canAccess = await this.wsAuthMiddleware.canAccessRoom(client, data.roomId);
    if (!canAccess) {
      this.logger.warn(`User ${user.id} attempted to join unauthorized room ${data.roomId}`);
      throw new WsException('Not authorized to join this room');
    }

    client.join(data.roomId);
    this.logger.log(`User ${user.id} (${client.id}) joined room ${data.roomId}`);
    
    // Notify room about new member
    client.to(data.roomId).emit('user:joined', { 
      userId: user.id, 
      email: user.email,
      timestamp: new Date(),
    });
    
    return { success: true, roomId: data.roomId };
  }

  @SubscribeMessage('typing:start')
  async handleTypingStart(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const user = client.data.user;
    
    if (!user) {
      throw new WsException('Authentication required');
    }

    // Verify user is in the room
    const canAccess = await this.wsAuthMiddleware.canAccessRoom(client, data.roomId);
    if (!canAccess) {
      throw new WsException('Not authorized to access this room');
    }

    client.to(data.roomId).emit('user:typing', { 
      userId: user.id,
      email: user.email,
    });
    
    return { success: true };
  }

  @SubscribeMessage('typing:stop')
  async handleTypingStop(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const user = client.data.user;
    
    if (!user) {
      throw new WsException('Authentication required');
    }

    client.to(data.roomId).emit('user:stopped-typing', { 
      userId: user.id,
      email: user.email,
    });
    
    return { success: true };
  }
}
