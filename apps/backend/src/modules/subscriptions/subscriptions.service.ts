import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto';
import { Subscription } from './entities/subscription.entity';
import { eq, and, sql, gte } from 'drizzle-orm';
import { subscriptions, users, plans, enrollments } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class SubscriptionsService {
  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<any>,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    const result = await this.db
      .insert(subscriptions)
      .values(createSubscriptionDto as any)
      .returning();
    
    const subscription = Array.isArray(result) ? result[0] : result;
    return subscription as any;
  }

  async findAll(): Promise<Subscription[]> {
    return await this.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.isDeleted, false)) as any;
  }

  async findOne(id: number): Promise<Subscription> {
    const [subscription] = await this.db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.id, id), eq(subscriptions.isDeleted, false)))
      .limit(1);

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    return subscription as any;
  }

  async findByUser(userId: number): Promise<Subscription[]> {
    return await this.db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.isDeleted, false)
        )
      ) as any;
  }

  async findActiveByUser(userId: number): Promise<Subscription | null> {
    const [subscription] = await this.db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.statusId, 1),
          eq(subscriptions.isDeleted, false),
          gte(subscriptions.endDate, new Date())
        )
      )
      .limit(1);

    return (subscription || null) as any;
  }

  async update(id: number, updateSubscriptionDto: UpdateSubscriptionDto): Promise<Subscription> {
    await this.findOne(id);

    const [updatedSubscription] = await this.db
      .update(subscriptions)
      .set(updateSubscriptionDto as any)
      .where(eq(subscriptions.id, id))
      .returning();

    return updatedSubscription as any;
  }

  async cancel(id: number): Promise<Subscription> {
    await this.findOne(id);

    const [cancelledSubscription] = await this.db
      .update(subscriptions)
      .set({
        cancelledAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      } as any)
      .where(eq(subscriptions.id, id))
      .returning();

    return cancelledSubscription as any;
  }

  async renew(id: number, endDate: string): Promise<Subscription> {
    await this.findOne(id);

    const [renewedSubscription] = await this.db
      .update(subscriptions)
      .set({
        endDate: new Date(endDate),
        updatedAt: sql`CURRENT_TIMESTAMP`,
      } as any)
      .where(eq(subscriptions.id, id))
      .returning();

    return renewedSubscription as any;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    await this.db
      .update(subscriptions)
      .set({
        isDeleted: true,
        deletedAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      } as any)
      .where(eq(subscriptions.id, id));
  }

  /**
   * Check if user has an active subscription
   */
  async hasActiveSubscription(userId: number): Promise<boolean> {
    const [userData] = await this.db
      .select({
        subscriptionStatus: users.subscriptionStatus,
        subscriptionExpiresAt: users.subscriptionExpiresAt,
        currentSubscriptionId: users.currentSubscriptionId,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userData) {
      return false;
    }

    // Check subscription status
    if (userData.subscriptionStatus === 'active') {
      // Check if not expired
      if (
        !userData.subscriptionExpiresAt ||
        new Date(userData.subscriptionExpiresAt) > new Date()
      ) {
        return true;
      }
    }

    // Double-check subscription table
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

    return false;
  }

  /**
   * Check if user can access a course (via subscription or enrollment)
   */
  async canAccessCourse(userId: number, courseId: number): Promise<boolean> {
    // Check if user has active subscription
    const hasSubscription = await this.hasActiveSubscription(userId);
    if (hasSubscription) {
      return true;
    }

    // Check if user has enrolled in the course
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

    return false;
  }

  /**
   * Get subscription features for a user
   */
  async getSubscriptionFeatures(userId: number): Promise<any> {
    const [userData] = await this.db
      .select({
        currentSubscriptionId: users.currentSubscriptionId,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userData || !userData.currentSubscriptionId) {
      return null;
    }

    const [subscription] = await this.db
      .select({
        planId: subscriptions.planId,
      })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.id, userData.currentSubscriptionId),
          eq(subscriptions.isDeleted, false),
        ),
      )
      .limit(1);

    if (!subscription) {
      return null;
    }

    const [plan] = await this.db
      .select()
      .from(plans)
      .where(and(eq(plans.id, subscription.planId), eq(plans.isDeleted, false)))
      .limit(1);

    return plan;
  }

  /**
   * Get maximum courses allowed for user's subscription plan
   */
  async maxCoursesAllowed(userId: number): Promise<number | null> {
    const features = await this.getSubscriptionFeatures(userId);
    if (!features) {
      return null;
    }

    return features.maxCourses || null;
  }
}
