import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { eq, and, sql, gte, lte, desc } from 'drizzle-orm';
import { 
  users, 
  courses, 
  events, 
  jobs, 
  enrollments, 
  paymentHistory,
  subscriptions 
} from '@leap-lms/database';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class AdminService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase,
  ) {}

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get total users
    const [totalUsersResult] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.isDeleted, false));

    const totalUsers = Number(totalUsersResult?.count || 0);

    // Get users created last month
    const [lastMonthUsersResult] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(
        and(
          eq(users.isDeleted, false),
          gte(users.createdAt, lastMonth),
          lte(users.createdAt, thisMonth)
        )
      );

    const lastMonthUsers = Number(lastMonthUsersResult?.count || 0);
    const userGrowthPercent = totalUsers > 0 
      ? ((lastMonthUsers / totalUsers) * 100).toFixed(1)
      : '0';

    // Get active courses
    const [activeCoursesResult] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(courses)
      .where(eq(courses.isDeleted, false));

    const activeCourses = Number(activeCoursesResult?.count || 0);

    // Get courses created last month
    const [lastMonthCoursesResult] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(courses)
      .where(
        and(
          eq(courses.isDeleted, false),
          gte(courses.createdAt, lastMonth),
          lte(courses.createdAt, thisMonth)
        )
      );

    const lastMonthCourses = Number(lastMonthCoursesResult?.count || 0);
    const courseGrowthPercent = activeCourses > 0
      ? ((lastMonthCourses / activeCourses) * 100).toFixed(1)
      : '0';

    // Get total events
    const [totalEventsResult] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(events)
      .where(eq(events.isDeleted, false));

    const totalEvents = Number(totalEventsResult?.count || 0);

    // Get events created last month
    const [lastMonthEventsResult] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(events)
      .where(
        and(
          eq(events.isDeleted, false),
          gte(events.createdAt, lastMonth),
          lte(events.createdAt, thisMonth)
        )
      );

    const lastMonthEvents = Number(lastMonthEventsResult?.count || 0);
    const eventGrowthPercent = totalEvents > 0
      ? ((lastMonthEvents / totalEvents) * 100).toFixed(1)
      : '0';

    // Get job listings
    const [jobListingsResult] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(jobs)
      .where(eq(jobs.isDeleted, false));

    const jobListings = Number(jobListingsResult?.count || 0);

    // Get jobs created last month
    const [lastMonthJobsResult] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(jobs)
      .where(
        and(
          eq(jobs.isDeleted, false),
          gte(jobs.createdAt, lastMonth),
          lte(jobs.createdAt, thisMonth)
        )
      );

    const lastMonthJobs = Number(lastMonthJobsResult?.count || 0);
    const jobGrowthPercent = jobListings > 0
      ? ((lastMonthJobs / jobListings) * 100).toFixed(1)
      : '0';

    return {
      totalUsers,
      userGrowthPercent: parseFloat(userGrowthPercent),
      activeCourses,
      courseGrowthPercent: parseFloat(courseGrowthPercent),
      totalEvents,
      eventGrowthPercent: parseFloat(eventGrowthPercent),
      jobListings,
      jobGrowthPercent: parseFloat(jobGrowthPercent),
    };
  }

  /**
   * Get system analytics
   */
  async getSystemAnalytics(startDate?: Date, endDate?: Date) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get enrollment by category (simplified - using course categories)
    const enrollmentByCategory = await this.db
      .select({
        category: courses.categoryId,
        count: sql<number>`count(${enrollments.id})`,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(
        and(
          eq(enrollments.isDeleted, false),
          gte(enrollments.enrolledAt, start),
          lte(enrollments.enrolledAt, end)
        )
      )
      .groupBy(courses.categoryId);

    // Get recent activity (simplified)
    const recentActivity = [];

    return {
      chartData: [],
      enrollmentByCategory: enrollmentByCategory.map(item => ({
        category: item.category,
        count: Number(item.count),
      })),
      recentActivity,
    };
  }

  /**
   * Get user growth analytics
   */
  async getUserGrowthAnalytics(startDate?: Date, endDate?: Date, preset?: string) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get user registrations grouped by date
    const userRegistrations = await this.db
      .select({
        date: sql<string>`DATE(${users.createdAt})`,
        count: sql<number>`count(*)`,
      })
      .from(users)
      .where(
        and(
          eq(users.isDeleted, false),
          gte(users.createdAt, start),
          lte(users.createdAt, end)
        )
      )
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`);

    const chartData = userRegistrations.map(item => ({
      date: item.date,
      users: Number(item.count),
    }));

    return {
      chartData,
      preset: preset || 'month',
    };
  }

  /**
   * Get engagement metrics
   */
  async getEngagementMetrics(startDate?: Date, endDate?: Date, preset?: string) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get active enrollments
    const [activeEnrollmentsResult] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(enrollments)
      .where(
        and(
          eq(enrollments.isDeleted, false),
          gte(enrollments.lastAccessedAt || enrollments.enrolledAt, start),
          lte(enrollments.lastAccessedAt || enrollments.enrolledAt, end)
        )
      );

    const activeEnrollments = Number(activeEnrollmentsResult?.count || 0);

    // Get course completions
    const [completionsResult] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(enrollments)
      .where(
        and(
          eq(enrollments.isDeleted, false),
          sql`${enrollments.completedAt} IS NOT NULL`,
          gte(enrollments.completedAt, start),
          lte(enrollments.completedAt, end)
        )
      );

    const completions = Number(completionsResult?.count || 0);

    return {
      chartData: [],
      activeEnrollments,
      completions,
      preset: preset || 'month',
    };
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(startDate?: Date, endDate?: Date, preset?: string) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get revenue from payment history
    const revenueData = await this.db
      .select({
        date: sql<string>`DATE(${paymentHistory.paymentDate})`,
        amount: sql<number>`SUM(${paymentHistory.amount})`,
        count: sql<number>`count(*)`,
      })
      .from(paymentHistory)
      .where(
        and(
          eq(paymentHistory.isDeleted, false),
          gte(paymentHistory.paymentDate, start),
          lte(paymentHistory.paymentDate, end)
        )
      )
      .groupBy(sql`DATE(${paymentHistory.paymentDate})`)
      .orderBy(sql`DATE(${paymentHistory.paymentDate})`);

    const chartData = revenueData.map(item => ({
      date: item.date,
      revenue: Number(item.amount || 0),
      transactions: Number(item.count),
    }));

    // Get total revenue
    const [totalRevenueResult] = await this.db
      .select({
        total: sql<number>`SUM(${paymentHistory.amount})`,
      })
      .from(paymentHistory)
      .where(
        and(
          eq(paymentHistory.isDeleted, false),
          gte(paymentHistory.paymentDate, start),
          lte(paymentHistory.paymentDate, end)
        )
      );

    const totalRevenue = Number(totalRevenueResult?.total || 0);

    return {
      chartData,
      totalRevenue,
      preset: preset || 'month',
    };
  }

  /**
   * Get users with pagination (admin view)
   */
  async getUsers(page: number = 1, pageSize: number = 20) {
    const offset = (page - 1) * pageSize;

    const [data, totalResult] = await Promise.all([
      this.db
        .select({
          id: users.id,
          uuid: users.uuid,
          username: users.username,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          avatarUrl: users.avatarUrl,
          roleId: users.roleId,
          statusId: users.statusId,
          isActive: users.isActive,
          emailVerifiedAt: users.emailVerifiedAt,
          lastLoginAt: users.lastLoginAt,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.isDeleted, false))
        .orderBy(desc(users.createdAt))
        .limit(pageSize)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(eq(users.isDeleted, false))
        .then(result => Number(result[0].count)),
    ]);

    return {
      data,
      total: totalResult,
      page,
      pageSize,
      totalPages: Math.ceil(totalResult / pageSize),
    };
  }
}
