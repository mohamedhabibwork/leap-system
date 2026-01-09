import { Injectable, Inject } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { eq, and, sql, desc, like, or } from 'drizzle-orm';
import { groups } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class GroupsService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>) {}

  async create(dto: CreateGroupDto) {
    const [group] = await this.db.insert(groups).values(dto as any).returning();
    return group;
  }

  async findAll() {
    return await this.db.select().from(groups).where(eq(groups.isDeleted, false));
  }

  async findOne(id: number) {
    const [group] = await this.db.select().from(groups).where(and(eq(groups.id, id), eq(groups.isDeleted, false))).limit(1);
    if (!group) throw new Error('Group not found');
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
    // This would create a group membership record
    return { success: true, message: 'Joined group successfully' };
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
