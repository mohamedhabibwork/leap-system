import { Injectable, Inject } from '@nestjs/common';
import { CreateCmDto } from './dto/create-cm.dto';
import { UpdateCmDto } from './dto/update-cm.dto';
import { eq, and, sql, desc, like, or } from 'drizzle-orm';
import { cmsPages } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

@Injectable()
export class CmsService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>) {}

  async create(dto: CreateCmDto) {
    const [page] = await this.db.insert(cmsPages).values(dto as InferInsertModel<typeof cmsPages>).returning();
    return page;
  }

  async findAll() {
    return await this.db.select().from(cmsPages).where(eq(cmsPages.isDeleted, false));
  }

  async findAllAdmin(query: any) {
    const { page = 1, limit = 10, search, isPublished } = query;
    const offset = (page - 1) * limit;

    const conditions = [eq(cmsPages.isDeleted, false)];

    if (search) {
      conditions.push(
        or(
          like(cmsPages.titleEn, `%${search}%`),
          like(cmsPages.titleAr, `%${search}%`),
          like(cmsPages.slug, `%${search}%`)
        )
      );
    }

    if (isPublished !== undefined) {
      conditions.push(eq(cmsPages.isPublished, isPublished));
    }

    const results = await this.db
      .select()
      .from(cmsPages)
      .where(and(...conditions))
      .orderBy(desc(cmsPages.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(cmsPages)
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
        published: sql<number>`count(*) filter (where ${cmsPages.isPublished} = true)`,
        draft: sql<number>`count(*) filter (where ${cmsPages.isPublished} = false)`,
      })
      .from(cmsPages)
      .where(eq(cmsPages.isDeleted, false));

    return {
      total: Number(stats.total),
      published: Number(stats.published),
      draft: Number(stats.draft),
    };
  }

  async findOne(id: number) {
    const [page] = await this.db.select().from(cmsPages).where(and(eq(cmsPages.id, id), eq(cmsPages.isDeleted, false))).limit(1);
    if (!page) throw new Error('Page not found');
    return page;
  }

  async findBySlug(slug: string) {
    const [page] = await this.db
      .select()
      .from(cmsPages)
      .where(and(eq(cmsPages.slug, slug), eq(cmsPages.isDeleted, false), eq(cmsPages.isPublished, true)))
      .limit(1);
    if (!page) throw new Error('Page not found');
    return page;
  }

  async publish(id: number) {
    await this.findOne(id);
    const [updated] = await this.db
      .update(cmsPages)
      .set({ isPublished: true, publishedAt: new Date() } as Partial<InferInsertModel<typeof cmsPages>>)
      .where(eq(cmsPages.id, id))
      .returning();
    return updated;
  }

  async unpublish(id: number) {
    await this.findOne(id);
    const [updated] = await this.db
      .update(cmsPages)
      .set({ isPublished: false } as Partial<InferInsertModel<typeof cmsPages>>)
      .where(eq(cmsPages.id, id))
      .returning();
    return updated;
  }

  async update(id: number, dto: UpdateCmDto) {
    await this.findOne(id);
    const [updated] = await this.db.update(cmsPages).set(dto as Partial<InferInsertModel<typeof cmsPages>>).where(eq(cmsPages.id, id)).returning();
    return updated;
  }

  async bulkOperation(dto: any) {
    const { operation, ids } = dto;

    switch (operation) {
      case 'publish':
        await this.db
          .update(cmsPages)
          .set({ isPublished: true, publishedAt: new Date() } as Partial<InferInsertModel<typeof cmsPages>>)
          .where(sql`${cmsPages.id} = ANY(${ids})`);
        break;
      case 'unpublish':
        await this.db
          .update(cmsPages)
          .set({ isPublished: false } as Partial<InferInsertModel<typeof cmsPages>>)
          .where(sql`${cmsPages.id} = ANY(${ids})`);
        break;
      case 'delete':
        await this.db
          .update(cmsPages)
          .set({ isDeleted: true, deletedAt: new Date() } as Partial<InferInsertModel<typeof cmsPages>>)
          .where(sql`${cmsPages.id} = ANY(${ids})`);
        break;
    }

    return { success: true, message: `${operation} completed for ${ids.length} pages` };
  }

  async exportToCsv(query: any) {
    const { search, isPublished } = query;

    const conditions = [eq(cmsPages.isDeleted, false)];

    if (search) {
      conditions.push(
        or(
          like(cmsPages.titleEn, `%${search}%`),
          like(cmsPages.titleAr, `%${search}%`),
          like(cmsPages.slug, `%${search}%`)
        )
      );
    }

    if (isPublished !== undefined) {
      conditions.push(eq(cmsPages.isPublished, isPublished));
    }

    const results = await this.db
      .select()
      .from(cmsPages)
      .where(and(...conditions))
      .orderBy(desc(cmsPages.createdAt));

    return results;
  }

  async remove(id: number) {
    await this.db.update(cmsPages).set({ isDeleted: true } as Partial<InferInsertModel<typeof cmsPages>>).where(eq(cmsPages.id, id));
  }
}
