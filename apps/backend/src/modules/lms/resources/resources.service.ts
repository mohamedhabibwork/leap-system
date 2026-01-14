import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, desc, or, isNull } from 'drizzle-orm';
import { courseResources, courses } from '@leap-lms/database';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

@Injectable()
export class ResourcesService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>) {}

  async create(dto: CreateResourceDto, userId: number, isAdmin: boolean) {
    // Verify user has access to the course
    if (!isAdmin) {
      const course = await this.db
        .select()
        .from(courses)
        .where(and(eq(courses.id, dto.courseId), eq(courses.isDeleted, false)))
        .limit(1);

      if (!course.length) {
        throw new NotFoundException('Course not found');
      }

      if (course[0].instructorId !== userId) {
        throw new ForbiddenException('You do not have permission to add resources to this course');
      }
    }

    const [resource] = await this.db
      .insert(courseResources)
      .values({
        courseId: dto.courseId,
        sectionId: dto.sectionId || null,
        lessonId: dto.lessonId || null,
        resourceTypeId: dto.resourceTypeId,
        titleEn: dto.titleEn,
        titleAr: dto.titleAr,
        descriptionEn: dto.descriptionEn,
        descriptionAr: dto.descriptionAr,
        fileUrl: dto.fileUrl,
        fileName: dto.fileName,
        fileSize: dto.fileSize,
        displayOrder: dto.displayOrder || 0,
      } as any)
      .returning();

    return resource;
  }

  async findByCourse(courseId: number) {
    return await this.db
      .select()
      .from(courseResources)
      .where(
        and(
          eq(courseResources.courseId, courseId),
          isNull(courseResources.sectionId),
          isNull(courseResources.lessonId),
          eq(courseResources.isDeleted, false),
        ),
      )
      .orderBy(courseResources.displayOrder, desc(courseResources.createdAt));
  }

  async findBySection(sectionId: number) {
    return await this.db
      .select()
      .from(courseResources)
      .where(
        and(
          eq(courseResources.sectionId, sectionId),
          isNull(courseResources.lessonId),
          eq(courseResources.isDeleted, false),
        ),
      )
      .orderBy(courseResources.displayOrder, desc(courseResources.createdAt));
  }

  async findByLesson(lessonId: number) {
    return await this.db
      .select()
      .from(courseResources)
      .where(and(eq(courseResources.lessonId, lessonId), eq(courseResources.isDeleted, false)))
      .orderBy(courseResources.displayOrder, desc(courseResources.createdAt));
  }

  async findOne(id: number) {
    const [resource] = await this.db
      .select()
      .from(courseResources)
      .where(and(eq(courseResources.id, id), eq(courseResources.isDeleted, false)))
      .limit(1);

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    return resource;
  }

  async update(id: number, dto: UpdateResourceDto, userId: number, isAdmin: boolean) {
    const resource = await this.findOne(id);

    // Verify access
    if (!isAdmin) {
      const course = await this.db
        .select()
        .from(courses)
        .where(eq(courses.id, resource.courseId))
        .limit(1);

      if (course.length && course[0].instructorId !== userId) {
        throw new ForbiddenException('You do not have permission to update this resource');
      }
    }

    const [updated] = await this.db
      .update(courseResources)
      .set({
        ...dto,
        updatedAt: new Date(),
      } as any)
      .where(eq(courseResources.id, id))
      .returning();

    return updated;
  }

  async remove(id: number, userId: number, isAdmin: boolean) {
    const resource = await this.findOne(id);

    // Verify access
    if (!isAdmin) {
      const course = await this.db
        .select()
        .from(courses)
        .where(eq(courses.id, resource.courseId))
        .limit(1);

      if (course.length && course[0].instructorId !== userId) {
        throw new ForbiddenException('You do not have permission to delete this resource');
      }
    }

    await this.db
      .update(courseResources)
      .set({ isDeleted: true, deletedAt: new Date() } as any)
      .where(eq(courseResources.id, id));
  }

  async trackDownload(id: number) {
    const resource = await this.findOne(id);

    // Increment download count
    await this.db
      .update(courseResources)
      .set({
        downloadCount: (resource.downloadCount || 0) + 1,
      } as any)
      .where(eq(courseResources.id, id));

    return {
      resourceId: id,
      fileUrl: resource.fileUrl,
      fileName: resource.fileName,
      downloadCount: (resource.downloadCount || 0) + 1,
    };
  }
}
