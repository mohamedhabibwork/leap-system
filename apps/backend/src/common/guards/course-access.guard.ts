import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';
import { eq, and, gt } from 'drizzle-orm';
import { users, subscriptions, courses, enrollments, lessons, courseSections } from '@leap-lms/database';
import { AuthenticatedRequest } from '../types/request.types';

@Injectable()
export class CourseAccessGuard implements CanActivate {
  constructor(
    @Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if course access is required
    const requiresCourseAccess = this.reflector.getAllAndOverride<boolean>(
      'requiresCourseAccess',
      [context.getHandler(), context.getClass()],
    );

    if (!requiresCourseAccess) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    let courseId = parseInt(request.params.id || request.params.courseId);

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // If courseId is not in params, check if this is a lesson endpoint and look up courseId
    if (!courseId || isNaN(courseId)) {
      const lessonId = parseInt(request.params.id || request.params.lessonId);
      if (lessonId && !isNaN(lessonId)) {
        // This is a lesson endpoint, look up the courseId from the lesson
        const [lessonData] = await this.db
          .select({
            courseId: courses.id,
          })
          .from(lessons)
          .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
          .innerJoin(courses, eq(courseSections.courseId, courses.id))
          .where(and(eq(lessons.id, lessonId), eq(lessons.isDeleted, false)))
          .limit(1);

        if (!lessonData) {
          throw new NotFoundException('Lesson not found');
        }

        courseId = lessonData.courseId;
      }
    }

    if (!courseId || isNaN(courseId)) {
      throw new ForbiddenException('Course ID required');
    }

    // Allow if user is admin or super admin
    if (user.role === 'admin' || user.role === 'super_admin') {
      return true;
    }

    // Get course details
    const [course] = await this.db
      .select({
        id: courses.id,
        instructorId: courses.instructorId,
        price: courses.price,
      })
      .from(courses)
      .where(and(eq(courses.id, courseId), eq(courses.isDeleted, false)))
      .limit(1);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Allow if user is the course instructor
    if (course.instructorId === (user.id || user.userId || user.sub)) {
      return true;
    }

    // Allow if course is free
    if (course.price === '0' || course.price === null) {
      return true;
    }

    const userId = user.id || user.userId || user.sub;

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

    if (enrollment) {
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
