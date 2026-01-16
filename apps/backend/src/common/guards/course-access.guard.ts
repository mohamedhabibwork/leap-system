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
import { eq, and, gt } from 'drizzle-orm';
import { users, subscriptions, courses, enrollments } from '@leap-lms/database';

@Injectable()
export class CourseAccessGuard implements CanActivate {
  constructor(
    @Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>,
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

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const courseId = parseInt(request.params.id || request.params.courseId);

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    if (!courseId) {
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
        isFree: courses.isFree,
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
    if (course.isFree || course.price === '0' || course.price === null) {
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
