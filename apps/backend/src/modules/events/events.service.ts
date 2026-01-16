import { Injectable, Inject } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { eq, and, sql, desc, asc, like, or, gte, lte } from 'drizzle-orm';
import { events, eventRegistrations, courses } from '@leap-lms/database';
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
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      statusId, // Support both for backward compatibility
      startDate,
      endDate,
      startDateFrom,
      startDateTo,
      dateFrom,
      dateTo,
      eventType,
      categoryId,
      location,
      isFeatured,
      createdBy,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
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

    // Support both 'status' and 'statusId' for backward compatibility
    const finalStatusId = status || statusId;
    if (finalStatusId) {
      conditions.push(eq(events.statusId, finalStatusId));
    }

    if (eventType) {
      conditions.push(eq(events.eventTypeId, eventType));
    }

    if (categoryId) {
      conditions.push(eq(events.categoryId, categoryId));
    }

    if (location) {
      conditions.push(like(events.location, `%${location}%`));
    }

    if (isFeatured !== undefined) {
      conditions.push(eq(events.isFeatured, isFeatured));
    }

    if (createdBy) {
      conditions.push(eq(events.createdBy, createdBy));
    }

    // Date filtering - support multiple date field options
    const startDateFilter = startDate || startDateFrom || dateFrom;
    const endDateFilter = endDate || startDateTo || dateTo;

    if (startDateFilter) {
      conditions.push(gte(events.startDate, new Date(startDateFilter)));
    }

    if (endDateFilter) {
      conditions.push(lte(events.endDate, new Date(endDateFilter)));
    }

    // Determine sort field and order using SQL template for dynamic sorting
    let orderBy;
    const validSortFields: Record<string, any> = {
      createdAt: events.createdAt,
      startDate: events.startDate,
      endDate: events.endDate,
      titleEn: events.titleEn,
      titleAr: events.titleAr,
      location: events.location,
      registrationCount: events.registrationCount,
    };
    
    const sortField = validSortFields[sortBy] || events.createdAt;
    
    if (sortOrder === 'asc') {
      orderBy = asc(sortField);
    } else {
      orderBy = desc(sortField);
    }

    const results = await this.db
      .select()
      .from(events)
      .where(and(...conditions))
      .orderBy(orderBy)
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
    const event = await this.findOne(eventId);
    
    // Check if already registered
    const [existing] = await this.db
      .select()
      .from(eventRegistrations)
      .where(
        and(
          eq(eventRegistrations.eventId, eventId),
          eq(eventRegistrations.userId, userId),
          eq(eventRegistrations.isDeleted, false)
        )
      )
      .limit(1);
    
    if (existing) {
      return { success: true, message: 'Already registered for this event' };
    }
    
    // Check capacity
    if (event.capacity && event.registrationCount >= event.capacity) {
      throw new Error('Event is full');
    }

    const [registration] = await this.db.insert(eventRegistrations).values({
      eventId,
      userId,
      statusId: 1, // Registered
      attendanceStatusId: 1, // Not Attended
    } as any).returning();

    // Increment registration count
    await this.db.update(events)
      .set({ registrationCount: sql`${events.registrationCount} + 1` } as any)
      .where(eq(events.id, eventId));

    return { success: true, message: 'Registered for event successfully', data: registration };
  }

  async getRegistrations(eventId: number, query: any) {
    const { page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const where = and(
      eq(eventRegistrations.eventId, eventId),
      eq(eventRegistrations.isDeleted, false)
    );

    const results = await this.db
      .select()
      .from(eventRegistrations)
      .where(where)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(eventRegistrations.registeredAt));

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(eventRegistrations)
      .where(where);

    return {
      data: results,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
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

  async findByUser(userId: number, query: any) {
    const { page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;
    
    const results = await this.db
      .select()
      .from(events)
      .where(and(eq(events.createdBy, userId), eq(events.isDeleted, false)))
      .orderBy(desc(events.createdAt))
      .limit(limit)
      .offset(offset);
    
    return { data: results };
  }

  async findRegistrationsByUser(userId: number, query: any) {
    const { page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const where = and(
      eq(eventRegistrations.userId, userId),
      eq(eventRegistrations.isDeleted, false)
    );

    const results = await this.db
      .select()
      .from(eventRegistrations)
      .where(where)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(eventRegistrations.registeredAt));

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(eventRegistrations)
      .where(where);

    return {
      data: results,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  }

  async unregisterFromEvent(eventId: number, userId: number) {
    const [registration] = await this.db
      .select()
      .from(eventRegistrations)
      .where(
        and(
          eq(eventRegistrations.eventId, eventId),
          eq(eventRegistrations.userId, userId),
          eq(eventRegistrations.isDeleted, false)
        )
      )
      .limit(1);

    if (!registration) {
      throw new Error('Registration not found');
    }

    await this.db.update(eventRegistrations)
      .set({ 
        isDeleted: true, 
        deletedAt: new Date(),
        cancelledAt: new Date()
      } as any)
      .where(eq(eventRegistrations.id, registration.id));

    // Decrement registration count
    await this.db.update(events)
      .set({ registrationCount: sql`${events.registrationCount} - 1` } as any)
      .where(eq(events.id, eventId));

    return { message: 'Unregistered successfully' };
  }

  async updateRegistration(eventId: number, userId: number, data: any) {
    const [registration] = await this.db
      .select()
      .from(eventRegistrations)
      .where(
        and(
          eq(eventRegistrations.eventId, eventId),
          eq(eventRegistrations.userId, userId),
          eq(eventRegistrations.isDeleted, false)
        )
      )
      .limit(1);

    if (!registration) {
      throw new Error('Registration not found');
    }

    const [updated] = await this.db.update(eventRegistrations)
      .set(data)
      .where(eq(eventRegistrations.id, registration.id))
      .returning();

    return { message: 'Registration updated successfully', data: updated };
  }
}
