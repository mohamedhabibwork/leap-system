import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, sql } from 'drizzle-orm';
import {
  lessons,
  courseSections,
  courses,
  enrollments,
  lookups,
} from '@leap-lms/database';

@Injectable()
export class LessonsService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>) {}

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

  async getCourseLessons(courseId: number, userId?: number, userRole?: string) {
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
    if (!userId || !userRole) {
      return courseLessons.map((lesson) => ({
        ...lesson,
        canAccess: lesson.isPreview,
        accessReason: lesson.isPreview ? 'preview' : 'denied',
      }));
    }

    // Get course instructor info
    const [courseData] = await this.db
      .select({ instructorId: courses.instructorId })
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    // Check if user is admin or instructor
    const isAdmin = userRole === 'admin';
    const isInstructor = courseData && courseData.instructorId === userId;

    // If admin or instructor, grant access to all
    if (isAdmin || isInstructor) {
      return courseLessons.map((lesson) => ({
        ...lesson,
        canAccess: true,
        accessReason: isAdmin ? 'admin' : 'instructor',
      }));
    }

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

    // Return lessons with access flags
    return courseLessons.map((lesson) => ({
      ...lesson,
      canAccess: lesson.isPreview || isEnrolled,
      accessReason: lesson.isPreview
        ? 'preview'
        : isEnrolled
        ? 'enrolled'
        : 'denied',
    }));
  }
}
