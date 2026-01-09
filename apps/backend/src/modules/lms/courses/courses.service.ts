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

  async findAll(page: number = 1, limit: number = 10, sort?: string) {
    const offset = (page - 1) * limit;
    
    const results = await this.db
      .select()
      .from(courses)
      .where(eq(courses.isDeleted, false))
      .orderBy(desc(courses.createdAt))
      .limit(limit)
      .offset(offset);
    
    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(courses)
      .where(eq(courses.isDeleted, false));
    
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
