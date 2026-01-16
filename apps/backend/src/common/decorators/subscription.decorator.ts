import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to mark a route as requiring an active subscription
 * Use this on routes that should only be accessible to users with active subscriptions
 */
export const RequiresSubscription = () => SetMetadata('requiresSubscription', true);

/**
 * Decorator to mark a route as allowing free access
 * Use this on routes that should be accessible without a subscription
 */
export const AllowFree = () => SetMetadata('allowFree', true);

/**
 * Decorator to mark a route as requiring course access
 * Use this on routes that should check if user has access to a specific course
 * (either through subscription or course purchase)
 */
export const RequiresCourseAccess = () => SetMetadata('requiresCourseAccess', true);
