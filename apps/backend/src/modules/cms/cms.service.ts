import { Injectable, Inject } from '@nestjs/common';
import { CreateCmDto } from './dto/create-cm.dto';
import { UpdateCmDto } from './dto/update-cm.dto';
import { eq, and } from 'drizzle-orm';
import { cmsPages } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class CmsService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>) {}

  async create(dto: CreateCmDto) {
    const [page] = await this.db.insert(cmsPages).values(dto).returning();
    return page;
  }

  async findAll() {
    return await this.db.select().from(cmsPages).where(eq(cmsPages.isDeleted, false));
  }

  async findOne(id: number) {
    const [page] = await this.db.select().from(cmsPages).where(and(eq(cmsPages.id, id), eq(cmsPages.isDeleted, false))).limit(1);
    if (!page) throw new Error('Page not found');
    return page;
  }

  async update(id: number, dto: UpdateCmDto) {
    await this.findOne(id);
    const [updated] = await this.db.update(cmsPages).set(dto).where(eq(cmsPages.id, id)).returning();
    return updated;
  }

  async remove(id: number) {
    await this.db.update(cmsPages).set({ isDeleted: true } as any).where(eq(cmsPages.id, id));
  }
}
