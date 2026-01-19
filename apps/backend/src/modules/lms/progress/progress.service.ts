import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';
import { eq, and, sql, count } from 'drizzle-orm';
import type { InferInsertModel } from 'drizzle-orm';
import {
  lessonProgress,
  enrollments,
  lessons,
  courseSections,
  courses,
  quizzes,
  quizAttempts,
} from '@leap-lms/database';

export interface TrackLessonProgressDto {
  timeSpent: number;
  completed: boolean;
  lastPosition?: number;
}

export interface CourseProgress {
  courseId: number;
  enrollmentId: number;
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
  timeSpentMinutes: number;
  lastAccessedAt: Date | null;
}

export interface LessonProgress {
  lessonId: number;
  enrollmentId: number;
  isCompleted: boolean;
  timeSpentMinutes: number;
  completedAt: Date | null;
  lastAccessedAt: Date | null;
}

@Injectable()
export class ProgressService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>) {}

  /**
   * Track lesson progress for a user
   * Allows tracking even if enrollment is expired (as long as enrollment exists)
   * Progress tracking should work regardless of access status
   */
  async trackLessonProgress(
    userId: number,
    lessonId: number,
    data: TrackLessonProgressDto,
  ): Promise<LessonProgress> {
    // Get enrollment for this user and course (allow even if expired)
    const [enrollment] = await this.db
      .select({
        enrollmentId: enrollments.id,
        courseId: enrollments.courseId,
      })
      .from(enrollments)
      .innerJoin(lessons, eq(lessons.id, lessonId))
      .innerJoin(courseSections, eq(courseSections.id, lessons.sectionId))
      .where(
        and(
          eq(enrollments.userId, userId),
          eq(courseSections.courseId, enrollments.courseId),
          eq(enrollments.isDeleted, false),
        ),
      )
      .limit(1);

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found for this lesson');
    }

    // Check if progress record exists
    const [existingProgress] = await this.db
      .select()
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.enrollmentId, enrollment.enrollmentId),
          eq(lessonProgress.lessonId, lessonId),
          eq(lessonProgress.isDeleted, false),
        ),
      )
      .limit(1);

    const progressData: any = {
      enrollmentId: enrollment.enrollmentId,
      lessonId,
      timeSpentMinutes: data.timeSpent,
      lastAccessedAt: new Date(),
      updatedAt: new Date(),
    };

    if (data.completed) {
      progressData.isCompleted = true;
      if (!existingProgress || !existingProgress.completedAt) {
        progressData.completedAt = new Date();
      }
    } else if (existingProgress) {
      // Preserve existing completion status if not explicitly setting to completed
      progressData.isCompleted = existingProgress.isCompleted;
      progressData.completedAt = existingProgress.completedAt;
    } else {
      // New progress record, not completed
      progressData.isCompleted = false;
    }

    let updatedProgress;
    if (existingProgress) {
      const [updated] = await this.db
        .update(lessonProgress)
        .set(progressData as Partial<InferInsertModel<typeof lessonProgress>>)
        .where(eq(lessonProgress.id, existingProgress.id))
        .returning();
      
      updatedProgress = updated;
    } else {
      const [inserted] = await this.db
        .insert(lessonProgress)
        .values(progressData as InferInsertModel<typeof lessonProgress>)
        .returning();
      
      updatedProgress = inserted;
    }

    // Update course progress percentage
    await this.calculateAndUpdateCourseProgress(
      userId,
      enrollment.courseId,
      enrollment.enrollmentId,
    );

    // Return lesson progress status
    return {
      lessonId,
      enrollmentId: enrollment.enrollmentId,
      isCompleted: updatedProgress.isCompleted || false,
      timeSpentMinutes: updatedProgress.timeSpentMinutes || 0,
      completedAt: updatedProgress.completedAt,
      lastAccessedAt: updatedProgress.lastAccessedAt,
    };
  }

  /**
   * Get course progress for a user
   * Returns progress even if enrollment doesn't exist (returns 0% progress)
   * Progress is calculated based on ALL lessons in the course, regardless of access status
   */
  async getCourseProgress(
    userId: number,
    courseId: number,
  ): Promise<CourseProgress> {
    // Get enrollment (allow even if expired - progress should still be visible)
    const [enrollment] = await this.db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.userId, userId),
          eq(enrollments.courseId, courseId),
          eq(enrollments.isDeleted, false),
        ),
      )
      .limit(1);

    // Get total lessons count (ALL lessons, regardless of access)
    const [totalLessonsResult] = await this.db
      .select({ count: count() })
      .from(lessons)
      .innerJoin(courseSections, eq(courseSections.id, lessons.sectionId))
      .where(
        and(
          eq(courseSections.courseId, courseId),
          eq(lessons.isDeleted, false),
          eq(courseSections.isDeleted, false),
        ),
      );

    const totalLessons = totalLessonsResult?.count || 0;

    // If no enrollment exists, return 0% progress
    if (!enrollment) {
      return {
        courseId,
        enrollmentId: 0,
        progressPercentage: 0,
        completedLessons: 0,
        totalLessons,
        timeSpentMinutes: 0,
        lastAccessedAt: null,
      };
    }

    // Get completed lessons count for this specific course
    const [completedLessonsResult] = await this.db
      .select({ count: count() })
      .from(lessonProgress)
      .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
      .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
      .where(
        and(
          eq(lessonProgress.enrollmentId, enrollment.id),
          eq(lessonProgress.isCompleted, true),
          eq(lessonProgress.isDeleted, false),
          eq(courseSections.courseId, courseId),
          eq(lessons.isDeleted, false),
          eq(courseSections.isDeleted, false),
        ),
      );

    const completedLessons = completedLessonsResult?.count || 0;

    // Get total time spent for this specific course
    const [timeSpentResult] = await this.db
      .select({
        totalTime: sql<number>`COALESCE(SUM(${lessonProgress.timeSpentMinutes}), 0)`,
      })
      .from(lessonProgress)
      .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
      .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
      .where(
        and(
          eq(lessonProgress.enrollmentId, enrollment.id),
          eq(lessonProgress.isDeleted, false),
          eq(courseSections.courseId, courseId),
          eq(lessons.isDeleted, false),
          eq(courseSections.isDeleted, false),
        ),
      );

    const timeSpentMinutes = Number(timeSpentResult?.totalTime || 0);

    // Calculate progress percentage
    const progressPercentage =
      totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    return {
      courseId,
      enrollmentId: enrollment.id,
      progressPercentage: Math.round(progressPercentage * 100) / 100,
      completedLessons,
      totalLessons,
      timeSpentMinutes,
      lastAccessedAt: enrollment.lastAccessedAt,
    };
  }

  /**
   * Calculate and update course completion percentage
   */
  async calculateCompletionPercentage(
    userId: number,
    courseId: number,
  ): Promise<number> {
    const progress = await this.getCourseProgress(userId, courseId);
    return progress.progressPercentage;
  }

  /**
   * Get lesson progress for a user
   */
  async getLessonProgress(
    userId: number,
    lessonId: number,
  ): Promise<LessonProgress | null> {
    // Get enrollment
    const [enrollment] = await this.db
      .select({
        enrollmentId: enrollments.id,
      })
      .from(enrollments)
      .innerJoin(lessons, eq(lessons.id, lessonId))
      .innerJoin(courseSections, eq(courseSections.id, lessons.sectionId))
      .where(
        and(
          eq(enrollments.userId, userId),
          eq(courseSections.courseId, enrollments.courseId),
          eq(enrollments.isDeleted, false),
        ),
      )
      .limit(1);

    if (!enrollment) {
      return null;
    }

    const [progress] = await this.db
      .select()
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.enrollmentId, enrollment.enrollmentId),
          eq(lessonProgress.lessonId, lessonId),
          eq(lessonProgress.isDeleted, false),
        ),
      )
      .limit(1);

    if (!progress) {
      return {
        lessonId,
        enrollmentId: enrollment.enrollmentId,
        isCompleted: false,
        timeSpentMinutes: 0,
        completedAt: null,
        lastAccessedAt: null,
      };
    }

    return {
      lessonId,
      enrollmentId: progress.enrollmentId,
      isCompleted: progress.isCompleted,
      timeSpentMinutes: progress.timeSpentMinutes || 0,
      completedAt: progress.completedAt,
      lastAccessedAt: progress.lastAccessedAt,
    };
  }

  /**
   * Get detailed course progress including section breakdown
   * Returns progress even if enrollment doesn't exist (returns empty progress)
   * Progress is calculated based on ALL lessons in the course, regardless of access status
   */
  async getDetailedCourseProgress(
    userId: number,
    courseId: number,
  ): Promise<{
    completedQuizzes: number;
    averageQuizScore?: number;
    sectionProgress?: Record<number, { completedLessons: number; totalLessons: number }>;
  }> {
    // Get enrollment (allow even if expired - progress should still be visible)
    const [enrollment] = await this.db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.userId, userId),
          eq(enrollments.courseId, courseId),
          eq(enrollments.isDeleted, false),
        ),
      )
      .limit(1);

    // Get all sections for the course
    const allSections = await this.db
      .select()
      .from(courseSections)
      .where(
        and(
          eq(courseSections.courseId, courseId),
          eq(courseSections.isDeleted, false),
        ),
      );

    // Get all lessons for the course (ALL lessons, regardless of access)
    const allLessons = await this.db
      .select({
        id: lessons.id,
        sectionId: lessons.sectionId,
      })
      .from(lessons)
      .innerJoin(courseSections, eq(courseSections.id, lessons.sectionId))
      .where(
        and(
          eq(courseSections.courseId, courseId),
          eq(lessons.isDeleted, false),
          eq(courseSections.isDeleted, false),
        ),
      );

    // If no enrollment, return empty progress
    if (!enrollment) {
      const sectionProgress: Record<number, { completedLessons: number; totalLessons: number }> = {};
      allSections.forEach((section) => {
        const sectionLessons = allLessons.filter((l) => l.sectionId === section.id);
        sectionProgress[section.id] = {
          completedLessons: 0,
          totalLessons: sectionLessons.length,
        };
      });

      return {
        completedQuizzes: 0,
        sectionProgress,
      };
    }

    // Get completed lessons by section
    const completedLessonsData = await this.db
      .select({
        lessonId: lessonProgress.lessonId,
        sectionId: lessons.sectionId,
      })
      .from(lessonProgress)
      .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
      .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
      .where(
        and(
          eq(lessonProgress.enrollmentId, enrollment.id),
          eq(lessonProgress.isCompleted, true),
          eq(lessonProgress.isDeleted, false),
          eq(courseSections.courseId, courseId),
          eq(lessons.isDeleted, false),
          eq(courseSections.isDeleted, false),
        ),
      );

    // Calculate section progress
    const sectionProgress: Record<number, { completedLessons: number; totalLessons: number }> = {};
    allSections.forEach((section) => {
      const sectionLessons = allLessons.filter((l) => l.sectionId === section.id);
      const completedSectionLessons = completedLessonsData.filter(
        (cl) => cl.sectionId === section.id,
      ).length;

      sectionProgress[section.id] = {
        completedLessons: completedSectionLessons,
        totalLessons: sectionLessons.length,
      };
    });

    // Get completed quizzes count
    const [completedQuizzesResult] = await this.db
      .select({ count: count() })
      .from(quizAttempts)
      .innerJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
      .innerJoin(courseSections, eq(quizzes.sectionId, courseSections.id))
      .where(
        and(
          eq(courseSections.courseId, courseId),
          eq(quizAttempts.userId, userId),
          eq(quizAttempts.isDeleted, false),
          eq(courseSections.isDeleted, false),
        ),
      );

    const completedQuizzes = completedQuizzesResult?.count || 0;

    // Calculate average quiz score
    const quizScores = await this.db
      .select({
        score: quizAttempts.score,
        maxScore: quizAttempts.maxScore,
      })
      .from(quizAttempts)
      .innerJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
      .innerJoin(courseSections, eq(quizzes.sectionId, courseSections.id))
      .where(
        and(
          eq(courseSections.courseId, courseId),
          eq(quizAttempts.userId, userId),
          eq(quizAttempts.isDeleted, false),
          eq(courseSections.isDeleted, false),
        ),
      );

    let averageQuizScore: number | undefined;
    if (quizScores.length > 0) {
      const totalScore = quizScores.reduce((sum, q) => {
        const maxScore = q.maxScore ? Number(q.maxScore) : 0;
        const score = q.score ? Number(q.score) : 0;
        if (maxScore > 0) {
          return sum + (score / maxScore) * 100;
        }
        return sum;
      }, 0);
      averageQuizScore = totalScore / quizScores.length;
    }

    return {
      completedQuizzes,
      averageQuizScore,
      sectionProgress,
    };
  }

  /**
   * Calculate and update course progress in enrollment record
   */
  private async calculateAndUpdateCourseProgress(
    userId: number,
    courseId: number,
    enrollmentId: number,
  ): Promise<void> {
    const progressPercentage = await this.calculateCompletionPercentage(
      userId,
      courseId,
    );

    await this.db
      .update(enrollments)
      .set({
        progressPercentage: progressPercentage.toString(),
        lastAccessedAt: new Date(),
        updatedAt: new Date(),
      } as Partial<InferInsertModel<typeof enrollments>>)
      .where(eq(enrollments.id, enrollmentId));

    // If progress is 100%, mark as completed
    if (progressPercentage >= 100) {
      const [enrollment] = await this.db
        .select()
        .from(enrollments)
        .where(eq(enrollments.id, enrollmentId))
        .limit(1);

      if (enrollment && !enrollment.completedAt) {
        await this.db
          .update(enrollments)
          .set({
            completedAt: new Date(),
          } as Partial<InferInsertModel<typeof enrollments>>)
          .where(eq(enrollments.id, enrollmentId));
      }
    }
  }
}
