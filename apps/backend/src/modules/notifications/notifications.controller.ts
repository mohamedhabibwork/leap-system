import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { FCMService } from './fcm.service';
import { FCMTokensService } from './fcm-tokens.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly fcmService: FCMService,
    private readonly fcmTokensService: FCMTokensService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create notification (system use)' })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get('my-notifications')
  @ApiOperation({ summary: 'Get current user notifications' })
  getMyNotifications(@CurrentUser() user: any) {
    return this.notificationsService.findByUser(user.userId);
  }

  @Get('unread')
  @ApiOperation({ summary: 'Get unread notifications' })
  getUnread(@CurrentUser() user: any) {
    return this.notificationsService.findUnread(user.userId);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(@CurrentUser() user: any) {
    const count = await this.notificationsService.getUnreadCount(user.userId);
    return { count };
  }

  @Get('types')
  @ApiOperation({ summary: 'Get available notification types' })
  getNotificationTypes() {
    return this.notificationsService.getNotificationTypes();
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.markAsRead(id);
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllAsRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllAsRead(user.userId);
  }

  @Post('register-device')
  @ApiOperation({ summary: 'Register device token for push notifications' })
  async registerDevice(@Body() body: { token: string }, @CurrentUser() user: any) {
    // Store the FCM token for the user (you may want to add a tokens table)
    // For now, just acknowledge the registration
    return {
      message: 'Device token registered successfully',
      userId: user.userId,
    };
  }

  @Post('send-test')
  @ApiOperation({ summary: 'Send test notification' })
  async sendTestNotification(@Body() body: { token: string }) {
    try {
      const result = await this.fcmService.sendNotification(
        body.token,
        'Test Notification',
        'This is a test notification from LEAP PM',
        { type: 'test' }
      );
      return { success: true, messageId: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.remove(id);
  }

  @Post('bulk-delete')
  @ApiOperation({ summary: 'Delete multiple notifications' })
  async bulkDelete(@Body() body: { notificationIds: number[] }, @CurrentUser() user: any) {
    await this.notificationsService.bulkDelete(body.notificationIds, user.userId);
    return { success: true, deleted: body.notificationIds.length };
  }

  @Post('fcm/register')
  @ApiOperation({ summary: 'Register FCM device token' })
  async registerFCMToken(
    @Body() body: { token: string; deviceType?: string; deviceInfo?: any },
    @CurrentUser() user: any
  ) {
    try {
      await this.fcmTokensService.registerToken(
        user.userId,
        body.token,
        body.deviceType,
        body.deviceInfo
      );
      
      return {
        success: true,
        message: 'FCM token registered successfully',
        userId: user.userId,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to register FCM token',
        error: error.message,
      };
    }
  }

  @Delete('fcm/unregister')
  @ApiOperation({ summary: 'Unregister FCM device token' })
  async unregisterFCMToken(@Body() body: { token: string }, @CurrentUser() user: any) {
    try {
      await this.fcmTokensService.unregisterToken(body.token);
      
      return {
        success: true,
        message: 'FCM token unregistered successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to unregister FCM token',
        error: error.message,
      };
    }
  }

  @Get('fcm/devices')
  @ApiOperation({ summary: 'Get registered FCM devices' })
  async getFCMDevices(@CurrentUser() user: any) {
    try {
      const devices = await this.fcmTokensService.getUserDevices(user.userId);
      
      return {
        success: true,
        devices,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get FCM devices',
        error: error.message,
      };
    }
  }
}
