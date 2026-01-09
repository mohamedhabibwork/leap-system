import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger('ChatGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message:send')
  handleMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    this.logger.log(`Message from ${client.id}: ${JSON.stringify(data)}`);
    
    // Broadcast to room or specific user
    if (data.roomId) {
      client.to(data.roomId).emit('message:received', data);
    }
    
    return { success: true, messageId: Date.now() };
  }

  @SubscribeMessage('room:join')
  handleJoinRoom(@MessageBody() data: { roomId: string }, @ConnectedSocket() client: Socket) {
    client.join(data.roomId);
    this.logger.log(`Client ${client.id} joined room ${data.roomId}`);
    return { success: true };
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    client.to(data.roomId).emit('user:typing', { userId: data.userId });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    client.to(data.roomId).emit('user:stopped-typing', { userId: data.userId });
  }
}
