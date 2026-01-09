import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and, or, ilike, desc, asc, sql } from 'drizzle-orm';
import { pages } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { AdminPageQueryDto } from './dto/admin-page-query.dto';
import { BulkPageOperationDto, PageBulkAction } from './dto/bulk-page-operation.dto';

@Injectable()
export class PagesService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>) {}

  async create(dto: CreatePageDto & { createdBy: number }) {
    const [page] = await this.db.insert(pages).values(dto as any).returning();
    return page;
  }

  async findAllAdmin(query: AdminPageQueryDto) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const offset = (page - 1) * limit;

    let conditions: any[] = [eq(pages.isDeleted, false)];

    if (search) {
      conditions.push(
        or(
          ilike(pages.name, `%${search}%`),
          ilike(pages.description, `%${search}%`)
        )
      );
    }

    if (query.categoryId) {
      conditions.push(eq(pages.categoryId, query.categoryId));
    }

    if (query.createdBy) {
      conditions.push(eq(pages.createdBy, query.createdBy));
    }

    const whereClause = and(...conditions);
    const orderByClause = sortOrder === 'asc' ? asc(pages[sortBy]) : desc(pages[sortBy]);

    const [data, countResult] = await Promise.all([
      this.db
        .select()
        .from(pages)
        .where(whereClause)
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(pages)
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
    const [page] = await this.db
      .select()
      .from(pages)
      .where(and(eq(pages.id, id), eq(pages.isDeleted, false)))
      .limit(1);

    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async update(id: number, dto: UpdatePageDto) {
    await this.findOne(id);
    const [updated] = await this.db
      .update(pages)
      .set({ ...dto, updatedAt: new Date() } as any)
      .where(eq(pages.id, id))
      .returning();
    return updated;
  }

  async remove(id: number) {
    await this.db
      .update(pages)
      .set({ isDeleted: true, deletedAt: new Date() } as any)
      .where(eq(pages.id, id));
    return { success: true };
  }

  async verifyPage(id: number, isVerified: boolean) {
    const [updated] = await this.db
      .update(pages)
      .set({ isVerified: isVerified as any, updatedAt: new Date() } as any)
      .where(eq(pages.id, id))
      .returning();
    return updated;
  }

  async setFeatured(id: number, isFeatured: boolean) {
    const [updated] = await this.db
      .update(pages)
      .set({ isFeatured: isFeatured as any, updatedAt: new Date() } as any)
      .where(eq(pages.id, id))
      .returning();
    return updated;
  }

  async getStatistics() {
    const [stats] = await this.db
      .select({
        total: sql<number>`count(*)`,
        verified: sql<number>`count(*) filter (where is_verified = true)`,
        featured: sql<number>`count(*) filter (where is_featured = true)`,
      })
      .from(pages)
      .where(eq(pages.isDeleted, false));

    return stats;
  }

  async bulkOperation(dto: BulkPageOperationDto) {
    const { ids, action } = dto;
    let processedCount = 0;
    const errors: Array<{ id: number; error: string }> = [];

    for (const id of ids) {
      try {
        switch (action) {
          case PageBulkAction.DELETE:
            await this.remove(id);
            break;
          case PageBulkAction.VERIFY:
            await this.verifyPage(id, true);
            break;
          case PageBulkAction.UNVERIFY:
            await this.verifyPage(id, false);
            break;
          case PageBulkAction.FEATURE:
            await this.setFeatured(id, true);
            break;
          case PageBulkAction.UNFEATURE:
            await this.setFeatured(id, false);
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

  async exportToCsv(query: AdminPageQueryDto) {
    const result = await this.findAllAdmin({ ...query, limit: 10000 });
    // CSV export logic would go here
    return { data: result.data, format: 'csv' };
  }
}
