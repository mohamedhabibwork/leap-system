import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto';
import { eq, and, sql, gte } from 'drizzle-orm';
import { subscriptions, users, plans, enrollments, planFeatures } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { LookupsService } from '../lookups/lookups.service';
import { LookupTypeCode, SubscriptionStatusCode, BillingCycleCode } from '@leap-lms/shared-types';

type Subscription = InferSelectModel<typeof subscriptions>;

@Injectable()
export class SubscriptionsService {
  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly lookupsService: LookupsService,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto & { userId: number }): Promise<Subscription> {
    const subscriptionData = {
      userId: createSubscriptionDto.userId,
      planId: createSubscriptionDto.planId as number,
      statusId: createSubscriptionDto.statusId,
      billingCycleId: createSubscriptionDto.billingCycleId,
      amountPaid: createSubscriptionDto.amountPaid || '0',
      startDate: createSubscriptionDto.start_date ? new Date(createSubscriptionDto.start_date) : new Date(),
      endDate: createSubscriptionDto.end_date ? new Date(createSubscriptionDto.end_date) : null,
      autoRenew: createSubscriptionDto.auto_renew ?? false,
      vaultId: createSubscriptionDto.vaultId || null,
    } as InferInsertModel<typeof subscriptions>;
    
    const [subscription] = await this.db
      .insert(subscriptions)
      .values(subscriptionData as InferInsertModel<typeof subscriptions>)
      .returning();
    
    return subscription;
  }

  async findAll(): Promise<Subscription[]> {
    return await this.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.isDeleted, false)) ;
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

    return subscription;
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
      );
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

    return (subscription || null) ;
  }

  async update(id: number, updateSubscriptionDto: UpdateSubscriptionDto): Promise<Subscription> {
    await this.findOne(id);

    const updateData: Partial<InferSelectModel<typeof subscriptions>> = {
      updatedAt: new Date(),
    };
    
    if (updateSubscriptionDto.planId !== undefined) updateData.planId = updateSubscriptionDto.planId;
    if (updateSubscriptionDto.statusId !== undefined) updateData.statusId = updateSubscriptionDto.statusId;
    if (updateSubscriptionDto.billingCycleId !== undefined) updateData.billingCycleId = updateSubscriptionDto.billingCycleId;
    if (updateSubscriptionDto.amountPaid !== undefined) updateData.amountPaid = updateSubscriptionDto.amountPaid;
    if (updateSubscriptionDto.start_date !== undefined) updateData.startDate = new Date(updateSubscriptionDto.start_date);
    if (updateSubscriptionDto.end_date !== undefined) updateData.endDate = new Date(updateSubscriptionDto.end_date);
    if (updateSubscriptionDto.auto_renew !== undefined) updateData.autoRenew = updateSubscriptionDto.auto_renew;
    if (updateSubscriptionDto.vaultId !== undefined) updateData.vaultId = updateSubscriptionDto.vaultId;

    const [updatedSubscription] = await this.db
      .update(subscriptions)
      .set(updateData as Partial<InferInsertModel<typeof subscriptions>>)
      .where(eq(subscriptions.id, id))
      .returning();

    return updatedSubscription;
  }

  async cancel(id: number): Promise<Subscription> {
    await this.findOne(id);

    const [cancelledSubscription] = await this.db
      .update(subscriptions)
      .set({
        cancelledAt: new Date(),
        updatedAt: new Date(),
      } as Partial<InferInsertModel<typeof subscriptions>>)
      .where(eq(subscriptions.id, id))
      .returning();

    return cancelledSubscription;
  }

  async renew(id: number, endDate: string): Promise<Subscription> {
    await this.findOne(id);

    const [renewedSubscription] = await this.db
      .update(subscriptions)
      .set({
        endDate: new Date(endDate),
        updatedAt: new Date(),
      } as Partial<InferInsertModel<typeof subscriptions>>)
      .where(eq(subscriptions.id, id))
      .returning();

    return renewedSubscription;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    await this.db
      .update(subscriptions)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date(),
      } as Partial<InferInsertModel<typeof subscriptions>>)
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
    if (userData.subscriptionStatus === SubscriptionStatusCode.ACTIVE) {
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
  async getSubscriptionFeatures(userId: number): Promise<{
    subscription: InferSelectModel<typeof subscriptions> | null;
    plan: InferSelectModel<typeof plans> | null;
    features: InferSelectModel<typeof planFeatures>[];
  } | null> {
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
      .select()
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

    if (!plan) {
      return null;
    }

    const features = await this.db
      .select()
      .from(planFeatures)
      .where(and(eq(planFeatures.planId, plan.id), eq(planFeatures.isDeleted, false)));

    return {
      subscription: subscription as InferSelectModel<typeof subscriptions>,
      plan: plan as InferSelectModel<typeof plans>,
      features: features as InferSelectModel<typeof planFeatures>[],
    };
  }

  /**
   * Get maximum courses allowed for user's subscription plan
   */
  async maxCoursesAllowed(userId: number): Promise<number | null> {
    const features = await this.getSubscriptionFeatures(userId);
    if (!features || !features.plan) {
      return null;
    }

    // Check if plan has maxCourses property or get from features
    const maxCourses = (features.plan as { maxCourses?: number }).maxCourses;
    return maxCourses ?? null;
  }
}
