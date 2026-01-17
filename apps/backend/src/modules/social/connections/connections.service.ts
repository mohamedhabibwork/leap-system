import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../../database/database.module';
import { eq, and, or, sql, ilike, ne, notInArray } from 'drizzle-orm';
import type { InferInsertModel } from 'drizzle-orm';
import { friends, users } from '@leap-lms/database';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';
import { SendConnectionRequestDto, ConnectionQueryDto } from './dto';
import { LookupsService } from '../../lookups/lookups.service';
import { LookupTypeCode, FriendStatusCode } from '@leap-lms/shared-types';

@Injectable()
export class ConnectionsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly lookupsService: LookupsService,
  ) {}

  /**
   * Send a connection request
   */
  async sendConnectionRequest(userId: number, dto: SendConnectionRequestDto) {
    // Check if already connected or pending
    const existing = await this.db
      .select()
      .from(friends)
      .where(
        or(
          and(
            eq(friends.userId, userId),
            eq(friends.friendId, dto.userId)
          ),
          and(
            eq(friends.userId, dto.userId),
            eq(friends.friendId, userId)
          )
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw new BadRequestException('Connection request already exists');
    }

    // Get pending status ID from lookups
    const pendingStatusId = await this.lookupsService.getLookupIdByCode(LookupTypeCode.FRIEND_STATUS, FriendStatusCode.PENDING);

    const [connection] = await this.db
      .insert(friends)
      .values({
        userId,
        friendId: dto.userId,
        statusId: pendingStatusId,
        requestedAt: new Date(),
      })
      .returning();

    // TODO: Send notification to the recipient

    return {
      id: connection.id,
      status: 'pending',
      message: 'Connection request sent successfully',
    };
  }

  /**
   * Accept a connection request
   */
  async acceptConnectionRequest(userId: number, requestId: number) {
    const [request] = await this.db
      .select()
      .from(friends)
      .where(
        and(
          eq(friends.id, requestId),
          eq(friends.friendId, userId)
        )
      )
      .limit(1);

    if (!request) {
      throw new NotFoundException('Connection request not found');
    }

    // Update status to accepted (assuming 2 = accepted)
    const acceptedStatusId = 2;

    const [updated] = await this.db
      .update(friends)
      .set({
        statusId: acceptedStatusId,
        acceptedAt: new Date(),
        updatedAt: new Date(),
      } as Partial<InferInsertModel<typeof friends>>)
      .where(eq(friends.id, requestId))
      .returning();

    // TODO: Send notification to requester

    return {
      id: updated.id,
      status: 'accepted',
      message: 'Connection request accepted',
    };
  }

  /**
   * Reject a connection request
   */
  async rejectConnectionRequest(userId: number, requestId: number) {
    const [request] = await this.db
      .select()
      .from(friends)
      .where(
        and(
          eq(friends.id, requestId),
          eq(friends.friendId, userId)
        )
      )
      .limit(1);

    if (!request) {
      throw new NotFoundException('Connection request not found');
    }

    // Soft delete the request
    await this.db
      .update(friends)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
      })
      .where(eq(friends.id, requestId));

    return {
      message: 'Connection request rejected',
    };
  }

  /**
   * Remove a connection
   */
  async removeConnection(userId: number, connectionId: number) {
    const [connection] = await this.db
      .select()
      .from(friends)
      .where(
        and(
          eq(friends.id, connectionId),
          or(
            eq(friends.userId, userId),
            eq(friends.friendId, userId)
          )
        )
      )
      .limit(1);

    if (!connection) {
      throw new NotFoundException('Connection not found');
    }

    await this.db
      .update(friends)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
      })
      .where(eq(friends.id, connectionId));

    return {
      message: 'Connection removed successfully',
    };
  }

  /**
   * Get all connections for a user
   */
  async getConnections(userId: number, query: ConnectionQueryDto) {
    const { page = 1, limit = 20, search } = query;
    const offset = (page - 1) * limit;

    const acceptedStatusId = 2;

    let whereConditions: any = and(
      or(
        eq(friends.userId, userId),
        eq(friends.friendId, userId)
      ),
      eq(friends.statusId, acceptedStatusId),
      eq(friends.isDeleted, false)
    );

    const connectionsQuery = this.db
      .select({
        id: friends.id,
        userId: friends.userId,
        friendId: friends.friendId,
        acceptedAt: friends.acceptedAt,
        createdAt: friends.createdAt,
      })
      .from(friends)
      .where(whereConditions)
      .limit(limit)
      .offset(offset);

    const connections = await connectionsQuery;

    // Get user details for each connection
    const enrichedConnections = await Promise.all(
      connections.map(async (conn) => {
        const connectedUserId = conn.userId === userId ? conn.friendId : conn.userId;
        
        const [user] = await this.db
          .select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            avatar: users.avatarUrl,
          })
          .from(users)
          .where(eq(users.id, connectedUserId))
          .limit(1);

        return {
          id: conn.id,
          user,
          acceptedAt: conn.acceptedAt,
          createdAt: conn.createdAt,
        };
      })
    );

    // Get total count
    const [{ count }] = await this.db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(friends)
      .where(whereConditions);

    return {
      data: enrichedConnections,
      total: count,
      page,
      limit,
    };
  }

  /**
   * Get pending connection requests (received)
   */
  async getPendingRequests(userId: number, query: ConnectionQueryDto) {
    const { page = 1, limit = 20 } = query;
    const offset = (page - 1) * limit;
    const pendingStatusId = 1;

    const requests = await this.db
      .select({
        id: friends.id,
        fromUserId: friends.userId,
        requestedAt: friends.requestedAt,
      })
      .from(friends)
      .where(
        and(
          eq(friends.friendId, userId),
          eq(friends.statusId, pendingStatusId),
          eq(friends.isDeleted, false)
        )
      )
      .limit(limit)
      .offset(offset);

    // Enrich with user details
    const enrichedRequests = await Promise.all(
      requests.map(async (req) => {
        const [fromUser] = await this.db
          .select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            avatar: users.avatarUrl,
          })
          .from(users)
          .where(eq(users.id, req.fromUserId))
          .limit(1);

        return {
          id: req.id,
          fromUser,
          requestedAt: req.requestedAt,
        };
      })
    );

    const [{ count }] = await this.db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(friends)
      .where(
        and(
          eq(friends.friendId, userId),
          eq(friends.statusId, pendingStatusId),
          eq(friends.isDeleted, false)
        )
      );

    return {
      data: enrichedRequests,
      total: count,
      page,
      limit,
    };
  }

  /**
   * Get sent connection requests
   */
  async getSentRequests(userId: number, query: ConnectionQueryDto) {
    const { page = 1, limit = 20 } = query;
    const offset = (page - 1) * limit;
    const pendingStatusId = 1;

    const requests = await this.db
      .select({
        id: friends.id,
        toUserId: friends.friendId,
        requestedAt: friends.requestedAt,
      })
      .from(friends)
      .where(
        and(
          eq(friends.userId, userId),
          eq(friends.statusId, pendingStatusId),
          eq(friends.isDeleted, false)
        )
      )
      .limit(limit)
      .offset(offset);

    // Enrich with user details
    const enrichedRequests = await Promise.all(
      requests.map(async (req) => {
        const [toUser] = await this.db
          .select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            avatar: users.avatarUrl,
          })
          .from(users)
          .where(eq(users.id, req.toUserId))
          .limit(1);

        return {
          id: req.id,
          toUser,
          requestedAt: req.requestedAt,
        };
      })
    );

    const [{ count }] = await this.db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(friends)
      .where(
        and(
          eq(friends.userId, userId),
          eq(friends.statusId, pendingStatusId),
          eq(friends.isDeleted, false)
        )
      );

    return {
      data: enrichedRequests,
      total: count,
      page,
      limit,
    };
  }

  /**
   * Get mutual connections between two users
   */
  async getMutualConnections(userId: number, targetUserId: number) {
    // This is a complex query to find mutual connections
    // We need connections where both users are connected to the same people
    
    const acceptedStatusId = 2;

    // Get user's connections
    const userConnections = await this.db
      .select({
        connectedUserId: sql<number>`
          CASE 
            WHEN ${friends.userId} = ${userId} THEN ${friends.friendId}
            ELSE ${friends.userId}
          END
        `.as('connected_user_id'),
      })
      .from(friends)
      .where(
        and(
          or(
            eq(friends.userId, userId),
            eq(friends.friendId, userId)
          ),
          eq(friends.statusId, acceptedStatusId),
          eq(friends.isDeleted, false)
        )
      );

    // Get target user's connections
    const targetConnections = await this.db
      .select({
        connectedUserId: sql<number>`
          CASE 
            WHEN ${friends.userId} = ${targetUserId} THEN ${friends.friendId}
            ELSE ${friends.userId}
          END
        `.as('connected_user_id'),
      })
      .from(friends)
      .where(
        and(
          or(
            eq(friends.userId, targetUserId),
            eq(friends.friendId, targetUserId)
          ),
          eq(friends.statusId, acceptedStatusId),
          eq(friends.isDeleted, false)
        )
      );

    // Find mutual connections
    const userConnIds = userConnections.map(c => c.connectedUserId);
    const targetConnIds = targetConnections.map(c => c.connectedUserId);
    const mutualIds = userConnIds.filter(id => targetConnIds.includes(id));

    // Get user details for mutual connections
    if (mutualIds.length === 0) {
      return { data: [], total: 0 };
    }

    const mutualUsers = await this.db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        avatar: users.avatarUrl,
      })
      .from(users)
      .where(sql`${users.id} IN ${mutualIds}`);

    return {
      data: mutualUsers,
      total: mutualUsers.length,
    };
  }

  /**
   * Get connection status with a specific user
   */
  async getConnectionStatus(userId: number, targetUserId: number) {
    const [connection] = await this.db
      .select()
      .from(friends)
      .where(
        and(
          or(
            and(
              eq(friends.userId, userId),
              eq(friends.friendId, targetUserId)
            ),
            and(
              eq(friends.userId, targetUserId),
              eq(friends.friendId, userId)
            )
          ),
          eq(friends.isDeleted, false)
        )
      )
      .limit(1);

    if (!connection) {
      return { status: 'none' };
    }

    const pendingStatusId = 1;
    const acceptedStatusId = 2;

    if (connection.statusId === acceptedStatusId) {
      return { 
        status: 'connected', 
        connectionId: connection.id 
      };
    }

    if (connection.statusId === pendingStatusId) {
      return {
        status: 'pending',
        requestId: connection.id,
        isReceiver: connection.friendId === userId,
      };
    }

    return { status: 'none' };
  }

  /**
   * Get connection statistics
   */
  async getConnectionStats(userId: number) {
    const acceptedStatusId = 2;
    const pendingStatusId = 1;

    // Total connections
    const [{ totalConnections }] = await this.db
      .select({ totalConnections: sql<number>`cast(count(*) as int)` })
      .from(friends)
      .where(
        and(
          or(
            eq(friends.userId, userId),
            eq(friends.friendId, userId)
          ),
          eq(friends.statusId, acceptedStatusId),
          eq(friends.isDeleted, false)
        )
      );

    // Pending requests received
    const [{ pendingRequests }] = await this.db
      .select({ pendingRequests: sql<number>`cast(count(*) as int)` })
      .from(friends)
      .where(
        and(
          eq(friends.friendId, userId),
          eq(friends.statusId, pendingStatusId),
          eq(friends.isDeleted, false)
        )
      );

    // Sent requests
    const [{ sentRequests }] = await this.db
      .select({ sentRequests: sql<number>`cast(count(*) as int)` })
      .from(friends)
      .where(
        and(
          eq(friends.userId, userId),
          eq(friends.statusId, pendingStatusId),
          eq(friends.isDeleted, false)
        )
      );

    return {
      totalConnections,
      pendingRequests,
      sentRequests,
    };
  }

  /**
   * Get connection suggestions
   */
  async getConnectionSuggestions(userId: number, query: ConnectionQueryDto) {
    const { limit = 10 } = query;
    
    // Get users who are not already connected
    // This is a simplified version - in production, you'd want more sophisticated recommendations
    const acceptedStatusId = 2;

    // Get IDs of users already connected
    const existingConnections = await this.db
      .select({
        connectedUserId: sql<number>`
          CASE 
            WHEN ${friends.userId} = ${userId} THEN ${friends.friendId}
            ELSE ${friends.userId}
          END
        `.as('connected_user_id'),
      })
      .from(friends)
      .where(
        and(
          or(
            eq(friends.userId, userId),
            eq(friends.friendId, userId)
          ),
          eq(friends.isDeleted, false)
        )
      );

    const connectedUserIds = [userId, ...existingConnections.map(c => c.connectedUserId)];

    // Get suggested users (users not in the connected list)
    const suggestions = await this.db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        avatar: users.avatarUrl,
      })
      .from(users)
      .where(
        and(
          connectedUserIds.length > 0 
            ? notInArray(users.id, connectedUserIds)
            : sql`1=1`,
          eq(users.isDeleted, false)
        )
      )
      .limit(limit);

    return {
      data: suggestions,
      total: suggestions.length,
    };
  }

  /**
   * Block a user
   */
  async blockUser(userId: number, targetUserId: number) {
    // Check if already blocked or connected
    const existing = await this.db
      .select()
      .from(friends)
      .where(
        or(
          and(
            eq(friends.userId, userId),
            eq(friends.friendId, targetUserId)
          ),
          and(
            eq(friends.userId, targetUserId),
            eq(friends.friendId, userId)
          )
        )
      )
      .limit(1);

    // Get blocked status ID from lookups
    const blockedStatusId = await this.lookupsService.getLookupIdByCode(LookupTypeCode.FRIEND_STATUS, FriendStatusCode.BLOCKED);

    if (existing.length > 0) {
      // Update existing connection to blocked
      const [updated] = await this.db
        .update(friends)
        .set({
          statusId: blockedStatusId,
          updatedAt: new Date(),
        } as Partial<InferInsertModel<typeof friends>>)
        .where(eq(friends.id, existing[0].id))
        .returning();

      return {
        id: updated.id,
        status: 'blocked',
        message: 'User blocked successfully',
      };
    } else {
      // Create new blocked connection
      const [blocked] = await this.db
        .insert(friends)
        .values({
          userId,
          friendId: targetUserId,
          statusId: blockedStatusId,
          requestedAt: new Date(),
        })
        .returning();

      return {
        id: blocked.id,
        status: 'blocked',
        message: 'User blocked successfully',
      };
    }
  }

  /**
   * Unblock a user
   */
  async unblockUser(userId: number, targetUserId: number) {
    const blockedStatusId = 4; // TODO: Get from lookups table

    const [blocked] = await this.db
      .select()
      .from(friends)
      .where(
        and(
          eq(friends.userId, userId),
          eq(friends.friendId, targetUserId),
          eq(friends.statusId, blockedStatusId),
          eq(friends.isDeleted, false)
        )
      )
      .limit(1);

    if (!blocked) {
      throw new NotFoundException('Blocked connection not found');
    }

    // Delete the blocked connection record
    await this.db
      .update(friends)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date(),
      } as Partial<InferInsertModel<typeof friends>>)
      .where(eq(friends.id, blocked.id));

    return {
      message: 'User unblocked successfully',
    };
  }

  /**
   * Get blocked users
   */
  async getBlockedUsers(userId: number, query: ConnectionQueryDto) {
    const { page = 1, limit = 20 } = query;
    const offset = (page - 1) * limit;
    const blockedStatusId = await this.lookupsService.getLookupIdByCode(LookupTypeCode.FRIEND_STATUS, FriendStatusCode.BLOCKED);

    const blockedConnections = await this.db
      .select({
        id: friends.id,
        blockedUserId: friends.friendId,
        blockedAt: friends.requestedAt,
      })
      .from(friends)
      .where(
        and(
          eq(friends.userId, userId),
          eq(friends.statusId, blockedStatusId),
          eq(friends.isDeleted, false)
        )
      )
      .limit(limit)
      .offset(offset);

    // Get user details for blocked users
    const enrichedBlocked = await Promise.all(
      blockedConnections.map(async (blocked) => {
        const [user] = await this.db
          .select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            avatar: users.avatarUrl,
          })
          .from(users)
          .where(eq(users.id, blocked.blockedUserId))
          .limit(1);

        return {
          id: blocked.id,
          user,
          blockedAt: blocked.blockedAt,
        };
      })
    );

    // Get total count
    const [{ count }] = await this.db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(friends)
      .where(
        and(
          eq(friends.userId, userId),
          eq(friends.statusId, blockedStatusId),
          eq(friends.isDeleted, false)
        )
      );

    return {
      data: enrichedBlocked,
      total: count,
      page,
      limit,
    };
  }
}
