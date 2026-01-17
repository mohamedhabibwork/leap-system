import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser, getUserId } from '../../common/types/request.types';
import { NotificationsService } from './notifications.service';
import { FCMTokensService } from './fcm-tokens.service';
import {
  Notification,
  NotificationStatistics,
  NotificationTypesResponse,
  NotificationPreferences,
  FCMDevice,
} from './types/notification.type';
import {
  CreateNotificationInput,
  UpdateNotificationInput,
  UpdateNotificationPreferencesInput,
  BulkDeleteNotificationsInput,
} from './types/notification.input';
import { Role } from '../../common/enums/roles.enum';

@Resolver(() => Notification)
export class NotificationsResolver {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly fcmTokensService: FCMTokensService,
  ) {}

  @Query(() => [Notification], { name: 'notifications' })
  @UseGuards(JwtAuthGuard)
  async getMyNotifications(@CurrentUser() user: AuthenticatedUser) {
    const userId = getUserId(user);
    return this.notificationsService.findByUser(userId);
  }

  @Query(() => [Notification], { name: 'unreadNotifications' })
  @UseGuards(JwtAuthGuard)
  async getUnreadNotifications(@CurrentUser() user: AuthenticatedUser) {
    const userId = getUserId(user);
    return this.notificationsService.findUnread(userId);
  }

  @Query(() => Int, { name: 'unreadNotificationCount' })
  @UseGuards(JwtAuthGuard)
  async getUnreadCount(@CurrentUser() user: AuthenticatedUser) {
    const userId = getUserId(user);
    return this.notificationsService.getUnreadCount(userId);
  }

  @Query(() => NotificationStatistics, { name: 'notificationStatistics' })
  @UseGuards(JwtAuthGuard)
  async getNotificationStatistics(@CurrentUser() user: AuthenticatedUser) {
    const userId = getUserId(user);
    return this.notificationsService.getStatistics(userId);
  }

  @Query(() => NotificationTypesResponse, { name: 'notificationTypes' })
  @UseGuards(JwtAuthGuard)
  async getNotificationTypes() {
    return this.notificationsService.getNotificationTypes();
  }

  @Query(() => NotificationPreferences, { name: 'notificationPreferences' })
  @UseGuards(JwtAuthGuard)
  async getNotificationPreferences(@CurrentUser() user: AuthenticatedUser) {
    const userId = getUserId(user);
    return this.notificationsService.getUserNotificationPreferences(userId);
  }

  @Mutation(() => Notification)
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async createNotification(@Args('input') input: CreateNotificationInput) {
    return this.notificationsService.create(input);
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard)
  async markNotificationAsRead(@Args('id', { type: () => Int }) id: number) {
    await this.notificationsService.markAsRead(id);
    return 'Notification marked as read';
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard)
  async markAllNotificationsAsRead(@CurrentUser() user: AuthenticatedUser) {
    const userId = getUserId(user);
    await this.notificationsService.markAllAsRead(userId);
    return 'All notifications marked as read';
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard)
  async deleteNotification(@Args('id', { type: () => Int }) id: number) {
    await this.notificationsService.remove(id);
    return 'Notification deleted successfully';
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard)
  async bulkDeleteNotifications(
    @Args('input') input: BulkDeleteNotificationsInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const userId = getUserId(user);
    await this.notificationsService.bulkDelete(input.notificationIds, userId);
    return 'Notifications deleted successfully';
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard)
  async deleteAllNotifications(@CurrentUser() user: AuthenticatedUser) {
    const userId = getUserId(user);
    await this.notificationsService.deleteAll(userId);
    return 'All notifications deleted successfully';
  }

  @Mutation(() => NotificationPreferences)
  @UseGuards(JwtAuthGuard)
  async updateNotificationPreferences(
    @Args('input') input: UpdateNotificationPreferencesInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const userId = getUserId(user);
    return this.notificationsService.updateUserNotificationPreferences(userId, input);
  }

  @Query(() => [FCMDevice], { name: 'fcmDevices' })
  @UseGuards(JwtAuthGuard)
  async getFCMDevices(@CurrentUser() user: AuthenticatedUser) {
    const userId = getUserId(user);
    return this.fcmTokensService.getUserDevices(userId);
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard)
  async registerFCMToken(
    @Args('token') token: string,
    @Args('deviceType', { nullable: true, defaultValue: null }) deviceType: string | null,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const userId = getUserId(user);
    await this.fcmTokensService.registerToken(userId, token, deviceType || undefined);
    return 'FCM token registered successfully';
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard)
  async unregisterFCMToken(@Args('token') token: string) {
    await this.fcmTokensService.unregisterToken(token);
    return 'FCM token unregistered successfully';
  }
}
