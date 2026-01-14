import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { FCMService } from './fcm.service';
import { FCMTokensService } from './fcm-tokens.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ResourceOwnerGuard } from '../../common/guards/resource-owner.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ResourceType, SkipOwnership } from '../../common/decorators/resource-type.decorator';
import { Role } from '../../common/enums/roles.enum';

/**
 * Notifications Controller
 * Handles user notifications with strict ownership verification
 * - Users can only access their own notifications
 * - Admins can create system-wide notifications
 */
@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly fcmService: FCMService,
    private readonly fcmTokensService: FCMTokensService,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create notification (Admin only - system use)' })
  @ApiResponse({ status: 201, description: 'Notification created' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get('my-notifications')
  @SkipOwnership()
  @ApiOperation({ summary: 'Get current user notifications' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved' })
  getMyNotifications(@CurrentUser() user: any) {
    const userId = user?.userId || user?.sub || user?.id;
    return this.notificationsService.findByUser(userId);
  }

  @Get('unread')
  @SkipOwnership()
  @ApiOperation({ summary: 'Get unread notifications' })
  @ApiResponse({ status: 200, description: 'Unread notifications retrieved' })
  getUnread(@CurrentUser() user: any) {
    const userId = user?.userId || user?.sub || user?.id;
    return this.notificationsService.findUnread(userId);
  }

  @Get('unread-count')
  @SkipOwnership()
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved' })
  async getUnreadCount(@CurrentUser() user: any) {
    const userId = user?.userId || user?.sub || user?.id;
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  @Get('types')
  @SkipOwnership()
  @ApiOperation({ summary: 'Get available notification types' })
  @ApiResponse({ status: 200, description: 'Notification types retrieved' })
  getNotificationTypes() {
    return this.notificationsService.getNotificationTypes();
  }

  @Patch(':id/read')
  @ResourceType('notification')
  @ApiOperation({ summary: 'Mark notification as read (owner only)' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiResponse({ status: 403, description: 'Not your notification' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  markAsRead(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.notificationsService.markAsRead(id);
  }

  @Post('mark-all-read')
  @SkipOwnership()
  @ApiOperation({ summary: 'Mark all user notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  markAllAsRead(@CurrentUser() user: any) {
    const userId = user?.userId || user?.sub || user?.id;
    return this.notificationsService.markAllAsRead(userId);
  }

  @Post('register-device')
  @ApiOperation({ summary: 'Register device token for push notifications' })
  async registerDevice(@Body() body: { token: string }, @CurrentUser() user: any) {
    // Store the FCM token for the user (you may want to add a tokens table)
    // For now, just acknowledge the registration
    const userId = user?.userId || user?.sub || user?.id;
    return {
      message: 'Device token registered successfully',
      userId,
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
    const userId = user?.userId || user?.sub || user?.id;
    await this.notificationsService.bulkDelete(body.notificationIds, userId);
    return { success: true, deleted: body.notificationIds.length };
  }

  @Post('fcm/register')
  @ApiOperation({ summary: 'Register FCM device token' })
  async registerFCMToken(
    @Body() body: { token: string; deviceType?: string; deviceInfo?: any },
    @CurrentUser() user: any
  ) {
    try {
      // Get userId from user object (supports both userId and sub/id)
      const userId = user?.userId || user?.sub || user?.id;
      
      if (!userId) {
        return {
          success: false,
          message: 'Failed to register FCM token',
          error: 'User ID not found in authentication token',
        };
      }

      await this.fcmTokensService.registerToken(
        userId,
        body.token,
        body.deviceType,
        body.deviceInfo
      );
      
      return {
        success: true,
        message: 'FCM token registered successfully',
        userId,
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
      const userId = user?.userId || user?.sub || user?.id;
      
      if (!userId) {
        return {
          success: false,
          message: 'Failed to get FCM devices',
          error: 'User ID not found in authentication token',
        };
      }

      const devices = await this.fcmTokensService.getUserDevices(userId);
      
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

  @Get('preferences')
  @SkipOwnership()
  @ApiOperation({ summary: 'Get user notification preferences' })
  @ApiResponse({ status: 200, description: 'Preferences retrieved' })
  async getPreferences(@CurrentUser() user: any) {
    const userId = user?.userId || user?.sub || user?.id;
    return this.notificationsService.getUserNotificationPreferences(userId);
  }

  @Patch('preferences')
  @SkipOwnership()
  @ApiOperation({ summary: 'Update user notification preferences' })
  @ApiResponse({ status: 200, description: 'Preferences updated' })
  async updatePreferences(@CurrentUser() user: any, @Body() dto: UpdatePreferencesDto) {
    const userId = user?.userId || user?.sub || user?.id;
    return this.notificationsService.updateUserNotificationPreferences(userId, dto);
  }

  @Delete('all')
  @SkipOwnership()
  @ApiOperation({ summary: 'Delete all user notifications' })
  @ApiResponse({ status: 200, description: 'All notifications deleted' })
  async deleteAll(@CurrentUser() user: any) {
    const userId = user?.userId || user?.sub || user?.id;
    return this.notificationsService.deleteAll(userId);
  }
}
