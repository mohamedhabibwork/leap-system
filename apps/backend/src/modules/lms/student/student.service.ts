import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, sql, desc, count, avg, sum, inArray, gte, lte, isNull, or, ne } from 'drizzle-orm';
import {
  courses,
  enrollments,
  users,
  courseReviews,
  assignmentSubmissions,
  lessonSessions,
  courseSections,
  lessons,
  lessonProgress,
  quizAttempts,
  quizzes,
  assignments,
  courseCategories,
  certificates,
  quizQuestions,
} from '@leap-lms/database';

@Injectable()
export class StudentService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>) {}

  async getDashboard(userId: number) {
    // Get total enrolled courses
    const enrolledCourses = await this.db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.userId, userId), eq(enrollments.isDeleted, false)));

    const totalEnrolled = enrolledCourses.length;

    // Count completed courses
    const completedCourses = enrolledCourses.filter((e) => e.completedAt !== null).length;

    // Count courses in progress (not completed but accessed recently or have progress)
    const coursesInProgress = enrolledCourses.filter(
      (e) => e.completedAt === null && parseFloat(e.progressPercentage?.toString() || '0') > 0
    ).length;

    // Calculate overall progress
    const totalProgress = enrolledCourses.reduce(
      (sum, e) => sum + parseFloat(e.progressPercentage?.toString() || '0'),
      0
    );
    const overallProgress = totalEnrolled > 0 ? totalProgress / totalEnrolled : 0;

    // Get upcoming sessions
    const enrollmentIds = enrolledCourses.map((e) => e.id);
    const courseIds = enrolledCourses.map((e) => e.courseId);

    let upcomingSessions: any[] = [];
    if (courseIds.length > 0) {
      upcomingSessions = await this.db
        .select({
          id: lessonSessions.id,
          uuid: lessonSessions.uuid,
          titleEn: lessonSessions.titleEn,
          titleAr: lessonSessions.titleAr,
          startTime: lessonSessions.startTime,
          endTime: lessonSessions.endTime,
          meetingUrl: lessonSessions.meetingUrl,
          courseName: courses.titleEn,
          courseId: courses.id,
        })
        .from(lessonSessions)
        .innerJoin(lessons, eq(lessonSessions.lessonId, lessons.id))
        .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
        .innerJoin(courses, eq(courseSections.courseId, courses.id))
        .where(
          and(
            inArray(courses.id, courseIds),
            gte(lessonSessions.startTime, new Date()),
            eq(lessonSessions.isDeleted, false)
          )
        )
        .orderBy(lessonSessions.startTime)
        .limit(5);
    }

    // Get pending assignments
    let pendingAssignmentsCount = 0;
    if (enrollmentIds.length > 0) {
      // Get all assignments for enrolled courses
      const allAssignments = await this.db
        .select({
          assignmentId: assignments.id,
          courseId: courses.id,
        })
        .from(assignments)
        .innerJoin(courseSections, eq(assignments.sectionId, courseSections.id))
        .innerJoin(courses, eq(courseSections.courseId, courses.id))
        .where(
          and(
            inArray(courses.id, courseIds),
            eq(assignments.isDeleted, false),
            eq(courseSections.isDeleted, false)
          )
        );

      const assignmentIds = allAssignments.map((a) => a.assignmentId);

      if (assignmentIds.length > 0) {
        // Get submitted assignments
        const submitted = await this.db
          .select({ assignmentId: assignmentSubmissions.assignmentId })
          .from(assignmentSubmissions)
          .where(
            and(
              eq(assignmentSubmissions.userId, userId),
              inArray(assignmentSubmissions.assignmentId, assignmentIds),
              eq(assignmentSubmissions.isDeleted, false)
            )
          );

        const submittedIds = submitted.map((s) => s.assignmentId);
        pendingAssignmentsCount = assignmentIds.filter((id) => !submittedIds.includes(id)).length;
      }
    }

    // Get pending quizzes
    let pendingQuizzesCount = 0;
    if (courseIds.length > 0) {
      const allQuizzes = await this.db
        .select({
          quizId: quizzes.id,
          maxAttempts: quizzes.maxAttempts,
        })
        .from(quizzes)
        .innerJoin(courseSections, eq(quizzes.sectionId, courseSections.id))
        .innerJoin(courses, eq(courseSections.courseId, courses.id))
        .where(
          and(
            inArray(courses.id, courseIds),
            eq(quizzes.isDeleted, false),
            eq(courseSections.isDeleted, false)
          )
        );

      for (const quiz of allQuizzes) {
        const attempts = await this.db
          .select({ count: count() })
          .from(quizAttempts)
          .where(
            and(
              eq(quizAttempts.quizId, quiz.quizId),
              eq(quizAttempts.userId, userId),
              eq(quizAttempts.isDeleted, false)
            )
          );

        const attemptCount = attempts[0]?.count || 0;
        if (!quiz.maxAttempts || attemptCount < quiz.maxAttempts) {
          pendingQuizzesCount++;
        }
      }
    }

    // Get recent activity
    const recentActivity = await this.getRecentActivity(userId, enrollmentIds);

    // Calculate learning streak
    const learningStreak = await this.calculateLearningStreak(userId);

    // Count certificates through enrollments
    const certificatesEarned = await this.db
      .select({ count: count() })
      .from(certificates)
      .innerJoin(enrollments, eq(certificates.enrollmentId, enrollments.id))
      .where(and(eq(enrollments.userId, userId), eq(certificates.isDeleted, false)));

    return {
      totalEnrolledCourses: totalEnrolled,
      coursesInProgress,
      completedCourses,
      overallProgress: parseFloat(overallProgress.toFixed(2)),
      upcomingSessions,
      pendingAssignments: pendingAssignmentsCount,
      pendingQuizzes: pendingQuizzesCount,
      recentActivity,
      learningStreak,
      certificatesEarned: certificatesEarned[0]?.count || 0,
    };
  }

  async getMyCourses(userId: number) {
    const userEnrollments = await this.db
      .select({
        enrollmentId: enrollments.id,
        courseId: courses.id,
        courseName: courses.titleEn,
        thumbnailUrl: courses.thumbnailUrl,
        instructorId: courses.instructorId,
        progressPercentage: enrollments.progressPercentage,
        lastAccessedAt: enrollments.lastAccessedAt,
        expiresAt: enrollments.expiresAt,
        completedAt: enrollments.completedAt,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(and(eq(enrollments.userId, userId), eq(enrollments.isDeleted, false)))
      .orderBy(desc(enrollments.lastAccessedAt));

    // Get instructor names and lesson info for each course
    const coursesWithDetails = await Promise.all(
      userEnrollments.map(async (enrollment) => {
        // Get instructor name
        const instructor = await this.db
          .select({ username: users.username })
          .from(users)
          .where(eq(users.id, enrollment.instructorId))
          .limit(1);

        // Get total lessons count
        const lessonsCount = await this.db
          .select({ count: count() })
          .from(lessons)
          .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
          .where(
            and(
              eq(courseSections.courseId, enrollment.courseId),
              eq(lessons.isDeleted, false),
              eq(courseSections.isDeleted, false)
            )
          );

        // Get completed lessons count
        const completedLessons = await this.db
          .select({ count: count() })
          .from(lessonProgress)
          .where(
            and(
              eq(lessonProgress.enrollmentId, enrollment.enrollmentId),
              eq(lessonProgress.isCompleted, true),
              eq(lessonProgress.isDeleted, false)
            )
          );

        // Get next lesson
        const allLessons = await this.db
          .select({
            id: lessons.id,
            title: lessons.titleEn,
            displayOrder: lessons.displayOrder,
          })
          .from(lessons)
          .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
          .where(
            and(
              eq(courseSections.courseId, enrollment.courseId),
              eq(lessons.isDeleted, false),
              eq(courseSections.isDeleted, false)
            )
          )
          .orderBy(courseSections.displayOrder, lessons.displayOrder);

        const completedLessonIds = await this.db
          .select({ lessonId: lessonProgress.lessonId })
          .from(lessonProgress)
          .where(
            and(
              eq(lessonProgress.enrollmentId, enrollment.enrollmentId),
              eq(lessonProgress.isCompleted, true),
              eq(lessonProgress.isDeleted, false)
            )
          );

        const completedIds = completedLessonIds.map((l) => l.lessonId);
        const nextLesson = allLessons.find((l) => !completedIds.includes(l.id));

        // Calculate enrollment expiry
        let enrollmentExpiry = undefined;
        if (enrollment.expiresAt) {
          const daysRemaining = Math.ceil(
            (new Date(enrollment.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );
          enrollmentExpiry = {
            expiresAt: enrollment.expiresAt,
            daysRemaining: Math.max(0, daysRemaining),
            isExpired: daysRemaining <= 0,
          };
        }

        return {
          courseId: enrollment.courseId,
          courseName: enrollment.courseName,
          thumbnailUrl: enrollment.thumbnailUrl,
          instructorName: instructor[0]?.username || 'Unknown',
          progressPercentage: parseFloat(enrollment.progressPercentage?.toString() || '0'),
          lastAccessedAt: enrollment.lastAccessedAt,
          nextLesson: nextLesson
            ? {
                id: nextLesson.id,
                title: nextLesson.title,
              }
            : undefined,
          enrollmentExpiry,
          enrollmentId: enrollment.enrollmentId,
          completedLessons: completedLessons[0]?.count || 0,
          totalLessons: lessonsCount[0]?.count || 0,
        };
      })
    );

    return coursesWithDetails;
  }

  async getPendingAssignments(userId: number) {
    // Get all enrolled courses
    const enrolledCourses = await this.db
      .select({ courseId: enrollments.courseId })
      .from(enrollments)
      .where(and(eq(enrollments.userId, userId), eq(enrollments.isDeleted, false)));

    const courseIds = enrolledCourses.map((e) => e.courseId);

    if (courseIds.length === 0) {
      return [];
    }

    // Get all assignments for enrolled courses
    const allAssignments = await this.db
      .select({
        id: assignments.id,
        titleEn: assignments.titleEn,
        dueDate: assignments.dueDate,
        maxPoints: assignments.maxPoints,
        courseId: courses.id,
        courseName: courses.titleEn,
      })
      .from(assignments)
      .innerJoin(courseSections, eq(assignments.sectionId, courseSections.id))
      .innerJoin(courses, eq(courseSections.courseId, courses.id))
      .where(
        and(
          inArray(courses.id, courseIds),
          eq(assignments.isDeleted, false),
          eq(courseSections.isDeleted, false)
        )
      );

    // Filter out submitted assignments
    const pendingAssignments = [];
    for (const assignment of allAssignments) {
      const submissions = await this.db
        .select()
        .from(assignmentSubmissions)
        .where(
          and(
            eq(assignmentSubmissions.assignmentId, assignment.id),
            eq(assignmentSubmissions.userId, userId),
            eq(assignmentSubmissions.isDeleted, false)
          )
        )
        .limit(1);

      if (submissions.length === 0) {
        pendingAssignments.push({
          id: assignment.id,
          assignmentId: assignment.id,
          assignmentTitle: assignment.titleEn,
          courseId: assignment.courseId,
          courseName: assignment.courseName,
          dueDate: assignment.dueDate,
          status: 'not_started' as const,
          maxPoints: assignment.maxPoints || 100,
        });
      }
    }

    return pendingAssignments;
  }

  async getPendingQuizzes(userId: number) {
    // Get all enrolled courses
    const enrolledCourses = await this.db
      .select({ courseId: enrollments.courseId })
      .from(enrollments)
      .where(and(eq(enrollments.userId, userId), eq(enrollments.isDeleted, false)));

    const courseIds = enrolledCourses.map((e) => e.courseId);

    if (courseIds.length === 0) {
      return [];
    }

    // Get all quizzes for enrolled courses
    const allQuizzes = await this.db
      .select({
        id: quizzes.id,
        titleEn: quizzes.titleEn,
        maxAttempts: quizzes.maxAttempts,
        availableUntil: quizzes.availableUntil,
        courseId: courses.id,
        courseName: courses.titleEn,
      })
      .from(quizzes)
      .innerJoin(courseSections, eq(quizzes.sectionId, courseSections.id))
      .innerJoin(courses, eq(courseSections.courseId, courses.id))
      .where(
        and(
          inArray(courses.id, courseIds),
          eq(quizzes.isDeleted, false),
          eq(courseSections.isDeleted, false)
        )
      );

    // Filter based on attempts
    const pendingQuizzes = [];
    for (const quiz of allQuizzes) {
      const attempts = await this.db
        .select({ count: count() })
        .from(quizAttempts)
        .where(
          and(
            eq(quizAttempts.quizId, quiz.id),
            eq(quizAttempts.userId, userId),
            eq(quizAttempts.isDeleted, false)
          )
        );

      const attemptCount = attempts[0]?.count || 0;
      const maxAttempts = quiz.maxAttempts || 999;

      if (attemptCount < maxAttempts) {
        // Get total questions count
        const questionsCount = await this.db
          .select({ count: count() })
          .from(quizQuestions)
          .where(and(eq(quizQuestions.quizId, quiz.id), eq(quizQuestions.isDeleted, false)));

        pendingQuizzes.push({
          id: quiz.id,
          quizId: quiz.id,
          quizTitle: quiz.titleEn,
          courseId: quiz.courseId,
          courseName: quiz.courseName,
          dueDate: quiz.availableUntil,
          attemptsRemaining: maxAttempts - attemptCount,
          maxAttempts,
          totalQuestions: questionsCount[0]?.count || 0,
        });
      }
    }

    return pendingQuizzes;
  }

  async getCourseProgress(userId: number, courseId: number) {
    // Verify enrollment
    const enrollment = await this.db
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

    if (!enrollment.length) {
      throw new NotFoundException('Enrollment not found');
    }

    const enrollmentId = enrollment[0].id;

    // Get completed lessons
    const completedLessons = await this.db
      .select({ lessonId: lessonProgress.lessonId })
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.enrollmentId, enrollmentId),
          eq(lessonProgress.isCompleted, true),
          eq(lessonProgress.isDeleted, false)
        )
      );

    // Get total lessons
    const totalLessons = await this.db
      .select({ count: count() })
      .from(lessons)
      .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
      .where(
        and(
          eq(courseSections.courseId, courseId),
          eq(lessons.isDeleted, false),
          eq(courseSections.isDeleted, false)
        )
      );

    // Get quiz scores
    const quizScores = await this.db
      .select({
        quizId: quizAttempts.quizId,
        score: quizAttempts.score,
        maxScore: quizAttempts.maxScore,
        completedAt: quizAttempts.completedAt,
      })
      .from(quizAttempts)
      .innerJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
      .innerJoin(courseSections, eq(quizzes.sectionId, courseSections.id))
      .where(
        and(
          eq(courseSections.courseId, courseId),
          eq(quizAttempts.userId, userId),
          eq(quizAttempts.isDeleted, false)
        )
      );

    // Get assignment scores
    const assignmentScores = await this.db
      .select({
        assignmentId: assignmentSubmissions.assignmentId,
        score: assignmentSubmissions.score,
        maxPoints: assignmentSubmissions.maxPoints,
        submittedAt: assignmentSubmissions.submittedAt,
      })
      .from(assignmentSubmissions)
      .innerJoin(assignments, eq(assignmentSubmissions.assignmentId, assignments.id))
      .innerJoin(courseSections, eq(assignments.sectionId, courseSections.id))
      .where(
        and(
          eq(courseSections.courseId, courseId),
          eq(assignmentSubmissions.userId, userId),
          eq(assignmentSubmissions.isDeleted, false)
        )
      );

    // Get time spent
    const timeSpent = await this.db
      .select({ total: sum(lessonProgress.timeSpentMinutes) })
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.enrollmentId, enrollmentId),
          eq(lessonProgress.isDeleted, false)
        )
      );

    return {
      courseId,
      completedLessons: completedLessons.map((l) => l.lessonId),
      totalLessons: totalLessons[0]?.count || 0,
      quizScores,
      assignmentScores,
      timeSpentMinutes: parseInt(timeSpent[0]?.total?.toString() || '0'),
      nextSteps: [], // Can be enhanced with actual next steps logic
    };
  }

  async getRecommendations(userId: number) {
    // Get enrolled courses and their categories
    const enrolledCourses = await this.db
      .select({
        courseId: courses.id,
        categoryId: courses.categoryId,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(and(eq(enrollments.userId, userId), eq(enrollments.isDeleted, false)));

    const enrolledCourseIds = enrolledCourses.map((e) => e.courseId);
    const categoryIds = [...new Set(enrolledCourses.map((e) => e.categoryId).filter(Boolean))];

    // Get recommended courses (not enrolled, same categories, high ratings)
    const recommended = await this.db
      .select({
        courseId: courses.id,
        courseName: courses.titleEn,
        thumbnailUrl: courses.thumbnailUrl,
        instructorId: courses.instructorId,
        categoryId: courses.categoryId,
        price: courses.price,
        viewCount: courses.viewCount,
      })
      .from(courses)
      .where(
        and(
          eq(courses.isDeleted, false),
          ne(courses.id, enrolledCourseIds.length > 0 ? enrolledCourseIds[0] : -1) // Exclude enrolled
        )
      )
      .orderBy(desc(courses.viewCount))
      .limit(20);

    // Filter out all enrolled courses
    const filtered = recommended.filter((c) => !enrolledCourseIds.includes(c.courseId));

    // Get instructor names and ratings
    const recommendations = await Promise.all(
      filtered.slice(0, 10).map(async (course) => {
        const instructor = await this.db
          .select({ username: users.username })
          .from(users)
          .where(eq(users.id, course.instructorId))
          .limit(1);

        const ratingResult = await this.db
          .select({ avgRating: avg(courseReviews.rating) })
          .from(courseReviews)
          .where(and(eq(courseReviews.courseId, course.courseId), eq(courseReviews.isDeleted, false)));

        const enrollmentCount = await this.db
          .select({ count: count() })
          .from(enrollments)
          .where(and(eq(enrollments.courseId, course.courseId), eq(enrollments.isDeleted, false)));

        const category = course.categoryId
          ? await this.db
              .select({ nameEn: courseCategories.nameEn })
              .from(courseCategories)
              .where(eq(courseCategories.id, course.categoryId))
              .limit(1)
          : [];

        let reason: 'similar_category' | 'popular' | 'trending' | 'instructor' = 'popular';
        if (course.categoryId && categoryIds.includes(course.categoryId)) {
          reason = 'similar_category';
        } else if ((course.viewCount || 0) > 1000) {
          reason = 'trending';
        }

        return {
          courseId: course.courseId,
          courseName: course.courseName,
          thumbnailUrl: course.thumbnailUrl,
          instructorName: instructor[0]?.username || 'Unknown',
          rating: parseFloat(ratingResult[0]?.avgRating?.toString() || '0'),
          enrollmentCount: enrollmentCount[0]?.count || 0,
          reason,
          price: course.price ? parseFloat(course.price.toString()) : undefined,
          categoryName: category[0]?.nameEn,
        };
      })
    );

    return recommendations;
  }

  async getAchievements(userId: number) {
    // Get certificates through enrollments
    const userCertificates = await this.db
      .select({
        id: certificates.id,
        enrollmentId: certificates.enrollmentId,
        courseId: enrollments.courseId,
        courseName: courses.titleEn,
        issuedDate: certificates.issuedDate,
        fileUrl: certificates.fileUrl,
        downloadUrl: certificates.downloadUrl,
        certificateNumber: certificates.certificateNumber,
      })
      .from(certificates)
      .innerJoin(enrollments, eq(certificates.enrollmentId, enrollments.id))
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(and(eq(enrollments.userId, userId), eq(certificates.isDeleted, false)))
      .orderBy(desc(certificates.issuedDate));

    return userCertificates.map((cert) => ({
      id: cert.id,
      courseId: cert.courseId,
      courseName: cert.courseName,
      completedAt: cert.issuedDate || new Date(),
      certificateUrl: cert.fileUrl || cert.downloadUrl,
      certificateCode: cert.certificateNumber,
    }));
  }

  async getLearningStats(userId: number) {
    // Get all enrollments
    const enrolledCourses = await this.db
      .select({ enrollmentId: enrollments.id })
      .from(enrollments)
      .where(and(eq(enrollments.userId, userId), eq(enrollments.isDeleted, false)));

    const enrollmentIds = enrolledCourses.map((e) => e.enrollmentId);

    if (enrollmentIds.length === 0) {
      return {
        totalLearningTimeMinutes: 0,
        averageQuizScore: 0,
        courseCompletionRate: 0,
        learningStreak: 0,
        mostActiveDayOfWeek: 'Monday',
        lessonsCompletedThisWeek: 0,
        lessonsCompletedThisMonth: 0,
      };
    }

    // Total learning time
    const timeResult = await this.db
      .select({ total: sum(lessonProgress.timeSpentMinutes) })
      .from(lessonProgress)
      .where(
        and(
          inArray(lessonProgress.enrollmentId, enrollmentIds),
          eq(lessonProgress.isDeleted, false)
        )
      );

    // Average quiz score
    const quizScoreResult = await this.db
      .select({ avgScore: avg(quizAttempts.score) })
      .from(quizAttempts)
      .where(and(eq(quizAttempts.userId, userId), eq(quizAttempts.isDeleted, false)));

    // Course completion rate
    const totalCourses = enrolledCourses.length;
    const completedCoursesResult = await this.db
      .select({ count: count() })
      .from(enrollments)
      .where(
        and(
          eq(enrollments.userId, userId),
          eq(enrollments.isDeleted, false),
          sql`${enrollments.completedAt} IS NOT NULL`
        )
      );

    const completionRate =
      totalCourses > 0 ? (completedCoursesResult[0]?.count / totalCourses) * 100 : 0;

    // Learning streak
    const learningStreak = await this.calculateLearningStreak(userId);

    // Lessons completed this week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const lessonsThisWeek = await this.db
      .select({ count: count() })
      .from(lessonProgress)
      .where(
        and(
          inArray(lessonProgress.enrollmentId, enrollmentIds),
          eq(lessonProgress.isCompleted, true),
          gte(lessonProgress.completedAt, weekStart),
          eq(lessonProgress.isDeleted, false)
        )
      );

    // Lessons completed this month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const lessonsThisMonth = await this.db
      .select({ count: count() })
      .from(lessonProgress)
      .where(
        and(
          inArray(lessonProgress.enrollmentId, enrollmentIds),
          eq(lessonProgress.isCompleted, true),
          gte(lessonProgress.completedAt, monthStart),
          eq(lessonProgress.isDeleted, false)
        )
      );

    // Most active day of week (simplified)
    const mostActiveDayOfWeek = 'Monday'; // TODO: Implement actual calculation

    return {
      totalLearningTimeMinutes: parseInt(timeResult[0]?.total?.toString() || '0'),
      averageQuizScore: parseFloat(quizScoreResult[0]?.avgScore?.toString() || '0'),
      courseCompletionRate: parseFloat(completionRate.toFixed(2)),
      learningStreak,
      mostActiveDayOfWeek,
      lessonsCompletedThisWeek: lessonsThisWeek[0]?.count || 0,
      lessonsCompletedThisMonth: lessonsThisMonth[0]?.count || 0,
    };
  }

  private async getRecentActivity(userId: number, enrollmentIds: number[]): Promise<any[]> {
    const activities: any[] = [];

    if (enrollmentIds.length === 0) {
      return activities;
    }

    // Get recent lesson completions
    const recentLessons = await this.db
      .select({
        lessonId: lessonProgress.lessonId,
        completedAt: lessonProgress.completedAt,
        lessonTitle: lessons.titleEn,
        courseId: courses.id,
        courseName: courses.titleEn,
      })
      .from(lessonProgress)
      .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
      .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
      .innerJoin(courses, eq(courseSections.courseId, courses.id))
      .where(
        and(
          inArray(lessonProgress.enrollmentId, enrollmentIds),
          eq(lessonProgress.isCompleted, true),
          eq(lessonProgress.isDeleted, false)
        )
      )
      .orderBy(desc(lessonProgress.completedAt))
      .limit(5);

    for (const lesson of recentLessons) {
      if (lesson.completedAt) {
        activities.push({
          id: `lesson-${lesson.lessonId}`,
          type: 'lesson_completed' as const,
          title: 'Lesson Completed',
          description: `Completed "${lesson.lessonTitle}"`,
          timestamp: lesson.completedAt,
          courseId: lesson.courseId,
          courseName: lesson.courseName,
        });
      }
    }

    // Get recent quiz passes
    const recentQuizzes = await this.db
      .select({
        attemptId: quizAttempts.id,
        completedAt: quizAttempts.completedAt,
        quizTitle: quizzes.titleEn,
        isPassed: quizAttempts.isPassed,
        courseId: courses.id,
        courseName: courses.titleEn,
      })
      .from(quizAttempts)
      .innerJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
      .innerJoin(courseSections, eq(quizzes.sectionId, courseSections.id))
      .innerJoin(courses, eq(courseSections.courseId, courses.id))
      .where(
        and(
          eq(quizAttempts.userId, userId),
          eq(quizAttempts.isPassed, true),
          eq(quizAttempts.isDeleted, false)
        )
      )
      .orderBy(desc(quizAttempts.completedAt))
      .limit(3);

    for (const quiz of recentQuizzes) {
      if (quiz.completedAt) {
        activities.push({
          id: `quiz-${quiz.attemptId}`,
          type: 'quiz_passed' as const,
          title: 'Quiz Passed',
          description: `Passed "${quiz.quizTitle}"`,
          timestamp: quiz.completedAt,
          courseId: quiz.courseId,
          courseName: quiz.courseName,
        });
      }
    }

    // Sort by timestamp and return top 10
    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);
  }

  private async calculateLearningStreak(userId: number): Promise<number> {
    // Get all lesson completion dates
    const enrollmentIds = await this.db
      .select({ id: enrollments.id })
      .from(enrollments)
      .where(and(eq(enrollments.userId, userId), eq(enrollments.isDeleted, false)));

    if (enrollmentIds.length === 0) {
      return 0;
    }

    const completions = await this.db
      .select({
        completedAt: sql<Date>`DATE(${lessonProgress.completedAt})`,
      })
      .from(lessonProgress)
      .where(
        and(
          inArray(
            lessonProgress.enrollmentId,
            enrollmentIds.map((e) => e.id)
          ),
          eq(lessonProgress.isCompleted, true),
          sql`${lessonProgress.completedAt} IS NOT NULL`,
          eq(lessonProgress.isDeleted, false)
        )
      )
      .groupBy(sql`DATE(${lessonProgress.completedAt})`)
      .orderBy(desc(sql`DATE(${lessonProgress.completedAt})`));

    if (completions.length === 0) {
      return 0;
    }

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < completions.length; i++) {
      const completionDate = new Date(completions[i].completedAt);
      completionDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((today.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }
}
