import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, gt } from 'drizzle-orm';
import { users, subscriptions } from '@leap-lms/database';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    @Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route allows free access
    const allowFree = this.reflector.getAllAndOverride<boolean>('allowFree', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (allowFree) {
      return true;
    }

    // Check if subscription is required
    const requiresSubscription = this.reflector.getAllAndOverride<boolean>(
      'requiresSubscription',
      [context.getHandler(), context.getClass()],
    );

    if (!requiresSubscription) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Allow if user is admin or super admin
    if (user.role === 'admin' || user.role === 'super_admin') {
      return true;
    }

    // Allow if user is instructor (they can access their own content)
    if (user.role === 'instructor') {
      return true;
    }

    // Check if user has active subscription
    const [userData] = await this.db
      .select({
        subscriptionStatus: users.subscriptionStatus,
        subscriptionExpiresAt: users.subscriptionExpiresAt,
        currentSubscriptionId: users.currentSubscriptionId,
      })
      .from(users)
      .where(eq(users.id, user.id || user.userId || user.sub))
      .limit(1);

    if (!userData) {
      throw new ForbiddenException('User not found');
    }

    // Check if subscription is active
    if (userData.subscriptionStatus === 'active') {
      // Check if subscription has not expired
      if (
        !userData.subscriptionExpiresAt ||
        new Date(userData.subscriptionExpiresAt) > new Date()
      ) {
        return true;
      }
    }

    // If we have a subscription ID, check the subscription table
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

    throw new ForbiddenException(
      'Active subscription required to access this resource',
    );
  }
}
