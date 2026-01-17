import { Injectable, Inject, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq, and, or, sql } from 'drizzle-orm';
import { friends, users, lookups, lookupTypes } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class FriendsService {
  private readonly logger = new Logger(FriendsService.name);

  constructor(
    @Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>,
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {}

  async sendFriendRequest(userId: number, friendId: number) {
    try {
      // 1. Check if users are the same
      if (userId === friendId) {
        throw new BadRequestException('You cannot send a friend request to yourself');
      }

      // 2. Check if friend exists
      const [friend] = await this.db
        .select()
        .from(users)
        .where(eq(users.id, friendId))
        .limit(1);

      if (!friend) {
        throw new NotFoundException('User not found');
      }

      // 3. Check if friendship already exists
      const [existing] = await this.db
        .select()
        .from(friends)
        .where(
          or(
            and(eq(friends.userId, userId), eq(friends.friendId, friendId)),
            and(eq(friends.userId, friendId), eq(friends.friendId, userId))
          )
        )
        .limit(1);

      if (existing) {
        throw new BadRequestException('Friend request already exists or you are already friends');
      }

      // 4. Get pending status ID
      const [pendingStatus] = await this.db
        .select({ id: lookups.id })
        .from(lookups)
        .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
        .where(and(
          eq(lookupTypes.code, 'friend_status'),
          eq(lookups.code, 'pending')
        ))
        .limit(1);

      if (!pendingStatus) {
        this.logger.error('Pending friend status not found in lookups');
        throw new BadRequestException('System configuration error');
      }

      // 5. Create friend request
      const [request] = await this.db.insert(friends).values({
        userId,
        friendId,
        statusId: pendingStatus.id,
        requestedAt: new Date(),
      } ).returning();

      // 6. Get requester info
      const [requester] = await this.db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!requester) {
        this.logger.warn(`Requester user ${userId} not found`);
        return request;
      }

      const requesterName = `${requester.firstName || ''} ${requester.lastName || ''}`.trim() || requester.username;

      // 7. Get notification type ID
      const [notifType] = await this.db
        .select({ id: lookups.id })
        .from(lookups)
        .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
        .where(and(
          eq(lookupTypes.code, 'notification_type'),
          eq(lookups.code, 'friend_request_received')
        ))
        .limit(1);

      if (notifType) {
        // 8. Notify recipient
        await this.notificationsService.sendMultiChannelNotification({
          userId: friendId,
          notificationTypeId: notifType.id,
          title: 'New Friend Request',
          message: `${requesterName} sent you a friend request`,
          linkUrl: `/friends/requests`,
          channels: ['database', 'websocket', 'fcm', 'email'],
          emailData: {
            templateMethod: 'sendFriendRequestReceivedEmail',
            data: {
              userName: `${friend.firstName || ''} ${friend.lastName || ''}`.trim() || friend.username,
              requesterName,
              requesterProfileUrl: `${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001'}/profile/${userId}`,
              requestUrl: `${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001'}/friends/requests`,
            }
          }
        });

        this.logger.log(`Friend request notification sent to user ${friendId}`);
      }

      return request;
    } catch (error) {
      this.logger.error('Error sending friend request:', error);
      throw error;
    }
  }

  async acceptFriendRequest(userId: number, requestId: number) {
    try {
      // 1. Find the friend request
      const [request] = await this.db
        .select()
        .from(friends)
        .where(and(
          eq(friends.id, requestId),
          eq(friends.friendId, userId)
        ))
        .limit(1);

      if (!request) {
        throw new NotFoundException('Friend request not found');
      }

      // 2. Get accepted status ID
      const [acceptedStatus] = await this.db
        .select({ id: lookups.id })
        .from(lookups)
        .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
        .where(and(
          eq(lookupTypes.code, 'friend_status'),
          eq(lookups.code, 'accepted')
        ))
        .limit(1);

      if (!acceptedStatus) {
        this.logger.error('Accepted friend status not found in lookups');
        throw new BadRequestException('System configuration error');
      }

      // 3. Update request status
      const [updatedRequest] = await this.db
        .update(friends)
        .set({ 
          statusId: acceptedStatus.id,
          acceptedAt: new Date()
        })
        .where(eq(friends.id, requestId))
        .returning();

      // 4. Get accepter info
      const [accepter] = await this.db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!accepter) {
        this.logger.warn(`Accepter user ${userId} not found`);
        return updatedRequest;
      }

      const accepterName = `${accepter.firstName || ''} ${accepter.lastName || ''}`.trim() || accepter.username;

      // 5. Get notification type ID
      const [notifType] = await this.db
        .select({ id: lookups.id })
        .from(lookups)
        .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
        .where(and(
          eq(lookupTypes.code, 'notification_type'),
          eq(lookups.code, 'friend_request_accepted')
        ))
        .limit(1);

      if (notifType) {
        // 6. Notify original requester
        await this.notificationsService.sendMultiChannelNotification({
          userId: request.userId,
          notificationTypeId: notifType.id,
          title: 'Friend Request Accepted',
          message: `${accepterName} accepted your friend request`,
          linkUrl: `/profile/${userId}`,
          channels: ['database', 'websocket', 'fcm', 'email'],
          emailData: {
            templateMethod: 'sendFriendRequestAcceptedEmail',
            data: {
              userName: 'User',
              accepterName,
              profileUrl: `${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001'}/profile/${userId}`,
            }
          }
        });

        this.logger.log(`Friend request accepted notification sent to user ${request.userId}`);
      }

      return updatedRequest;
    } catch (error) {
      this.logger.error('Error accepting friend request:', error);
      throw error;
    }
  }

  async getFriendRequests(userId: number) {
    // Get pending friend requests received by user
    const [pendingStatus] = await this.db
      .select({ id: lookups.id })
      .from(lookups)
      .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
      .where(and(
        eq(lookupTypes.code, 'friend_status'),
        eq(lookups.code, 'pending')
      ))
      .limit(1);

    if (!pendingStatus) {
      return [];
    }

    const requests = await this.db
      .select()
      .from(friends)
      .where(and(
        eq(friends.friendId, userId),
        eq(friends.statusId, pendingStatus.id)
      ));

    return requests;
  }

  async getFriends(userId: number) {
    // Get accepted friendships
    const [acceptedStatus] = await this.db
      .select({ id: lookups.id })
      .from(lookups)
      .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
      .where(and(
        eq(lookupTypes.code, 'friend_status'),
        eq(lookups.code, 'accepted')
      ))
      .limit(1);

    if (!acceptedStatus) {
      return [];
    }

    const friendships = await this.db
      .select()
      .from(friends)
      .where(
        and(
          or(
            eq(friends.userId, userId),
            eq(friends.friendId, userId)
          ),
          eq(friends.statusId, acceptedStatus.id)
        )
      );

    return friendships;
  }

  async removeFriend(userId: number, friendshipId: number) {
    await this.db
      .delete(friends)
      .where(and(
        eq(friends.id, friendshipId),
        or(
          eq(friends.userId, userId),
          eq(friends.friendId, userId)
        )
      ));

    this.logger.log(`Friendship ${friendshipId} removed by user ${userId}`);
  }
}
