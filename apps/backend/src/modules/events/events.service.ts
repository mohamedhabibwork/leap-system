import { Injectable, Inject } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { eq, and } from 'drizzle-orm';
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

  async findOne(id: number) {
    const [event] = await this.db.select().from(events).where(and(eq(events.id, id), eq(events.isDeleted, false))).limit(1);
    if (!event) throw new Error('Event not found');
    return event;
  }

  async update(id: number, dto: UpdateEventDto) {
    await this.findOne(id);
    const [updated] = await this.db.update(events).set(dto as any).where(eq(events.id, id)).returning();
    return updated;
  }

  async remove(id: number) {
    await this.db.update(events).set({ isDeleted: true } as any).where(eq(events.id, id));
  }
}
