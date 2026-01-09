import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { lookups, lookupTypes } from '@leap-lms/database';
import { eq, and, isNull } from 'drizzle-orm';

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

  async findByType(typeCode: string) {
    const [type] = await this.db
      .select()
      .from(lookupTypes)
      .where(eq(lookupTypes.code, typeCode))
      .limit(1);

    if (!type) {
      throw new NotFoundException(`Lookup type ${typeCode} not found`);
    }

    return this.db
      .select()
      .from(lookups)
      .where(
        and(
          eq(lookups.lookupTypeId, type.id),
          eq(lookups.isDeleted, false),
          eq(lookups.isActive, true)
        )
      )
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
}
