import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { lookupTypes } from '@leap-lms/database';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class LookupTypesService {
  constructor(@Inject(DATABASE_CONNECTION) private db: any) {}

  async findAll() {
    return this.db
      .select()
      .from(lookupTypes)
      .where(eq(lookupTypes.isDeleted, false))
      .orderBy(lookupTypes.sortOrder);
  }

  async findOne(id: number) {
    const [type] = await this.db
      .select()
      .from(lookupTypes)
      .where(and(eq(lookupTypes.id, id), eq(lookupTypes.isDeleted, false)))
      .limit(1);

    if (!type) {
      throw new NotFoundException(`Lookup type with ID ${id} not found`);
    }

    return type;
  }

  async findByCode(code: string) {
    const [type] = await this.db
      .select()
      .from(lookupTypes)
      .where(eq(lookupTypes.code, code))
      .limit(1);

    if (!type) {
      throw new NotFoundException(`Lookup type ${code} not found`);
    }

    return type;
  }

  async create(data: any) {
    const [type] = await this.db
      .insert(lookupTypes)
      .values({
        ...data,
        isActive: data.isActive ?? true,
        isDeleted: false,
      })
      .returning();

    return type;
  }

  async update(id: number, data: any) {
    const [updated] = await this.db
      .update(lookupTypes)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(lookupTypes.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException(`Lookup type with ID ${id} not found`);
    }

    return updated;
  }

  async remove(id: number) {
    const [deleted] = await this.db
      .update(lookupTypes)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
      })
      .where(eq(lookupTypes.id, id))
      .returning();

    if (!deleted) {
      throw new NotFoundException(`Lookup type with ID ${id} not found`);
    }

    return { message: 'Lookup type deleted successfully' };
  }
}
