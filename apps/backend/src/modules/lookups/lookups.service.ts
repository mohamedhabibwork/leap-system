import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { lookups, lookupTypes } from '@leap-lms/database';
import { eq, and, isNull, sql, desc, like, or } from 'drizzle-orm';
import { LookupTypeCode } from '@leap-lms/shared-types';

@Injectable()
export class LookupsService {
  constructor(@Inject(DATABASE_CONNECTION) private db: any) {}

  async findAll() {
    return this.db
      .select()
      .from(lookups)
      .where(eq(lookups.isDeleted, false))
      .orderBy(lookups.displayOrder, lookups.sortOrder);
  }

  async findByType(typeCode: LookupTypeCode | string, query?: any) {
    const [type] = await this.db
      .select()
      .from(lookupTypes)
      .where(eq(lookupTypes.code, typeCode))
      .limit(1);

    if (!type) {
      throw new NotFoundException(`Lookup type ${typeCode} not found`);
    }

    const conditions = [
      eq(lookups.lookupTypeId, type.id),
      eq(lookups.isDeleted, false),
      eq(lookups.isActive, true)
    ];

    if (query?.search) {
      conditions.push(
        or(
          like(lookups.nameEn, `%${query.search}%`),
          like(lookups.nameAr, `%${query.search}%`)
        )
      );
    }

    return this.db
      .select()
      .from(lookups)
      .where(and(...conditions))
      .orderBy(lookups.displayOrder, lookups.sortOrder);
  }

  async findOne(id: number) {
    const [lookup] = await this.db
      .select()
      .from(lookups)
      .where(and(eq(lookups.id, id), eq(lookups.isDeleted, false)))
      .limit(1);

    if (!lookup) {
      throw new NotFoundException(`Lookup with ID ${id} not found`);
    }

    return lookup;
  }

  async create(data: any) {
    const [lookup] = await this.db
      .insert(lookups)
      .values({
        ...data,
        isActive: data.isActive ?? true,
        isDeleted: false,
      })
      .returning();

    return lookup;
  }

  async update(id: number, data: any) {
    const [updated] = await this.db
      .update(lookups)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(lookups.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException(`Lookup with ID ${id} not found`);
    }

    return updated;
  }

  async remove(id: number) {
    const [deleted] = await this.db
      .update(lookups)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
      })
      .where(eq(lookups.id, id))
      .returning();

    if (!deleted) {
      throw new NotFoundException(`Lookup with ID ${id} not found`);
    }

    return { message: 'Lookup deleted successfully' };
  }

  async findAllAdmin(query: any) {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      typeId, 
      lookupTypeId,
      isActive,
      code,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;
    const offset = (page - 1) * limit;

    const conditions = [eq(lookups.isDeleted, false)];

    if (search) {
      conditions.push(
        or(
          like(lookups.nameEn, `%${search}%`),
          like(lookups.nameAr, `%${search}%`),
          like(lookups.code, `%${search}%`)
        )
      );
    }

    const finalTypeId = typeId || lookupTypeId;
    if (finalTypeId) {
      conditions.push(eq(lookups.lookupTypeId, finalTypeId));
    }

    if (isActive !== undefined) {
      conditions.push(eq(lookups.isActive, isActive));
    }

    if (code) {
      conditions.push(like(lookups.code, `%${code}%`));
    }

    // Build order by clause
    const orderByField = lookups[sortBy] || lookups.createdAt;
    const orderBy = sortOrder === 'asc' ? orderByField : desc(orderByField);

    const results = await this.db
      .select()
      .from(lookups)
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(lookups)
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
        active: sql<number>`count(*) filter (where ${lookups.isActive} = true)`,
        inactive: sql<number>`count(*) filter (where ${lookups.isActive} = false)`,
      })
      .from(lookups)
      .where(eq(lookups.isDeleted, false));

    return {
      total: Number(stats.total),
      active: Number(stats.active),
      inactive: Number(stats.inactive),
    };
  }

  async reorder(dto: any) {
    const { items } = dto;
    
    for (const item of items) {
      await this.db
        .update(lookups)
        .set({ displayOrder: item.order })
        .where(eq(lookups.id, item.id));
    }

    return { message: 'Lookups reordered successfully' };
  }

  async bulkOperation(dto: any) {
    const { operation, ids } = dto;
    
    switch (operation) {
      case 'delete':
        await this.db
          .update(lookups)
          .set({ isDeleted: true, deletedAt: new Date() })
          .where(sql`${lookups.id} = ANY(${ids})`);
        return { message: `Deleted ${ids.length} lookups` };
      
      case 'activate':
        await this.db
          .update(lookups)
          .set({ isActive: true })
          .where(sql`${lookups.id} = ANY(${ids})`);
        return { message: `Activated ${ids.length} lookups` };
      
      case 'deactivate':
        await this.db
          .update(lookups)
          .set({ isActive: false })
          .where(sql`${lookups.id} = ANY(${ids})`);
        return { message: `Deactivated ${ids.length} lookups` };
      
      default:
        throw new Error('Invalid operation');
    }
  }

  async exportToCsv(query: any) {
    const { search, typeId, lookupTypeId } = query;
    const conditions = [eq(lookups.isDeleted, false)];

    if (search) {
      conditions.push(
        or(
          like(lookups.nameEn, `%${search}%`),
          like(lookups.nameAr, `%${search}%`)
        )
      );
    }

    const finalTypeId = typeId || lookupTypeId;
    if (finalTypeId) {
      conditions.push(eq(lookups.lookupTypeId, finalTypeId));
    }

    const results = await this.db
      .select()
      .from(lookups)
      .where(and(...conditions))
      .orderBy(desc(lookups.createdAt));

    // Convert to CSV format
    const headers = ['ID', 'Name (EN)', 'Name (AR)', 'Type ID', 'Active', 'Created At'];
    const csvRows = [headers.join(',')];
    
    for (const lookup of results) {
      const row = [
        lookup.id,
        `"${lookup.nameEn?.replace(/"/g, '""') || ''}"`,
        `"${lookup.nameAr?.replace(/"/g, '""') || ''}"`,
        lookup.lookupTypeId,
        lookup.isActive,
        lookup.createdAt?.toISOString() || '',
      ];
      csvRows.push(row.join(','));
    }

    return csvRows.join('\n');
  }
}
