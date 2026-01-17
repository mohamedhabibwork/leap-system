import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and, or, ilike, desc, asc, sql } from 'drizzle-orm';
import { tickets, ticketReplies, lookups, lookupTypes } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { AdminTicketQueryDto } from './dto/admin-ticket-query.dto';
import { BulkTicketOperationDto, TicketBulkAction } from './dto/bulk-operation.dto';
import { CreateTicketReplyDto } from './dto/ticket-reply.dto';

@Injectable()
export class TicketsService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>) {}

  async create(dto: CreateTicketDto & { userId: number }) {
    // Generate ticket number
    // todo: generate ticket number from database sequence
    const ticketNumber = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Get category lookup ID
    const [categoryLookup] = await this.db
      .select({ id: lookups.id })
      .from(lookups)
      .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
      .where(and(
        eq(lookupTypes.code, 'ticket_category'),
        eq(lookups.code, dto.category)
      ))
      .limit(1);
    
    if (!categoryLookup) {
      throw new NotFoundException(`Ticket category '${dto.category}' not found`);
    }
    
    // Get priority lookup ID
    const [priorityLookup] = await this.db
      .select({ id: lookups.id })
      .from(lookups)
      .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
      .where(and(
        eq(lookupTypes.code, 'ticket_priority'),
        eq(lookups.code, dto.priority)
      ))
      .limit(1);
    
    if (!priorityLookup) {
      throw new NotFoundException(`Ticket priority '${dto.priority}' not found`);
    }
    
    // Get default status (open/pending)
    const [statusLookup] = await this.db
      .select({ id: lookups.id })
      .from(lookups)
      .innerJoin(lookupTypes, eq(lookups.lookupTypeId, lookupTypes.id))
      .where(and(
        eq(lookupTypes.code, 'ticket_status'),
        eq(lookups.code, 'open')
      ))
      .limit(1);
    
    if (!statusLookup) {
      throw new NotFoundException('Default ticket status not found');
    }
    
    const ticketData = {
      ticketNumber,
      userId: dto.userId,
      subject: dto.subject,
      description: dto.message, // Map message to description
      categoryId: categoryLookup.id,
      priorityId: priorityLookup.id,
      statusId: statusLookup.id,
    } as InferInsertModel<typeof tickets>;
    
    const [ticket] = await this.db
      .insert(tickets)
      .values(ticketData)
      .returning();
    return ticket;
  }

  async findAllAdmin(query: AdminTicketQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      priority,
      category,
      assignedTo,
      userId,
      dateFrom,
      dateTo,
    } = query;

    const offset = (page - 1) * limit;
    const conditions: ReturnType<typeof eq>[] = [eq(tickets.isDeleted, false)];

    if (search) {
      conditions.push(
        or(
          ilike(tickets.ticketNumber, `%${search}%`),
          ilike(tickets.subject, `%${search}%`),
          ilike(tickets.description, `%${search}%`)
        )
      );
    }

    if (status) conditions.push(eq(tickets.statusId, status));
    if (priority) conditions.push(eq(tickets.priorityId, priority));
    if (category) conditions.push(eq(tickets.categoryId, category));
    if (assignedTo) conditions.push(eq(tickets.assignedTo, assignedTo));
    if (userId) conditions.push(eq(tickets.userId, userId));

    const whereClause = and(...conditions);
    const orderByClause = sortOrder === 'asc' ? asc(tickets[sortBy]) : desc(tickets[sortBy]);

    const [data, countResult] = await Promise.all([
      this.db
        .select()
        .from(tickets)
        .where(whereClause)
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(tickets)
        .where(whereClause),
    ]);

    const total = Number(countResult[0]?.count || 0);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const [ticket] = await this.db
      .select()
      .from(tickets)
      .where(and(eq(tickets.id, id), eq(tickets.isDeleted, false)))
      .limit(1);

    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async update(id: number, dto: UpdateTicketDto) {
    await this.findOne(id);
    const updateData: Partial<InferSelectModel<typeof tickets>> = {
      ...dto,
      updatedAt: new Date(),
    };
    const [updated] = await this.db
      .update(tickets)
      .set(updateData)
      .where(eq(tickets.id, id))
      .returning();
    return updated;
  }

  async remove(id: number) {
    await this.db
      .update(tickets)
      .set({ isDeleted: true, deletedAt: new Date() } as Partial<InferSelectModel<typeof tickets>>)
      .where(eq(tickets.id, id));
    return { success: true };
  }

  async assignTicket(id: number, assignToId: number) {
    const [updated] = await this.db
      .update(tickets)
      .set({ assignedTo: assignToId, updatedAt: new Date() } as Partial<InferSelectModel<typeof tickets>>)
      .where(eq(tickets.id, id))
      .returning();
    return updated;
  }

  async getReplies(ticketId: number) {
    return await this.db
      .select()
      .from(ticketReplies)
      .where(and(eq(ticketReplies.ticketId, ticketId), eq(ticketReplies.isDeleted, false)))
      .orderBy(asc(ticketReplies.createdAt));
  }

  async addReply(ticketId: number, dto: CreateTicketReplyDto) {
    await this.findOne(ticketId);
    const [reply] = await this.db
      .insert(ticketReplies)
      .values({ ...dto, ticketId } as InferInsertModel<typeof ticketReplies>)
      .returning();
    return reply;
  }

  async getStatistics() {
    const [stats] = await this.db
      .select({
        total: sql<number>`count(*)`,
        open: sql<number>`count(*) filter (where status_id = 1)`, // Adjust status IDs as needed
        pending: sql<number>`count(*) filter (where status_id = 2)`,
        resolved: sql<number>`count(*) filter (where status_id = 3)`,
        closed: sql<number>`count(*) filter (where status_id = 4)`,
      })
      .from(tickets)
      .where(eq(tickets.isDeleted, false));

    return stats;
  }

  async bulkOperation(dto: BulkTicketOperationDto) {
    const { ids, action, assignToId, statusId, priorityId } = dto;
    let processedCount = 0;
    const errors: Array<{ id: number; error: string }> = [];

    for (const id of ids) {
      try {
        switch (action) {
          case TicketBulkAction.DELETE:
            await this.remove(id);
            break;
          case TicketBulkAction.CLOSE:
            await this.update(id, { closedAt: new Date() } as UpdateTicketDto);
            break;
          case TicketBulkAction.ASSIGN:
            if (assignToId) await this.assignTicket(id, assignToId);
            break;
          case TicketBulkAction.CHANGE_STATUS:
            if (statusId) await this.update(id, { statusId } as UpdateTicketDto);
            break;
          case TicketBulkAction.CHANGE_PRIORITY:
            if (priorityId) await this.update(id, { priorityId } as UpdateTicketDto);
            break;
        }
        processedCount++;
      } catch (error) {
        errors.push({ id, error: error.message });
      }
    }

    return {
      success: true,
      processedCount,
      failedCount: errors.length,
      errors,
    };
  }

  async exportToCsv(query: AdminTicketQueryDto) {
    const result = await this.findAllAdmin({ ...query, limit: 10000 });
    // CSV export logic would go here
    return { data: result.data, format: 'csv' };
  }
}
