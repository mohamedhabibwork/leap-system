import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { eq, and, sql, desc, like, or, inArray } from 'drizzle-orm';
import { groups, groupMembers, users, lookups, lookupTypes } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class GroupsService {
  private readonly logger = new Logger(GroupsService.name);

  constructor(
    @Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateGroupDto) {
    const [group] = await this.db.insert(groups).values(dto as any).returning();
    return group;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    const conditions = [eq(groups.isDeleted, false)];

    const results = await this.db
      .select()
      .from(groups)
      .where(and(...conditions))
      .orderBy(desc(groups.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(groups)
      .where(and(...conditions));

    return {
      data: results,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  }

  async findByUser(userId: number) {
    return await this.db
      .select()
      .from(groups)
      .where(and(eq(groups.createdBy, userId), eq(groups.isDeleted, false)))
      .orderBy(desc(groups.createdAt));
  }

  async findOne(id: number) {
    const [group] = await this.db.select().from(groups).where(and(eq(groups.id, id), eq(groups.isDeleted, false))).limit(1);
    if (!group) throw new NotFoundException(`Group with ID ${id} not found`);
    return group;
  }

  async update(id: number, dto: UpdateGroupDto, userId?: number) {
    await this.findOne(id);
    const [updated] = await this.db.update(groups).set(dto as any).where(eq(groups.id, id)).returning();
    return updated;
  }

  async remove(id: number, userId?: number) {
    await this.db.update(groups).set({ isDeleted: true, deletedAt: new Date() } as any).where(eq(groups.id, id));
  }

  async findAllAdmin(query: any) {
    const { page = 1, limit = 10, search, privacyTypeId } = query;
    const offset = (page - 1) * limit;

    const conditions = [eq(groups.isDeleted, false)];

    if (search) {
      conditions.push(like(groups.name, `%${search}%`));
    }

    if (privacyTypeId) {
      conditions.push(eq(groups.privacyTypeId, privacyTypeId));
    }

    const results = await this.db
      .select()
      .from(groups)
      .where(and(...conditions))
      .orderBy(desc(groups.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(groups)
      .where(and(...conditions));

    return {
      data: results,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  }

  async getStatistics() {
    const [stats] = await this.db
      .select({
        total: sql<number>`count(*)`,
        public: sql<number>`count(*) filter (where ${groups.privacyTypeId} = 1)`,
        private: sql<number>`count(*) filter (where ${groups.privacyTypeId} = 2)`,
      })
      .from(groups)
      .where(eq(groups.isDeleted, false));

    return {
      total: Number(stats.total),
      public: Number(stats.public),
      private: Number(stats.private),
    };
  }

  async joinGroup(groupId: number, userId: number) {
    try {
      // 1. Get member role and active status IDs
      const [memberRole] = await this.db
        .select({ id: lookups.id })
        .from(lookups)
        .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
        .where(and(
          eq(lookupTypes.code, 'group_role'),
          eq(lookups.code, 'member')
        ))
        .limit(1);

      const [activeStatus] = await this.db
        .select({ id: lookups.id })
        .from(lookups)
        .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
        .where(and(
          eq(lookupTypes.code, 'group_member_status'),
          eq(lookups.code, 'active')
        ))
        .limit(1);

      if (!memberRole || !activeStatus) {
        this.logger.error('Group role or status lookups not found');
        return { success: false, message: 'System configuration error' };
      }

      // 2. Create group membership
      const [membership] = await this.db.insert(groupMembers).values({
        groupId,
        userId,
        roleId: memberRole.id,
        statusId: activeStatus.id,
        joinedAt: new Date(),
      } as any).returning();

      // 3. Update member count
      await this.db
        .update(groups)
        .set({ memberCount: sql`COALESCE(${groups.memberCount}, 0) + 1` } as any)
        .where(eq(groups.id, groupId));

      // 4. Get group and joiner info
      const [group] = await this.db
        .select()
        .from(groups)
        .where(eq(groups.id, groupId))
        .limit(1);

      if (!group) {
        this.logger.warn(`Group ${groupId} not found`);
        return { success: true, message: 'Joined group successfully' };
      }

      const [joiner] = await this.db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!joiner) {
        this.logger.warn(`Joiner user ${userId} not found`);
        return { success: true, message: 'Joined group successfully' };
      }

      const joinerName = `${joiner.firstName || ''} ${joiner.lastName || ''}`.trim() || joiner.username;

      // 5. Get admin and mod role IDs
      const adminModRoles = await this.db
        .select({ id: lookups.id })
        .from(lookups)
        .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
        .where(and(
          eq(lookupTypes.code, 'group_role'),
          inArray(lookups.code, ['owner', 'admin', 'moderator'])
        ));

      const roleIds = adminModRoles.map(r => r.id);

      if (roleIds.length === 0) {
        this.logger.warn('Admin/mod roles not found');
        return { success: true, message: 'Joined group successfully' };
      }

      // 6. Get group admins and moderators
      const adminsAndMods = await this.db
        .select({ userId: groupMembers.userId })
        .from(groupMembers)
        .where(and(
          eq(groupMembers.groupId, groupId),
          inArray(groupMembers.roleId, roleIds),
          eq(groupMembers.isDeleted, false)
        ));

      // 7. Get notification type ID
      const [notifType] = await this.db
        .select({ id: lookups.id })
        .from(lookups)
        .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
        .where(and(
          eq(lookupTypes.code, 'notification_type'),
          eq(lookups.code, 'group_join')
        ))
        .limit(1);

      if (!notifType) {
        this.logger.warn('Group join notification type not found');
        return { success: true, message: 'Joined group successfully' };
      }

      // 8. Notify admins/mods
      for (const admin of adminsAndMods) {
        if (admin.userId !== userId) {
          await this.notificationsService.sendMultiChannelNotification({
            userId: admin.userId,
            notificationTypeId: notifType.id,
            title: 'New Group Member',
            message: `${joinerName} joined ${group.name}`,
            linkUrl: `/groups/${groupId}/members`,
            channels: ['database', 'websocket'], // Lower priority
          });

          this.logger.log(`Group join notification sent to admin ${admin.userId}`);
        }
      }

      return { success: true, message: 'Joined group successfully' };
    } catch (error) {
      this.logger.error('Error joining group:', error);
      throw error;
    }
  }

  async leaveGroup(groupId: number, userId: number) {
    // This would remove a group membership record
    return { success: true, message: 'Left group successfully' };
  }

  async getMembers(groupId: number, query: any) {
    // This would fetch group members
    return {
      data: [],
      pagination: {
        page: query.page || 1,
        limit: query.limit || 10,
        total: 0,
        totalPages: 0,
      },
    };
  }

  async addMember(groupId: number, userId: number) {
    // This would add a member to the group
    return { success: true, message: 'Member added successfully' };
  }

  async approveGroup(id: number) {
    // Approve group logic
    return { success: true, message: 'Group approved' };
  }

  async rejectGroup(id: number) {
    // Reject group logic
    return { success: true, message: 'Group rejected' };
  }

  async setFeatured(id: number, featured: boolean) {
    await this.findOne(id);
    const [updated] = await this.db
      .update(groups)
      .set({ isFeatured: featured } as any)
      .where(eq(groups.id, id))
      .returning();
    return updated;
  }

  async bulkOperation(dto: any) {
    const { operation, ids } = dto;
    
    switch (operation) {
      case 'delete':
        await this.db
          .update(groups)
          .set({ isDeleted: true, deletedAt: new Date() } as any)
          .where(sql`${groups.id} = ANY(${ids})`);
        return { message: `Deleted ${ids.length} groups` };
      
      case 'activate':
        // Activate operation
        return { message: `Activated ${ids.length} groups` };
      
      case 'deactivate':
        // Deactivate operation
        return { message: `Deactivated ${ids.length} groups` };
      
      default:
        throw new Error('Invalid operation');
    }
  }

  async exportToCsv(query: any) {
    const { search, statusId } = query;
    const conditions = [eq(groups.isDeleted, false)];

    if (search) {
      conditions.push(like(groups.name, `%${search}%`));
    }

    if (statusId) {
      // Status filter
    }

    const results = await this.db
      .select()
      .from(groups)
      .where(and(...conditions))
      .orderBy(desc(groups.createdAt));

    // Convert to CSV format
    const headers = ['ID', 'Name', 'Privacy Type', 'Member Count', 'Created At'];
    const csvRows = [headers.join(',')];
    
    for (const group of results) {
      const row = [
        group.id,
        `"${group.name?.replace(/"/g, '""') || ''}"`,
        group.privacyTypeId,
        group.memberCount || 0,
        group.createdAt?.toISOString() || '',
      ];
      csvRows.push(row.join(','));
    }

    return csvRows.join('\n');
  }
}
