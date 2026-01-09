import { Injectable, Inject } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { eq, and, sql, desc, like, or, gte, lte } from 'drizzle-orm';
import { events } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class EventsService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>) {}

  async create(dto: CreateEventDto) {
    const [event] = await this.db.insert(events).values(dto as any).returning();
    return event;
  }

  async findAll() {
    return await this.db.select().from(events).where(eq(events.isDeleted, false));
  }

  async findAllAdmin(query: any) {
    const { page = 1, limit = 10, search, statusId, startDate, endDate } = query;
    const offset = (page - 1) * limit;

    const conditions = [eq(events.isDeleted, false)];

    if (search) {
      conditions.push(
        or(
          like(events.titleEn, `%${search}%`),
          like(events.titleAr, `%${search}%`),
          like(events.location, `%${search}%`)
        )
      );
    }

    if (statusId) {
      conditions.push(eq(events.statusId, statusId));
    }

    if (startDate) {
      conditions.push(gte(events.startDate, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(events.endDate, new Date(endDate)));
    }

    const results = await this.db
      .select()
      .from(events)
      .where(and(...conditions))
      .orderBy(desc(events.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(events)
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
        upcoming: sql<number>`count(*) filter (where ${events.startDate} > now())`,
        ongoing: sql<number>`count(*) filter (where ${events.startDate} <= now() and ${events.endDate} >= now())`,
        past: sql<number>`count(*) filter (where ${events.endDate} < now())`,
      })
      .from(events)
      .where(eq(events.isDeleted, false));

    return {
      total: Number(stats.total),
      upcoming: Number(stats.upcoming),
      ongoing: Number(stats.ongoing),
      past: Number(stats.past),
    };
  }

  async findOne(id: number) {
    const [event] = await this.db.select().from(events).where(and(eq(events.id, id), eq(events.isDeleted, false))).limit(1);
    if (!event) throw new Error('Event not found');
    return event;
  }

  async registerForEvent(eventId: number, userId: number) {
    // This would typically create an event registration record
    // For now, just return success
    return { success: true, message: 'Registered for event successfully' };
  }

  async getRegistrations(eventId: number, query: any) {
    // This would typically fetch event registrations
    // For now, return empty array
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

  async setFeatured(id: number, featured: boolean) {
    await this.findOne(id);
    const [updated] = await this.db
      .update(events)
      .set({ isFeatured: featured } as any)
      .where(eq(events.id, id))
      .returning();
    return updated;
  }

  async update(id: number, dto: UpdateEventDto, userId?: number) {
    await this.findOne(id);
    const [updated] = await this.db.update(events).set(dto as any).where(eq(events.id, id)).returning();
    return updated;
  }

  async remove(id: number, userId?: number) {
    await this.db.update(events).set({ isDeleted: true, deletedAt: new Date() } as any).where(eq(events.id, id));
  }

  async bulkOperation(dto: any) {
    const { operation, ids } = dto;
    
    switch (operation) {
      case 'delete':
        await this.db
          .update(events)
          .set({ isDeleted: true, deletedAt: new Date() } as any)
          .where(sql`${events.id} = ANY(${ids})`);
        return { message: `Deleted ${ids.length} events` };
      
      case 'activate':
        await this.db
          .update(events)
          .set({ statusId: 1 } as any)
          .where(sql`${events.id} = ANY(${ids})`);
        return { message: `Activated ${ids.length} events` };
      
      case 'deactivate':
        await this.db
          .update(events)
          .set({ statusId: 2 } as any)
          .where(sql`${events.id} = ANY(${ids})`);
        return { message: `Deactivated ${ids.length} events` };
      
      default:
        throw new Error('Invalid operation');
    }
  }

  async exportToCsv(query: any) {
    const { search, statusId, startDate, endDate } = query;
    const conditions = [eq(events.isDeleted, false)];

    if (search) {
      conditions.push(
        or(
          like(events.titleEn, `%${search}%`),
          like(events.titleAr, `%${search}%`),
          like(events.location, `%${search}%`)
        )
      );
    }

    if (statusId) {
      conditions.push(eq(events.statusId, statusId));
    }

    if (startDate) {
      conditions.push(gte(events.startDate, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(events.endDate, new Date(endDate)));
    }

    const results = await this.db
      .select()
      .from(events)
      .where(and(...conditions))
      .orderBy(desc(events.createdAt));

    // Convert to CSV format
    const headers = ['ID', 'Title (EN)', 'Title (AR)', 'Location', 'Start Date', 'End Date', 'Status', 'Created At'];
    const csvRows = [headers.join(',')];
    
    for (const event of results) {
      const row = [
        event.id,
        `"${event.titleEn?.replace(/"/g, '""') || ''}"`,
        `"${event.titleAr?.replace(/"/g, '""') || ''}"`,
        `"${event.location?.replace(/"/g, '""') || ''}"`,
        event.startDate?.toISOString() || '',
        event.endDate?.toISOString() || '',
        event.statusId,
        event.createdAt?.toISOString() || '',
      ];
      csvRows.push(row.join(','));
    }

    return csvRows.join('\n');
  }
}
