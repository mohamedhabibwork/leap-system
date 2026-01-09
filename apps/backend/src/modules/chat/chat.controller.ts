import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateRoomDto, SendMessageDto, GetMessagesDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms')
  @ApiOperation({ summary: 'Get all chat rooms for current user' })
  @ApiResponse({ status: 200, description: 'Chat rooms retrieved successfully' })
  async getRooms(@CurrentUser() user: any) {
    const rooms = await this.chatService.getRoomsByUserId(user.userId);
    return { data: rooms };
  }

  @Post('rooms')
  @ApiOperation({ summary: 'Create a new chat room' })
  @ApiResponse({ status: 201, description: 'Chat room created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createRoom(@Body() createRoomDto: CreateRoomDto, @CurrentUser() user: any) {
    const room = await this.chatService.createRoom(createRoomDto, user.userId);
    return { data: room };
  }

  @Get('rooms/:id')
  @ApiOperation({ summary: 'Get a single chat room by ID' })
  @ApiResponse({ status: 200, description: 'Chat room retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access forbidden' })
  @ApiResponse({ status: 404, description: 'Chat room not found' })
  async getRoom(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const room = await this.chatService.getRoomById(id, user.userId);
    return { data: room };
  }

  @Get('rooms/:id/messages')
  @ApiOperation({ summary: 'Get messages for a chat room' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access forbidden' })
  async getMessages(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: GetMessagesDto,
    @CurrentUser() user: any,
  ) {
    const messages = await this.chatService.getMessages(id, user.userId, query);
    return { data: messages };
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send a message (REST fallback when WebSocket unavailable)' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 403, description: 'Access forbidden' })
  async sendMessage(@Body() sendMessageDto: SendMessageDto, @CurrentUser() user: any) {
    const message = await this.chatService.sendMessage(sendMessageDto, user.userId);
    return { data: message };
  }

  @Post('rooms/:id/read')
  @ApiOperation({ summary: 'Mark all messages in a room as read' })
  @ApiResponse({ status: 200, description: 'Messages marked as read' })
  @ApiResponse({ status: 403, description: 'Access forbidden' })
  async markAsRead(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    await this.chatService.markAsRead(id, user.userId);
    return { message: 'Messages marked as read successfully' };
  }

  @Delete('rooms/:id')
  @ApiOperation({ summary: 'Leave a chat room' })
  @ApiResponse({ status: 200, description: 'Left chat room successfully' })
  @ApiResponse({ status: 403, description: 'Access forbidden' })
  async leaveRoom(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    await this.chatService.leaveRoom(id, user.userId);
    return { message: 'Left chat room successfully' };
  }
}
