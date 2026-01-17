import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { eq, and, sql } from 'drizzle-orm';
import type { InferInsertModel } from 'drizzle-orm';
import { notes } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';

@Injectable()
export class NotesService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>) {}

  async create(userId: number, createNoteDto: CreateNoteDto) {
    const [note] = await this.db.insert(notes).values({
      ...createNoteDto,
      userId: userId,
    } as InferInsertModel<typeof notes>).returning();
    return note;
  }

  async findByUser(userId: number) {
    return await this.db.select().from(notes).where(
      and(eq(notes.userId, userId), eq(notes.isDeleted, false))
    );
  }

  async findOne(id: number) {
    const [note] = await this.db.select().from(notes).where(
      and(eq(notes.id, id), eq(notes.isDeleted, false))
    ).limit(1);
    if (!note) throw new NotFoundException(`Note with ID ${id} not found`);
    return note;
  }

  async update(id: number, updateNoteDto: UpdateNoteDto) {
    await this.findOne(id);
    const [updated] = await this.db.update(notes).set(updateNoteDto as Partial<InferInsertModel<typeof notes>>).where(eq(notes.id, id)).returning();
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.db.update(notes).set({
      isDeleted: true,
    } as Partial<InferInsertModel<typeof notes>>).where(eq(notes.id, id));
  }
}
