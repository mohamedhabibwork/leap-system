import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { eq, and, sql, desc } from 'drizzle-orm';
import { courses } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class CoursesService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>) {}

  async create(createCourseDto: CreateCourseDto) {
    const [course] = await this.db.insert(courses).values(createCourseDto as any).returning();
    return course;
  }

  async findAll(page: number = 1, limit: number = 10, sort: string = 'desc', search?: string, sortBy: string = 'createdAt') {
    const offset = (page - 1) * limit;
    
    const conditions = [eq(courses.isDeleted, false)];
    
    // Add search condition if provided
    if (search && search.trim()) {
      conditions.push(
        sql`(${courses.titleEn} ILIKE ${`%${search.trim()}%`} OR ${courses.titleAr} ILIKE ${`%${search.trim()}%`} OR ${courses.descriptionEn} ILIKE ${`%${search.trim()}%`} OR ${courses.descriptionAr} ILIKE ${`%${search.trim()}%`})`
      );
    }
    
    // Build order by clause based on sortBy parameter
    let orderByClause;
    if (sortBy === 'popular') {
      // Use viewCount as popularity metric
      orderByClause = sort === 'asc' ? sql`${courses.viewCount} ASC` : sql`${courses.viewCount} DESC`;
    } else if (sortBy === 'title') {
      orderByClause = sort === 'asc' ? sql`${courses.titleEn} ASC` : sql`${courses.titleEn} DESC`;
    } else if (sortBy === 'price') {
      orderByClause = sort === 'asc' ? sql`${courses.price} ASC NULLS LAST` : sql`${courses.price} DESC NULLS LAST`;
    } else {
      // Default to createdAt
      orderByClause = sort === 'asc' ? sql`${courses.createdAt} ASC` : sql`${courses.createdAt} DESC`;
    }
    
    const results = await this.db
      .select()
      .from(courses)
      .where(and(...conditions))
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);
    
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(courses)
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

  async findPublished() {
    return await this.db.select().from(courses).where(
      and(eq(courses.isDeleted, false))
    );
  }

  async findOne(id: number) {
    const [course] = await this.db.select().from(courses).where(
      and(eq(courses.id, id), eq(courses.isDeleted, false))
    ).limit(1);
    if (!course) throw new NotFoundException(`Course with ID ${id} not found`);
    return course;
  }

  async update(id: number, updateCourseDto: UpdateCourseDto) {
    await this.findOne(id);
    const [updated] = await this.db.update(courses).set(updateCourseDto as any).where(eq(courses.id, id)).returning();
    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.db.update(courses).set({
      isDeleted: true,
    } as any).where(eq(courses.id, id));
  }
}
