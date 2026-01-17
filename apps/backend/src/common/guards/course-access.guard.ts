import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';
import { eq, and, gt } from 'drizzle-orm';
import { users, subscriptions, courses, enrollments, lessons, courseSections } from '@leap-lms/database';
import { AuthenticatedRequest, getUserId } from '../types/request.types';

@Injectable()
export class CourseAccessGuard implements CanActivate {
  private readonly logger = new Logger(CourseAccessGuard.name);
  constructor(
    @Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.log('Checking course access');
    // Check if course access is required
    const requiresCourseAccess = this.reflector.getAllAndOverride<boolean>(
      'requiresCourseAccess',
      [context.getHandler(), context.getClass()],
    );

    if (!requiresCourseAccess) {
      this.logger.log('Course access not required');
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    let courseId = parseInt(request.params.id || request.params.courseId);

    if (!user) {
      this.logger.log('User not found');
      throw new ForbiddenException('Authentication required');
    }
    const isAdminOrSuperAdmin = (user.roles || [user.role]).some(role => role === 'admin' || role === 'super_admin');
    // Allow if user is admin or super admin
    if (isAdminOrSuperAdmin) {
   
      return true;
    }
    
    const userId = typeof user.id === 'number' ? user.id : (typeof getUserId(user) === 'number' ? getUserId(user) : (typeof user.sub === 'number' ? user.sub : parseInt(String(user.sub || user.id || getUserId(user)), 10)));

    // Check if this is a progress endpoint - allow access even if enrollment is expired
    const isProgressEndpoint = request.url?.includes('/lms/progress/') || false;

    // If courseId is not in params, check if this is a lesson endpoint and look up courseId
    if (!courseId || isNaN(courseId)) {
      const lessonId = parseInt(request.params.id || request.params.lessonId);
      if (lessonId && !isNaN(lessonId)) {
        // This is a lesson endpoint, look up the courseId from the lesson
        this.logger.log('Looking up courseId from lesson');
        const [lessonData] = await this.db
          .select({
            courseId: courses.id,
          })
          .from(lessons)
          .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
          .innerJoin(courses, eq(courseSections.courseId, courses.id))
          .where(
            and(
              eq(lessons.id, lessonId),
              eq(lessons.isDeleted, false),
              eq(courseSections.isDeleted, false),
            ),
          )
          .limit(1);

        if (!lessonData) {
          throw new NotFoundException('Lesson not found');
        }

        courseId = lessonData.courseId;

        // Check if user has enrollment for this course - allow access even if course is deleted
        this.logger.log('Checking enrollment for course');
        const [activeEnrollment] = await this.db
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

        if (activeEnrollment) {
          // For progress endpoints, allow access even if enrollment is expired
          // Progress should be visible regardless of enrollment expiration
          if (isProgressEndpoint) {
            this.logger.log('Progress endpoint - allowing access even if enrollment expired');
            return true;
          }
          // Check if enrollment is not expired
          if (
            !activeEnrollment.expiresAt ||
            new Date(activeEnrollment.expiresAt) > new Date()
          ) {
            this.logger.log('Enrollment found and not expired');
            return true;
          }
        }
      }
    }

    this.logger.log('Course ID required');
    if (!courseId || isNaN(courseId)) {
      throw new ForbiddenException('Course ID required');
    }


    // Get course details - check even if deleted, we'll handle enrollment separately
    const [course] = await this.db
      .select({
        id: courses.id,
        instructorId: courses.instructorId,
        price: courses.price,
        isDeleted: courses.isDeleted,
      })
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Allow if user is the course instructor
    if (course.instructorId === (user.id || getUserId(user) || user.sub)) {
      return true;
    }

    // Allow if course is free
    if (course.price === '0' || course.price === null) {
      return true;
    }

    // Check if user has active platform subscription
    const [userData] = await this.db
      .select({
        subscriptionStatus: users.subscriptionStatus,
        subscriptionExpiresAt: users.subscriptionExpiresAt,
        currentSubscriptionId: users.currentSubscriptionId,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userData) {
      // Check if subscription is active and not expired
      if (userData.subscriptionStatus === 'active') {
        if (
          !userData.subscriptionExpiresAt ||
          new Date(userData.subscriptionExpiresAt) > new Date()
        ) {
          return true;
        }
      }

      // Double-check subscription table if we have a subscription ID
      if (userData.currentSubscriptionId) {
        const [subscription] = await this.db
          .select()
          .from(subscriptions)
          .where(
            and(
              eq(subscriptions.id, userData.currentSubscriptionId),
              eq(subscriptions.isDeleted, false),
            ),
          )
          .limit(1);

        if (subscription) {
          // Check if subscription is active and not expired
          if (
            !subscription.endDate ||
            new Date(subscription.endDate) > new Date()
          ) {
            if (!subscription.cancelledAt) {
              return true;
            }
          }
        }
      }
    }

    // Check if user purchased the course (enrolled)
    const numericUserId = typeof userId === 'number' ? userId : parseInt(String(userId), 10);
    const [enrollment] = await this.db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.userId, numericUserId),
          eq(enrollments.courseId, courseId),
          eq(enrollments.isDeleted, false),
        ),
      )
      .limit(1);

    if (enrollment) {
      // For progress endpoints, allow access even if enrollment is expired
      // Progress should be visible regardless of enrollment expiration
      if (isProgressEndpoint) {
        this.logger.log('Progress endpoint - allowing access even if enrollment expired');
        return true;
      }
      // Check if enrollment is not expired
      if (
        !enrollment.expiresAt ||
        new Date(enrollment.expiresAt) > new Date()
      ) {
        return true;
      }
    }

    throw new ForbiddenException(
      'You must have an active subscription or purchase this course to access it',
    );
  }
}
