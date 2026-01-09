import { Injectable, Inject } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { eq, and } from 'drizzle-orm';
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

  async update(id: number, dto: UpdateGroupDto) {
    await this.findOne(id);
    const [updated] = await this.db.update(groups).set(dto as any).where(eq(groups.id, id)).returning();
    return updated;
  }

  async remove(id: number) {
    await this.db.update(groups).set({ isDeleted: true } as any).where(eq(groups.id, id));
  }
}
