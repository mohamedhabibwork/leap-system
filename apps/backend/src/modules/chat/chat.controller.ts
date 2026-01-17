import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateRoomDto, SendMessageDto, GetMessagesDto, EditMessageDto } from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser, getUserId } from '../../common/types/request.types';

@ApiTags('chat')
@Controller('chat')
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms')
  @ApiOperation({ summary: 'Get all chat rooms for current user' })
  @ApiResponse({ status: 200, description: 'Chat rooms retrieved successfully' })
  async getRooms(@CurrentUser() user: AuthenticatedUser) {
    try {
      const rooms = await this.chatService.getRoomsByUserId(getUserId(user));
      return { data: rooms };
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      // Return empty array instead of throwing to prevent frontend errors
      return { data: [] };
    }
  }

  @Post('rooms')
  @ApiOperation({ summary: 'Create a new chat room' })
  @ApiResponse({ status: 201, description: 'Chat room created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createRoom(@Body() createRoomDto: CreateRoomDto, @CurrentUser() user: AuthenticatedUser) {
    const room = await this.chatService.createRoom(createRoomDto, getUserId(user));
    return { data: room };
  }

  @Get('rooms/:id')
  @ApiOperation({ summary: 'Get a single chat room by ID' })
  @ApiResponse({ status: 200, description: 'Chat room retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access forbidden' })
  @ApiResponse({ status: 404, description: 'Chat room not found' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  async getRoom(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    const room = await this.chatService.getRoomById(id, getUserId(user));
    return { data: room };
  }

  @Get('rooms/:id/messages')
  @ApiOperation({ summary: 'Get messages for a chat room' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access forbidden' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  async getMessages(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: GetMessagesDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const messages = await this.chatService.getMessages(id, getUserId(user), query);
    return { data: messages };
  }

  @Get('rooms/:id/messages/before/:messageId')
  @ApiOperation({ summary: 'Get messages before a specific message (for infinite scroll)' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access forbidden' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  @ApiParam({ name: 'messageId', description: 'Message ID to get messages before' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of messages to fetch' })
  async getMessagesBefore(
    @Param('id', ParseIntPipe) id: number,
    @Param('messageId', ParseIntPipe) messageId: number,
    @Query('limit') limit: number = 50,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const messages = await this.chatService.getMessagesBefore(id, getUserId(user), messageId, limit);
    return { data: messages };
  }

  @Get('rooms/:id/participants')
  @ApiOperation({ summary: 'Get participants for a chat room' })
  @ApiResponse({ status: 200, description: 'Participants retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access forbidden' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  async getRoomParticipants(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    // Verify user has access to this room
    const hasAccess = await this.chatService.checkUserAccess(id, getUserId(user));
    if (!hasAccess) {
      return { error: 'Access forbidden' };
    }
    const participants = await this.chatService.getRoomParticipantsWithInfo(id);
    return { data: participants };
  }

  @Post('rooms/:id/participants')
  @ApiOperation({ summary: 'Add a participant to a chat room' })
  @ApiResponse({ status: 201, description: 'Participant added successfully' })
  @ApiResponse({ status: 403, description: 'Only room admins can add participants' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  async addParticipant(
    @Param('id', ParseIntPipe) id: number,
    @Body('userId', ParseIntPipe) participantUserId: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.chatService.addParticipant(id, participantUserId, getUserId(user));
    return { data: result };
  }

  @Delete('rooms/:id/participants/:userId')
  @ApiOperation({ summary: 'Remove a participant from a chat room' })
  @ApiResponse({ status: 200, description: 'Participant removed successfully' })
  @ApiResponse({ status: 403, description: 'Only room admins can remove participants' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  @ApiParam({ name: 'userId', description: 'User ID to remove' })
  async removeParticipant(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) participantUserId: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.chatService.removeParticipant(id, participantUserId, getUserId(user));
    return { message: 'Participant removed successfully' };
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send a message (REST fallback when WebSocket unavailable)' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 403, description: 'Access forbidden' })
  async sendMessage(@Body() sendMessageDto: SendMessageDto, @CurrentUser() user: AuthenticatedUser) {
    const message = await this.chatService.sendMessage(sendMessageDto, getUserId(user));
    return { data: message };
  }

  @Put('messages/:id')
  @ApiOperation({ summary: 'Edit a message' })
  @ApiResponse({ status: 200, description: 'Message edited successfully' })
  @ApiResponse({ status: 403, description: 'You can only edit your own messages' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  @ApiParam({ name: 'id', description: 'Message ID' })
  async editMessage(
    @Param('id', ParseIntPipe) id: number,
    @Body('content') content: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const message = await this.chatService.editMessage({ messageId: id, content }, getUserId(user));
    return { data: message };
  }

  @Delete('messages/:id')
  @ApiOperation({ summary: 'Delete a message' })
  @ApiResponse({ status: 200, description: 'Message deleted successfully' })
  @ApiResponse({ status: 403, description: 'You can only delete your own messages' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  @ApiParam({ name: 'id', description: 'Message ID' })
  async deleteMessage(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    const result = await this.chatService.deleteMessage(id, getUserId(user));
    return { data: result };
  }

  @Get('messages/:id/reads')
  @ApiOperation({ summary: 'Get read receipts for a message' })
  @ApiResponse({ status: 200, description: 'Read receipts retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access forbidden' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  @ApiParam({ name: 'id', description: 'Message ID' })
  async getMessageReads(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    const reads = await this.chatService.getMessageReads(id, getUserId(user));
    return { data: reads };
  }

  @Post('rooms/:id/read')
  @ApiOperation({ summary: 'Mark all messages in a room as read' })
  @ApiResponse({ status: 200, description: 'Messages marked as read' })
  @ApiResponse({ status: 403, description: 'Access forbidden' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  async markAsRead(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    await this.chatService.markAsRead(id, getUserId(user));
    return { message: 'Messages marked as read successfully' };
  }

  @Delete('rooms/:id')
  @ApiOperation({ summary: 'Leave a chat room' })
  @ApiResponse({ status: 200, description: 'Left chat room successfully' })
  @ApiResponse({ status: 403, description: 'Access forbidden' })
  @ApiParam({ name: 'id', description: 'Room ID' })
  async leaveRoom(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    await this.chatService.leaveRoom(id, getUserId(user));
    return { message: 'Left chat room successfully' };
  }
}
