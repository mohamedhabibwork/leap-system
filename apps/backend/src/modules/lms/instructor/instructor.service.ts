import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, sql, desc, gte, count, avg, sum } from 'drizzle-orm';
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
} from '@leap-lms/database';

@Injectable()
export class InstructorService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>) {}

  async getDashboard(instructorId: number) {
    // Get total courses
    const instructorCourses = await this.db
      .select()
      .from(courses)
      .where(and(eq(courses.instructorId, instructorId), eq(courses.isDeleted, false)));

    const courseIds = instructorCourses.map((c) => c.id);

    // Get total students (unique enrollments)
    const studentCount = await this.db
      .select({ count: count() })
      .from(enrollments)
      .where(
        and(
          sql`${enrollments.courseId} IN ${courseIds.length > 0 ? sql`(${sql.join(courseIds.map((id) => sql`${id}`), sql`, `)})` : sql`(NULL)`}`,
          eq(enrollments.isDeleted, false)
        )
      );

    // Get total revenue
    const revenueResult = await this.db
      .select({ total: sum(enrollments.amountPaid) })
      .from(enrollments)
      .where(
        and(
          sql`${enrollments.courseId} IN ${courseIds.length > 0 ? sql`(${sql.join(courseIds.map((id) => sql`${id}`), sql`, `)})` : sql`(NULL)`}`,
          eq(enrollments.isDeleted, false)
        )
      );

    // Get average rating
    const ratingResult = await this.db
      .select({ avgRating: avg(courseReviews.rating) })
      .from(courseReviews)
      .where(
        and(
          sql`${courseReviews.courseId} IN ${courseIds.length > 0 ? sql`(${sql.join(courseIds.map((id) => sql`${id}`), sql`, `)})` : sql`(NULL)`}`,
          eq(courseReviews.isDeleted, false)
        )
      );

    // Get pending assignments count
    const pendingAssignmentsResult = await this.db
      .select({ count: count() })
      .from(assignmentSubmissions)
      .where(
        and(
          eq(assignmentSubmissions.isDeleted, false),
          sql`${assignmentSubmissions.gradedBy} IS NULL`
        )
      );

    // Get upcoming sessions (next 5)
    const upcomingSessions = await this.db
      .select({
        id: lessonSessions.id,
        uuid: lessonSessions.uuid,
        titleEn: lessonSessions.titleEn,
        titleAr: lessonSessions.titleAr,
        startTime: lessonSessions.startTime,
        endTime: lessonSessions.endTime,
        meetingUrl: lessonSessions.meetingUrl,
        attendanceCount: lessonSessions.attendanceCount,
      })
      .from(lessonSessions)
      .where(
        and(
          gte(lessonSessions.startTime, new Date()),
          eq(lessonSessions.isDeleted, false)
        )
      )
      .orderBy(lessonSessions.startTime)
      .limit(5);

    // Get revenue chart data (last 12 months)
    const revenueChartData = await this.getRevenueChartData(instructorId);

    // Get enrollment chart data (last 12 months)
    const enrollmentChartData = await this.getEnrollmentChartData(instructorId);

    // Get top performing courses
    const topCourses = await this.getTopPerformingCourses(instructorId);

    return {
      totalCourses: instructorCourses.length,
      totalStudents: studentCount[0]?.count || 0,
      totalRevenue: parseFloat(revenueResult[0]?.total || '0'),
      averageRating: parseFloat(ratingResult[0]?.avgRating || '0'),
      pendingAssignments: pendingAssignmentsResult[0]?.count || 0,
      upcomingSessions,
      recentActivity: [], // TODO: Implement activity tracking
      revenueChartData,
      enrollmentChartData,
      topCourses,
    };
  }

  async getRevenueChartData(instructorId: number) {
    const instructorCourses = await this.db
      .select({ id: courses.id })
      .from(courses)
      .where(and(eq(courses.instructorId, instructorId), eq(courses.isDeleted, false)));

    const courseIds = instructorCourses.map((c) => c.id);

    if (courseIds.length === 0) {
      return [];
    }

    const revenueData = await this.db
      .select({
        month: sql<string>`TO_CHAR(${enrollments.enrolledAt}, 'Mon YYYY')`,
        value: sum(enrollments.amountPaid),
      })
      .from(enrollments)
      .where(
        and(
          sql`${enrollments.courseId} IN ${sql`(${sql.join(courseIds.map((id) => sql`${id}`), sql`, `)})`}`,
          eq(enrollments.isDeleted, false),
          sql`${enrollments.enrolledAt} >= NOW() - INTERVAL '12 months'`
        )
      )
      .groupBy(sql`TO_CHAR(${enrollments.enrolledAt}, 'Mon YYYY')`)
      .orderBy(sql`MIN(${enrollments.enrolledAt})`);

    return revenueData.map((item) => ({
      month: item.month,
      value: parseFloat(item.value?.toString() || '0'),
    }));
  }

  async getEnrollmentChartData(instructorId: number) {
    const instructorCourses = await this.db
      .select({ id: courses.id })
      .from(courses)
      .where(and(eq(courses.instructorId, instructorId), eq(courses.isDeleted, false)));

    const courseIds = instructorCourses.map((c) => c.id);

    if (courseIds.length === 0) {
      return [];
    }

    const enrollmentData = await this.db
      .select({
        month: sql<string>`TO_CHAR(${enrollments.enrolledAt}, 'Mon YYYY')`,
        value: count(),
      })
      .from(enrollments)
      .where(
        and(
          sql`${enrollments.courseId} IN ${sql`(${sql.join(courseIds.map((id) => sql`${id}`), sql`, `)})`}`,
          eq(enrollments.isDeleted, false),
          sql`${enrollments.enrolledAt} >= NOW() - INTERVAL '12 months'`
        )
      )
      .groupBy(sql`TO_CHAR(${enrollments.enrolledAt}, 'Mon YYYY')`)
      .orderBy(sql`MIN(${enrollments.enrolledAt})`);

    return enrollmentData.map((item) => ({
      month: item.month,
      value: item.value || 0,
    }));
  }

  async getTopPerformingCourses(instructorId: number) {
    const instructorCourses = await this.db
      .select({
        id: courses.id,
        uuid: courses.uuid,
        titleEn: courses.titleEn,
        titleAr: courses.titleAr,
        slug: courses.slug,
        thumbnailUrl: courses.thumbnailUrl,
        price: courses.price,
        isFeatured: courses.isFeatured,
        viewCount: courses.viewCount,
        createdAt: courses.createdAt,
      })
      .from(courses)
      .where(and(eq(courses.instructorId, instructorId), eq(courses.isDeleted, false)))
      .orderBy(desc(courses.createdAt));

    // Get stats for each course and sort by revenue
    const coursesWithStats = await Promise.all(
      instructorCourses.map(async (course) => {
        const enrollmentCount = await this.db
          .select({ count: count() })
          .from(enrollments)
          .where(and(eq(enrollments.courseId, course.id), eq(enrollments.isDeleted, false)));

        const reviewStats = await this.db
          .select({ avgRating: avg(courseReviews.rating) })
          .from(courseReviews)
          .where(and(eq(courseReviews.courseId, course.id), eq(courseReviews.isDeleted, false)));

        const revenueResult = await this.db
          .select({ total: sum(enrollments.amountPaid) })
          .from(enrollments)
          .where(and(eq(enrollments.courseId, course.id), eq(enrollments.isDeleted, false)));

        // Calculate completion rate
        const totalEnrollments = enrollmentCount[0]?.count || 0;
        const completedEnrollments = await this.db
          .select({ count: count() })
          .from(enrollments)
          .where(
            and(
              eq(enrollments.courseId, course.id),
              eq(enrollments.isDeleted, false),
              sql`${enrollments.completedAt} IS NOT NULL`
            )
          );

        const completionRate = totalEnrollments > 0 
          ? (completedEnrollments[0]?.count / totalEnrollments) * 100 
          : 0;

        const revenue = parseFloat(revenueResult[0]?.total?.toString() || '0');

        return {
          courseId: course.id,
          courseName: course.titleEn,
          slug: course.slug,
          thumbnailUrl: course.thumbnailUrl,
          enrollmentCount: enrollmentCount[0]?.count || 0,
          completionRate: parseFloat(completionRate.toFixed(2)),
          averageRating: parseFloat(reviewStats[0]?.avgRating?.toString() || '0'),
          revenue,
          activeStudents: 0, // Can be calculated if needed
          isFeatured: course.isFeatured,
          viewCount: course.viewCount,
          createdAt: course.createdAt,
        };
      })
    );

    // Sort by revenue and return top 5
    return coursesWithStats
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }

  async getInstructorCourses(instructorId: number) {
    const instructorCourses = await this.db
      .select({
        id: courses.id,
        uuid: courses.uuid,
        titleEn: courses.titleEn,
        titleAr: courses.titleAr,
        slug: courses.slug,
        thumbnailUrl: courses.thumbnailUrl,
        price: courses.price,
        isFeatured: courses.isFeatured,
        viewCount: courses.viewCount,
        createdAt: courses.createdAt,
        updatedAt: courses.updatedAt,
      })
      .from(courses)
      .where(and(eq(courses.instructorId, instructorId), eq(courses.isDeleted, false)))
      .orderBy(desc(courses.createdAt));

    // Get stats for each course
    const coursesWithStats = await Promise.all(
      instructorCourses.map(async (course) => {
        const enrollmentCount = await this.db
          .select({ count: count() })
          .from(enrollments)
          .where(and(eq(enrollments.courseId, course.id), eq(enrollments.isDeleted, false)));

        const reviewStats = await this.db
          .select({ avgRating: avg(courseReviews.rating) })
          .from(courseReviews)
          .where(and(eq(courseReviews.courseId, course.id), eq(courseReviews.isDeleted, false)));

        return {
          ...course,
          enrollmentCount: enrollmentCount[0]?.count || 0,
          averageRating: parseFloat(reviewStats[0]?.avgRating || '0'),
        };
      })
    );

    return coursesWithStats;
  }

  async getCourseStudents(instructorId: number, courseId: number) {
    // Verify course belongs to instructor
    const course = await this.db
      .select()
      .from(courses)
      .where(and(eq(courses.id, courseId), eq(courses.instructorId, instructorId)))
      .limit(1);

    if (!course.length) {
      throw new NotFoundException('Course not found or access denied');
    }

    // Get enrolled students with progress
    const students = await this.db
      .select({
        userId: users.id,
        userName: users.username,
        userEmail: users.email,
        enrollmentId: enrollments.id,
        progressPercentage: enrollments.progressPercentage,
        enrolledAt: enrollments.enrolledAt,
        lastAccessedAt: enrollments.lastAccessedAt,
      })
      .from(enrollments)
      .innerJoin(users, eq(enrollments.userId, users.id))
      .where(and(eq(enrollments.courseId, courseId), eq(enrollments.isDeleted, false)))
      .orderBy(desc(enrollments.enrolledAt));

    // Get total lessons count for the course
    const lessonsCount = await this.db
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

    const totalLessons = lessonsCount[0]?.count || 0;

    // Get completed lessons for each enrollment
    const studentsWithProgress = await Promise.all(
      students.map(async (student) => {
        const completedLessons = await this.db
          .select({ count: count() })
          .from(lessonProgress)
          .where(
            and(
              eq(lessonProgress.enrollmentId, student.enrollmentId),
              eq(lessonProgress.isCompleted, true),
              eq(lessonProgress.isDeleted, false)
            )
          );

        return {
          ...student,
          completedLessons: completedLessons[0]?.count || 0,
          totalLessons,
        };
      })
    );

    return studentsWithProgress;
  }

  async getCourseAnalytics(instructorId: number, courseId: number) {
    // Verify course belongs to instructor
    const course = await this.db
      .select()
      .from(courses)
      .where(and(eq(courses.id, courseId), eq(courses.instructorId, instructorId)))
      .limit(1);

    if (!course.length) {
      throw new NotFoundException('Course not found or access denied');
    }

    // Get enrollment trend (last 12 months)
    const enrollmentTrend = await this.db
      .select({
        month: sql`DATE_TRUNC('month', ${enrollments.enrolledAt})`,
        count: count(),
      })
      .from(enrollments)
      .where(
        and(
          eq(enrollments.courseId, courseId),
          eq(enrollments.isDeleted, false),
          sql`${enrollments.enrolledAt} >= NOW() - INTERVAL '12 months'`
        )
      )
      .groupBy(sql`DATE_TRUNC('month', ${enrollments.enrolledAt})`)
      .orderBy(sql`DATE_TRUNC('month', ${enrollments.enrolledAt})`);

    // Get completion rate
    const totalEnrollments = await this.db
      .select({ count: count() })
      .from(enrollments)
      .where(and(eq(enrollments.courseId, courseId), eq(enrollments.isDeleted, false)));

    const completedEnrollments = await this.db
      .select({ count: count() })
      .from(enrollments)
      .where(
        and(
          eq(enrollments.courseId, courseId),
          eq(enrollments.isDeleted, false),
          sql`${enrollments.completedAt} IS NOT NULL`
        )
      );

    const completionRate =
      totalEnrollments[0]?.count > 0
        ? (completedEnrollments[0]?.count / totalEnrollments[0]?.count) * 100
        : 0;

    // Get rating distribution
    const ratingDistribution = await this.db
      .select({
        rating: courseReviews.rating,
        count: count(),
      })
      .from(courseReviews)
      .where(and(eq(courseReviews.courseId, courseId), eq(courseReviews.isDeleted, false)))
      .groupBy(courseReviews.rating)
      .orderBy(courseReviews.rating);

    // Get student engagement (active in last 30 days)
    const activeStudents = await this.db
      .select({ count: count() })
      .from(enrollments)
      .where(
        and(
          eq(enrollments.courseId, courseId),
          eq(enrollments.isDeleted, false),
          sql`${enrollments.lastAccessedAt} >= NOW() - INTERVAL '30 days'`
        )
      );

    const inactiveStudents =
      (totalEnrollments[0]?.count || 0) - (activeStudents[0]?.count || 0);

    return {
      courseId,
      enrollmentTrend,
      completionRate,
      averageQuizScores: [], // TODO: Implement quiz score aggregation
      studentEngagement: {
        active: activeStudents[0]?.count || 0,
        inactive: inactiveStudents,
      },
      revenueTrend: [], // TODO: Implement revenue trend
      ratingDistribution,
    };
  }

  async getUpcomingSessions(instructorId: number) {
    // Get all course IDs for the instructor
    const instructorCourses = await this.db
      .select({ id: courses.id })
      .from(courses)
      .where(and(eq(courses.instructorId, instructorId), eq(courses.isDeleted, false)));

    const courseIds = instructorCourses.map((c) => c.id);

    if (courseIds.length === 0) {
      return [];
    }

    // Get upcoming sessions for instructor's courses
    const sessions = await this.db
      .select({
        id: lessonSessions.id,
        uuid: lessonSessions.uuid,
        titleEn: lessonSessions.titleEn,
        titleAr: lessonSessions.titleAr,
        startTime: lessonSessions.startTime,
        endTime: lessonSessions.endTime,
        meetingUrl: lessonSessions.meetingUrl,
        attendanceCount: lessonSessions.attendanceCount,
        lessonId: lessons.id,
        lessonTitle: lessons.titleEn,
        courseId: courses.id,
        courseName: courses.titleEn,
      })
      .from(lessonSessions)
      .innerJoin(lessons, eq(lessonSessions.lessonId, lessons.id))
      .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
      .innerJoin(courses, eq(courseSections.courseId, courses.id))
      .where(
        and(
          sql`${courses.id} IN ${sql`(${sql.join(courseIds.map((id) => sql`${id}`), sql`, `)})`}`,
          gte(lessonSessions.startTime, new Date()),
          eq(lessonSessions.isDeleted, false)
        )
      )
      .orderBy(lessonSessions.startTime)
      .limit(20);

    return sessions;
  }

  async getCalendarSessions(
    instructorId: number,
    startDate?: Date,
    endDate?: Date
  ) {
    // Get all course IDs for the instructor
    const instructorCourses = await this.db
      .select({ id: courses.id })
      .from(courses)
      .where(and(eq(courses.instructorId, instructorId), eq(courses.isDeleted, false)));

    const courseIds = instructorCourses.map((c) => c.id);

    if (courseIds.length === 0) {
      return [];
    }

    // Build date filter
    const dateFilters = [
      sql`${courses.id} IN ${sql`(${sql.join(courseIds.map((id) => sql`${id}`), sql`, `)})`}`,
      eq(lessonSessions.isDeleted, false),
    ];

    if (startDate) {
      dateFilters.push(gte(lessonSessions.startTime, startDate));
    }
    if (endDate) {
      dateFilters.push(sql`${lessonSessions.startTime} <= ${endDate}`);
    }

    // Get sessions for calendar view
    const sessions = await this.db
      .select({
        id: lessonSessions.id,
        uuid: lessonSessions.uuid,
        titleEn: lessonSessions.titleEn,
        titleAr: lessonSessions.titleAr,
        startTime: lessonSessions.startTime,
        endTime: lessonSessions.endTime,
        timezone: lessonSessions.timezone,
        meetingUrl: lessonSessions.meetingUrl,
        attendanceCount: lessonSessions.attendanceCount,
        maxAttendees: lessonSessions.maxAttendees,
        lessonId: lessons.id,
        lessonTitle: lessons.titleEn,
        courseId: courses.id,
        courseName: courses.titleEn,
      })
      .from(lessonSessions)
      .innerJoin(lessons, eq(lessonSessions.lessonId, lessons.id))
      .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
      .innerJoin(courses, eq(courseSections.courseId, courses.id))
      .where(and(...dateFilters))
      .orderBy(lessonSessions.startTime);

    return sessions;
  }

  async getPendingAssignments(instructorId: number) {
    // Get all course IDs for the instructor
    const instructorCourses = await this.db
      .select({ id: courses.id })
      .from(courses)
      .where(and(eq(courses.instructorId, instructorId), eq(courses.isDeleted, false)));

    const courseIds = instructorCourses.map((c) => c.id);

    if (courseIds.length === 0) {
      return [];
    }

    // Get pending submissions (not graded yet)
    const pendingSubmissions = await this.db
      .select()
      .from(assignmentSubmissions)
      .where(
        and(
          eq(assignmentSubmissions.isDeleted, false),
          sql`${assignmentSubmissions.gradedBy} IS NULL`
        )
      )
      .orderBy(desc(assignmentSubmissions.submittedAt))
      .limit(50);

    return pendingSubmissions;
  }

  async getQuizAttempts(instructorId: number) {
    // Get all course IDs for the instructor
    const instructorCourses = await this.db
      .select({ id: courses.id })
      .from(courses)
      .where(and(eq(courses.instructorId, instructorId), eq(courses.isDeleted, false)));

    const courseIds = instructorCourses.map((c) => c.id);

    if (courseIds.length === 0) {
      return [];
    }

    // Get recent quiz attempts
    const attempts = await this.db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.isDeleted, false))
      .orderBy(desc(quizAttempts.completedAt))
      .limit(50);

    return attempts;
  }
}
