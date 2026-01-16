import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, desc } from 'drizzle-orm';
import { courseSections, courses } from '@leap-lms/database';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Injectable()
export class SectionsService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>) {}

  async create(createSectionDto: CreateSectionDto, userId: number) {
    // Verify course exists and user is the instructor
    const [course] = await this.db
      .select()
      .from(courses)
      .where(and(eq(courses.id, createSectionDto.courseId), eq(courses.isDeleted, false)))
      .limit(1);

    if (!course) {
      throw new NotFoundException(`Course with ID ${createSectionDto.courseId} not found`);
    }

    // Check if user is instructor or admin
    if (course.instructorId !== userId) {
      throw new ForbiddenException('Only the course instructor can create sections');
    }

    // Get max display order if not provided
    if (createSectionDto.displayOrder === undefined) {
      const [maxOrder] = await this.db
        .select({ maxOrder: courseSections.displayOrder })
        .from(courseSections)
        .where(and(eq(courseSections.courseId, createSectionDto.courseId), eq(courseSections.isDeleted, false)))
        .orderBy(desc(courseSections.displayOrder))
        .limit(1);

      createSectionDto.displayOrder = (maxOrder?.maxOrder || 0) + 1;
    }

    const [section] = await this.db
      .insert(courseSections)
      .values(createSectionDto as any)
      .returning();

    return section;
  }

  async findAll(courseId: number) {
    const sections = await this.db
      .select()
      .from(courseSections)
      .where(and(eq(courseSections.courseId, courseId), eq(courseSections.isDeleted, false)))
      .orderBy(courseSections.displayOrder);

    return sections;
  }

  async findOne(id: number) {
    const [section] = await this.db
      .select()
      .from(courseSections)
      .where(and(eq(courseSections.id, id), eq(courseSections.isDeleted, false)))
      .limit(1);

    if (!section) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }

    return section;
  }

  async update(id: number, updateSectionDto: UpdateSectionDto, userId: number) {
    const section = await this.findOne(id);

    // Verify course ownership
    const [course] = await this.db
      .select()
      .from(courses)
      .where(and(eq(courses.id, section.courseId), eq(courses.isDeleted, false)))
      .limit(1);

    if (course.instructorId !== userId) {
      throw new ForbiddenException('Only the course instructor can update sections');
    }

    const [updated] = await this.db
      .update(courseSections)
      .set({ ...updateSectionDto, updatedAt: new Date() } as any)
      .where(eq(courseSections.id, id))
      .returning();

    return updated;
  }

  async remove(id: number, userId: number) {
    const section = await this.findOne(id);

    // Verify course ownership
    const [course] = await this.db
      .select()
      .from(courses)
      .where(and(eq(courses.id, section.courseId), eq(courses.isDeleted, false)))
      .limit(1);

    if (course.instructorId !== userId) {
      throw new ForbiddenException('Only the course instructor can delete sections');
    }

    await this.db
      .update(courseSections)
      .set({ isDeleted: true, deletedAt: new Date() } as any)
      .where(eq(courseSections.id, id));

    return { message: 'Section deleted successfully' };
  }
}
