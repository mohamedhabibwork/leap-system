import { Injectable, Inject } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { eq, and } from 'drizzle-orm';
import { tickets } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class TicketsService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>) {}

  async create(dto: CreateTicketDto) {
    const [ticket] = await this.db.insert(tickets).values(dto as any).returning();
    return ticket;
  }

  async findAll() {
    return await this.db.select().from(tickets).where(eq(tickets.isDeleted, false));
  }

  async findOne(id: number) {
    const [ticket] = await this.db.select().from(tickets).where(and(eq(tickets.id, id), eq(tickets.isDeleted, false))).limit(1);
    if (!ticket) throw new Error('Ticket not found');
    return ticket;
  }

  async update(id: number, dto: UpdateTicketDto) {
    await this.findOne(id);
    const [updated] = await this.db.update(tickets).set(dto as any).where(eq(tickets.id, id)).returning();
    return updated;
  }

  async remove(id: number) {
    await this.db.update(tickets).set({ isDeleted: true } as any).where(eq(tickets.id, id));
  }
}
