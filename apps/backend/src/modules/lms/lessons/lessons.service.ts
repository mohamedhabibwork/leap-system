import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';
import { eq, and, inArray, desc } from 'drizzle-orm';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import {
  lessons,
  courseSections,
  courses,
  enrollments,
  lookups,
  lessonProgress,
  assignments,
  quizzes,
} from '@leap-lms/database';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ReorderLessonsDto } from './dto/reorder-lessons.dto';
import { isAdmin } from '../../../common/enums/roles.enum';

@Injectable()
export class LessonsService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>) {}

  async findOne(lessonId: number) {
    const [lesson] = await this.db
      .select()
      .from(lessons)
      .where(and(eq(lessons.id, lessonId), eq(lessons.isDeleted, false)))
      .limit(1);

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    return lesson;
  }

  async checkLessonAccess(
    lessonId: number,
    userId: number,
    userRole: string
  ): Promise<{
    canAccess: boolean;
    reason: 'admin' | 'instructor' | 'enrolled' | 'preview' | 'denied';
    enrollment?: any;
  }> {
    // Get lesson with course information
    const [lessonData] = await this.db
      .select({
        lessonId: lessons.id,
        isPreview: lessons.isPreview,
        courseId: courses.id,
        instructorId: courses.instructorId,
      })
      .from(lessons)
      .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
      .innerJoin(courses, eq(courseSections.courseId, courses.id))
      .where(and(eq(lessons.id, lessonId), eq(lessons.isDeleted, false)))
      .limit(1);

    if (!lessonData) {
      throw new NotFoundException('Lesson not found');
    }

    // Admin has full access
    if (userRole === 'admin') {
      return { canAccess: true, reason: 'admin' };
    }

    // Course instructor has full access
    if (lessonData.instructorId === userId) {
      return { canAccess: true, reason: 'instructor' };
    }

    // Preview lessons are free for all
    if (lessonData.isPreview) {
      return { canAccess: true, reason: 'preview' };
    }

    // Check enrollment
    const [enrollment] = await this.db
      .select({
        id: enrollments.id,
        enrollmentTypeId: enrollments.enrollmentTypeId,
        expiresAt: enrollments.expiresAt,
        enrolledAt: enrollments.enrolledAt,
        enrollmentTypeName: lookups.nameEn,
      })
      .from(enrollments)
      .leftJoin(lookups, eq(enrollments.enrollmentTypeId, lookups.id))
      .where(
        and(
          eq(enrollments.userId, userId),
          eq(enrollments.courseId, lessonData.courseId),
          eq(enrollments.isDeleted, false)
        )
      )
      .limit(1);

    if (enrollment) {
      // Check if enrollment is expired
      if (enrollment.expiresAt && new Date(enrollment.expiresAt) < new Date()) {
        return {
          canAccess: false,
          reason: 'denied',
          enrollment: {
            ...enrollment,
            isExpired: true,
            daysRemaining: 0,
          },
        };
      }

      // Calculate days remaining
      let daysRemaining: number | undefined;
      if (enrollment.expiresAt) {
        const diffTime = new Date(enrollment.expiresAt).getTime() - new Date().getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      return {
        canAccess: true,
        reason: 'enrolled',
        enrollment: {
          id: enrollment.id,
          enrollmentType: enrollment.enrollmentTypeName || 'Standard',
          expiresAt: enrollment.expiresAt,
          daysRemaining,
          isExpired: false,
        },
      };
    }

    return { canAccess: false, reason: 'denied' };
  }

  async getCourseLessons(courseId: number, userId?: number, userRoles?: string[]) {
    // Get all lessons for the course
    const courseLessons = await this.db
      .select({
        id: lessons.id,
        uuid: lessons.uuid,
        sectionId: lessons.sectionId,
        titleEn: lessons.titleEn,
        titleAr: lessons.titleAr,
        descriptionEn: lessons.descriptionEn,
        descriptionAr: lessons.descriptionAr,
        videoUrl: lessons.videoUrl,
        attachmentUrl: lessons.attachmentUrl,
        durationMinutes: lessons.durationMinutes,
        displayOrder: lessons.displayOrder,
        isPreview: lessons.isPreview,
        createdAt: lessons.createdAt,
      })
      .from(lessons)
      .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
      .where(
        and(
          eq(courseSections.courseId, courseId),
          eq(lessons.isDeleted, false),
          eq(courseSections.isDeleted, false)
        )
      )
      .orderBy(lessons.displayOrder);

    // If no user provided, return lessons with basic access info
    if (!userId || !userRoles || userRoles.length === 0) {
      return courseLessons.map((lesson) => ({
        ...lesson,
        canAccess: lesson.isPreview,
        accessReason: lesson.isPreview ? 'preview' : 'denied',
        progress: {
          isCompleted: false,
          timeSpentMinutes: 0,
          completedAt: null,
          lastAccessedAt: null,
        },
      }));
    }

    // Get course instructor info
    const [courseData] = await this.db
      .select({ instructorId: courses.instructorId })
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    // Check if user is admin or instructor
    const isAdmin = userRoles.includes('admin');
    const isInstructor = userRoles.includes('instructor') || (courseData && courseData.instructorId === userId);

    // Check user enrollment
    const [enrollment] = await this.db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.userId, userId),
          eq(enrollments.courseId, courseId),
          eq(enrollments.isDeleted, false)
        )
      )
      .limit(1);

    const isEnrolled =
      enrollment &&
      (!enrollment.expiresAt || new Date(enrollment.expiresAt) > new Date());

    // Fetch lesson progress for all lessons if user has an enrollment
    // Progress should be visible regardless of enrollment expiration status
    // (Expiration only affects access, not progress visibility)
    let lessonProgressMap: Record<number, {
      isCompleted: boolean;
      timeSpentMinutes: number;
      completedAt: Date | null;
      lastAccessedAt: Date | null;
    }> = {};

    // Fetch progress if enrollment exists (even if expired)
    // This ensures users can see their progress even after enrollment expires
    if (enrollment && courseLessons.length > 0) {
      const lessonIds = courseLessons.map((lesson) => lesson.id);
      const progressRecords = await this.db
        .select({
          lessonId: lessonProgress.lessonId,
          isCompleted: lessonProgress.isCompleted,
          timeSpentMinutes: lessonProgress.timeSpentMinutes,
          completedAt: lessonProgress.completedAt,
          lastAccessedAt: lessonProgress.lastAccessedAt,
        })
        .from(lessonProgress)
        .where(
          and(
            eq(lessonProgress.enrollmentId, enrollment.id),
            inArray(lessonProgress.lessonId, lessonIds),
            eq(lessonProgress.isDeleted, false)
          )
        );

      // Create a map of lessonId -> progress
      progressRecords.forEach((progress) => {
        // Use the boolean value directly from database - Drizzle returns proper boolean types
        lessonProgressMap[progress.lessonId] = {
          isCompleted: progress.isCompleted, // Direct boolean from database
          timeSpentMinutes: progress.timeSpentMinutes ?? 0,
          completedAt: progress.completedAt,
          lastAccessedAt: progress.lastAccessedAt,
        };
      });
    }

    // Return lessons with access flags and progress
    return courseLessons.map((lesson) => {
      const progress = lessonProgressMap[lesson.id] || {
        isCompleted: false,
        timeSpentMinutes: 0,
        completedAt: null,
        lastAccessedAt: null,
      };

      return {
        ...lesson,
        canAccess: isAdmin || isInstructor || lesson.isPreview || isEnrolled,
        accessReason: isAdmin
          ? 'admin'
          : isInstructor
          ? 'instructor'
          : lesson.isPreview
          ? 'preview'
          : isEnrolled
          ? 'enrolled'
          : 'denied',
        progress,
      };
    });
  }

  async create(createLessonDto: CreateLessonDto, userId: number, userRole?: string) {
    // Verify section exists and get course info
    const [section] = await this.db
      .select({
        id: courseSections.id,
        courseId: courseSections.courseId,
      })
      .from(courseSections)
      .where(and(eq(courseSections.id, createLessonDto.sectionId), eq(courseSections.isDeleted, false)))
      .limit(1);

    if (!section) {
      throw new NotFoundException(`Section with ID ${createLessonDto.sectionId} not found`);
    }

    // Verify course ownership
    const [course] = await this.db
      .select()
      .from(courses)
      .where(and(eq(courses.id, section.courseId), eq(courses.isDeleted, false)))
      .limit(1);

    if (course.instructorId !== userId && !isAdmin(userRole || '')) {
      throw new ForbiddenException('Only the course instructor or admin can create lessons');
    }

    // Get max display order if not provided
    if (createLessonDto.displayOrder === undefined) {
      const [maxOrder] = await this.db
        .select({ maxOrder: lessons.displayOrder })
        .from(lessons)
        .where(and(eq(lessons.sectionId, createLessonDto.sectionId), eq(lessons.isDeleted, false)))
        .orderBy(desc(lessons.displayOrder))
        .limit(1);

      createLessonDto.displayOrder = (maxOrder?.maxOrder || 0) + 1;
    }

    const [lesson] = await this.db
      .insert(lessons)
      .values(createLessonDto )
      .returning();

    return lesson;
  }

  async findAll(sectionId: number) {
    const sectionLessons = await this.db
      .select()
      .from(lessons)
      .where(and(eq(lessons.sectionId, sectionId), eq(lessons.isDeleted, false)))
      .orderBy(lessons.displayOrder);

    // Get assignments for this section
    const sectionAssignments = await this.db
      .select()
      .from(assignments)
      .where(and(eq(assignments.sectionId, sectionId), eq(assignments.isDeleted, false)))
      .orderBy(desc(assignments.createdAt));

    // Get quizzes for this section (both section-level and lesson-level)
    const sectionQuizzes = await this.db
      .select()
      .from(quizzes)
      .where(
        and(
          eq(quizzes.sectionId, sectionId),
          eq(quizzes.isDeleted, false)
        )
      )
      .orderBy(desc(quizzes.createdAt));

    // Group quizzes by lessonId (null for section-level quizzes)
    const quizzesByLessonId = new Map<number | null, typeof sectionQuizzes>();
    sectionQuizzes.forEach((quiz) => {
      const lessonId = quiz.lessonId ?? null;
      if (!quizzesByLessonId.has(lessonId)) {
        quizzesByLessonId.set(lessonId, []);
      }
      quizzesByLessonId.get(lessonId)!.push(quiz);
    });

    // Attach quizzes to lessons and include section-level assignments and quizzes
    return {
      lessons: sectionLessons.map((lesson) => ({
        ...lesson,
        quizzes: quizzesByLessonId.get(lesson.id) || [],
      })),
      assignments: sectionAssignments,
      quizzes: quizzesByLessonId.get(null) || [], // Section-level quizzes
    };
  }

  async update(id: number, updateLessonDto: UpdateLessonDto, userId: number, userRole?: string) {
    const lesson = await this.findOne(id);

    // Get section and course info
    const [section] = await this.db
      .select({
        id: courseSections.id,
        courseId: courseSections.courseId,
      })
      .from(courseSections)
      .where(and(eq(courseSections.id, lesson.sectionId), eq(courseSections.isDeleted, false)))
      .limit(1);

    // Verify course ownership
    const [course] = await this.db
      .select()
      .from(courses)
      .where(and(eq(courses.id, section.courseId), eq(courses.isDeleted, false)))
      .limit(1);

    if (course.instructorId !== userId && !isAdmin(userRole || '')) {
      throw new ForbiddenException('Only the course instructor or admin can update lessons');
    }

    const [updated] = await this.db
      .update(lessons)
      .set({ ...updateLessonDto, updatedAt: new Date() } as Partial<InferInsertModel<typeof lessons>>)
      .where(eq(lessons.id, id))
      .returning();

    return updated;
  }

  async remove(id: number, userId: number, userRole?: string) {
    const lesson = await this.findOne(id);

    // Get section and course info
    const [section] = await this.db
      .select({
        id: courseSections.id,
        courseId: courseSections.courseId,
      })
      .from(courseSections)
      .where(and(eq(courseSections.id, lesson.sectionId), eq(courseSections.isDeleted, false)))
      .limit(1);

    // Verify course ownership
    const [course] = await this.db
      .select()
      .from(courses)
      .where(and(eq(courses.id, section.courseId), eq(courses.isDeleted, false)))
      .limit(1);

    if (course.instructorId !== userId && !isAdmin(userRole || '')) {
      throw new ForbiddenException('Only the course instructor or admin can delete lessons');
    }

    await this.db
      .update(lessons)
      .set({ isDeleted: true, deletedAt: new Date() } as Partial<InferInsertModel<typeof lessons>>)
      .where(eq(lessons.id, id));

    return { message: 'Lesson deleted successfully' };
  }

  async reorder(sectionId: number, reorderDto: ReorderLessonsDto, userId: number, userRole?: string) {
    // Verify section exists and get course info
    const [section] = await this.db
      .select({
        id: courseSections.id,
        courseId: courseSections.courseId,
      })
      .from(courseSections)
      .where(and(eq(courseSections.id, sectionId), eq(courseSections.isDeleted, false)))
      .limit(1);

    if (!section) {
      throw new NotFoundException(`Section with ID ${sectionId} not found`);
    }

    // Verify course ownership
    const [course] = await this.db
      .select()
      .from(courses)
      .where(and(eq(courses.id, section.courseId), eq(courses.isDeleted, false)))
      .limit(1);

    if (course.instructorId !== userId && !isAdmin(userRole || '')) {
      throw new ForbiddenException('Only the course instructor or admin can reorder lessons');
    }

    // Verify all lessons belong to this section
    const lessonIds = reorderDto.lessons.map((l) => l.id);
    const existingLessons = await this.db
      .select({ id: lessons.id, sectionId: lessons.sectionId })
      .from(lessons)
      .where(
        and(
          eq(lessons.sectionId, sectionId),
          eq(lessons.isDeleted, false),
          inArray(lessons.id, lessonIds)
        )
      );

    if (existingLessons.length !== lessonIds.length) {
      throw new ForbiddenException('Some lessons do not belong to this section');
    }

    // Update display orders
    for (const lesson of reorderDto.lessons) {
      await this.db
        .update(lessons)
        .set({ displayOrder: lesson.displayOrder, updatedAt: new Date() } as Partial<InferInsertModel<typeof lessons>>)
        .where(eq(lessons.id, lesson.id));
    }

    return { message: 'Lessons reordered successfully' };
  }
}
