import { Injectable, Inject } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { AdminEventQueryDto } from './dto/admin-event-query.dto';
import { EventQueryDto } from './dto/event-query.dto';
import { BulkEventOperationDto } from './dto/bulk-event-operation.dto';
import { UpdateEventRegistrationDto } from './dto/update-event-registration.dto';
import { eq, and, sql, desc, asc, like, or, gte, lte } from 'drizzle-orm';
import { events, eventRegistrations, courses, eventCategories } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';
import { LookupValidator } from '../../common/utils/lookup-validator';
import { LookupTypeCode } from '@leap-lms/shared-types';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { QueryParams } from '../../common/types/request.types';

@Injectable()
export class EventsService {
  constructor(
    @Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>,
    private readonly lookupValidator: LookupValidator,
  ) {}

  async create(dto: CreateEventDto) {
    // Validate lookup IDs
    await this.lookupValidator.validateLookup(
      dto.eventTypeId,
      LookupTypeCode.EVENT_TYPE,
      'eventTypeId',
    );
    await this.lookupValidator.validateLookup(
      dto.statusId,
      LookupTypeCode.EVENT_STATUS,
      'statusId',
    );
    if (dto.categoryId) {
      // Note: categoryId references eventCategories table, not lookups
      // So we skip validation for categoryId as it's a different table
    }

    // Convert date strings to Date objects for Drizzle ORM
    const eventData: Partial<InferSelectModel<typeof events>> = {
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : null,
    } as Partial<InferSelectModel<typeof events>>;

    const [event] = await this.db.insert(events).values(eventData as InferInsertModel<typeof events>).returning();
    return event;
  }

  async findAll() {
    return await this.db.select().from(events).where(eq(events.isDeleted, false));
  }

  async findAllAdmin(query: AdminEventQueryDto) {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
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
    const finalStatusId = status;
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
    const startDateFilter = startDateFrom || dateFrom;
    const endDateFilter = startDateTo || dateTo;

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
    }).returning();

    // Increment registration count
    await this.db.update(events)
      .set( { registrationCount: sql<number>`${events.registrationCount} + 1` } as InferInsertModel<typeof events>)
      .where(eq(events.id, eventId));

    return { success: true, message: 'Registered for event successfully', data: registration };
  }

  async getRegistrations(eventId: number, query: QueryParams) {
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
      .set({ isFeatured: featured } as Partial<InferSelectModel<typeof events>>)
      .where(eq(events.id, id))
      .returning();
    return updated;
  }

  async update(id: number, dto: UpdateEventDto, userId?: number) {
    await this.findOne(id);
    const updateData: Partial<InferSelectModel<typeof events>> = {};
    
    // Map DTO fields to database fields
    if (dto.titleEn !== undefined) updateData.titleEn = dto.titleEn;
    if (dto.titleAr !== undefined) updateData.titleAr = dto.titleAr;
    if (dto.descriptionEn !== undefined) updateData.descriptionEn = dto.descriptionEn;
    if (dto.descriptionAr !== undefined) updateData.descriptionAr = dto.descriptionAr;
    if (dto.location !== undefined) updateData.location = dto.location;
    if (dto.startDate !== undefined) updateData.startDate = typeof dto.startDate === 'string' ? new Date(dto.startDate) : dto.startDate;
    if (dto.endDate !== undefined) updateData.endDate = typeof dto.endDate === 'string' ? new Date(dto.endDate) : dto.endDate;
    // Add other fields as needed
    
    const [updated] = await this.db.update(events).set(updateData).where(eq(events.id, id)).returning();
    return updated;
  }

  async remove(id: number, userId?: number) {
    await this.db.update(events).set({ 
      isDeleted: true, 
      deletedAt: new Date() 
    } as Partial<InferSelectModel<typeof events>>).where(eq(events.id, id));
  }

  async bulkOperation(dto: BulkEventOperationDto) {
    const { action, ids } = dto;
    
    switch (action) {
      case 'delete':
        await this.db
          .update(events)
          .set({ isDeleted: true, deletedAt: new Date() } as Partial<InferSelectModel<typeof events>>)
          .where(sql`${events.id} = ANY(${ids})`);
        return { message: `Deleted ${ids.length} events` };
      
      case 'feature':
        await this.db
          .update(events)
          .set({ isFeatured: true } as Partial<InferSelectModel<typeof events>>)
          .where(sql`${events.id} = ANY(${ids})`);
        return { message: `Featured ${ids.length} events` };
      
      case 'unfeature':
        await this.db
          .update(events)
          .set({ isFeatured: false } as Partial<InferSelectModel<typeof events>>)
          .where(sql`${events.id} = ANY(${ids})`);
        return { message: `Unfeatured ${ids.length} events` };
      
      case 'change_status':
        if (!dto.statusId) {
          throw new Error('statusId is required for change_status action');
        }
        await this.db
          .update(events)
          .set({ statusId: dto.statusId } as Partial<InferSelectModel<typeof events>>)
          .where(sql`${events.id} = ANY(${ids})`);
        return { message: `Changed status for ${ids.length} events` };
      
      default:
        throw new Error('Invalid operation');
    }
  }

  async exportToCsv(query: AdminEventQueryDto) {
    const { search, status, startDateFrom, startDateTo, dateFrom, dateTo, eventType, categoryId, location, isFeatured, createdBy } = query;
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

    if (status) {
      conditions.push(eq(events.statusId, status));
    }

    if (startDateFrom || dateFrom) {
      conditions.push(gte(events.startDate, new Date(startDateFrom || dateFrom || '')));
    }

    if (startDateTo || dateTo) {
      conditions.push(lte(events.endDate, new Date(startDateTo || dateTo || '')));
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

  async findByUser(userId: number, query: EventQueryDto) {
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

  async findRegistrationsByUser(userId: number, query: EventQueryDto) {
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
      } as Partial<InferSelectModel<typeof eventRegistrations>>)
      .where(eq(eventRegistrations.id, registration.id));

    // Decrement registration count
    await this.db.update(events)
      .set({ registrationCount: sql`${events.registrationCount} - 1` } as Partial<InferSelectModel<typeof events>>)
      .where(eq(events.id, eventId));

    return { message: 'Unregistered successfully' };
  }

  async updateRegistration(eventId: number, userId: number, data: UpdateEventRegistrationDto) {
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

  /**
   * Get all event categories
   * @returns Array of event categories
   */
  async getCategories() {
    return await this.db
      .select()
      .from(eventCategories)
      .where(eq(eventCategories.isDeleted, false))
      .orderBy(asc(eventCategories.nameEn));
  }
}
