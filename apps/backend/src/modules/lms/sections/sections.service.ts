import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';
import { eq, and, desc, inArray } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';
import { courseSections, courses, users } from '@leap-lms/database';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { ReorderSectionsDto } from './dto/reorder-sections.dto';
import { isAdmin } from '../../../common/enums/roles.enum';

@Injectable()
export class SectionsService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>) {}

  async create(createSectionDto: CreateSectionDto, userId: number, userRole?: string) {
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
    if (course.instructorId !== userId && !isAdmin(userRole || '')) {
      throw new ForbiddenException('Only the course instructor or admin can create sections');
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
      .values(createSectionDto )
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

  async update(id: number, updateSectionDto: UpdateSectionDto, userId: number, userRole?: string) {
    const section = await this.findOne(id);

    // Verify course ownership
    const [course] = await this.db
      .select()
      .from(courses)
      .where(and(eq(courses.id, section.courseId), eq(courses.isDeleted, false)))
      .limit(1);

    if (course.instructorId !== userId && !isAdmin(userRole || '')) {
      throw new ForbiddenException('Only the course instructor or admin can update sections');
    }

    const [updated] = await this.db
      .update(courseSections)
      .set({ ...updateSectionDto, updatedAt: new Date() } as Partial<InferSelectModel<typeof courseSections>>)
      .where(eq(courseSections.id, id))
      .returning();

    return updated;
  }

  async remove(id: number, userId: number, userRole?: string) {
    const section = await this.findOne(id);

    // Verify course ownership
    const [course] = await this.db
      .select()
      .from(courses)
      .where(and(eq(courses.id, section.courseId), eq(courses.isDeleted, false)))
      .limit(1);

    if (course.instructorId !== userId && !isAdmin(userRole || '')) {
      throw new ForbiddenException('Only the course instructor or admin can delete sections');
    }

    await this.db
      .update(courseSections)
      .set({ isDeleted: true, deletedAt: new Date() } as Partial<InferSelectModel<typeof courseSections>>)
      .where(eq(courseSections.id, id));

    return { message: 'Section deleted successfully' };
  }

  async reorder(courseId: number, reorderDto: ReorderSectionsDto, userId: number, userRole?: string) {
    // Verify course exists and user is the instructor
    const [course] = await this.db
      .select()
      .from(courses)
      .where(and(eq(courses.id, courseId), eq(courses.isDeleted, false)))
      .limit(1);

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    // Check if user is instructor or admin
    if (course.instructorId !== userId && !isAdmin(userRole || '')) {
      throw new ForbiddenException('Only the course instructor or admin can reorder sections');
    }

    // Verify all sections belong to this course
    const sectionIds = reorderDto.sections.map((s) => s.id);
    const existingSections = await this.db
      .select({ id: courseSections.id, courseId: courseSections.courseId })
      .from(courseSections)
      .where(
        and(
          eq(courseSections.courseId, courseId),
          eq(courseSections.isDeleted, false),
          inArray(courseSections.id, sectionIds)
        )
      );

    if (existingSections.length !== sectionIds.length) {
      throw new ForbiddenException('Some sections do not belong to this course');
    }

    // Update display orders
    for (const section of reorderDto.sections) {
      await this.db
        .update(courseSections)
        .set({ displayOrder: section.displayOrder, updatedAt: new Date() } as Partial<InferSelectModel<typeof courseSections>>)
        .where(eq(courseSections.id, section.id));
    }

    return { message: 'Sections reordered successfully' };
  }
}
