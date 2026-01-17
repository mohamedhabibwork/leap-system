import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SubscriptionsService } from './subscriptions.service';
import { LookupsService } from '../lookups/lookups.service';
import { Subscription, PaymentHistory } from './types/subscription.type';
import { AuthenticatedUser, getUserId } from '../../common/types/request.types';
import { LookupTypeCode, SubscriptionStatusCode, BillingCycleCode } from '@leap-lms/shared-types';

@Resolver(() => Subscription)
export class SubscriptionsResolver {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly lookupsService: LookupsService,
  ) {}

  @Query(() => [Subscription], { name: 'subscriptions' })
  @Roles('admin')
  async findAll() {
    return this.subscriptionsService.findAll();
  }

  @Query(() => Subscription, { name: 'subscription' })
  async findOne(@Args('id', { type: () => Int }) id: number) {
    return this.subscriptionsService.findOne(id);
  }

  @Query(() => [Subscription], { name: 'mySubscriptions' })
  async getMySubscriptions(@CurrentUser() user: AuthenticatedUser) {
    return this.subscriptionsService.findByUser(getUserId(user));
  }

  @Mutation(() => Subscription)
  async createSubscription(@Args('planId', { type: () => Int }) planId: number, @CurrentUser() user: AuthenticatedUser) {
    const defaultStatusId = await this.lookupsService.getLookupIdByCode(LookupTypeCode.SUBSCRIPTION_STATUS, SubscriptionStatusCode.ACTIVE);
    const defaultBillingCycleId = await this.lookupsService.getLookupIdByCode(LookupTypeCode.BILLING_CYCLE, BillingCycleCode.MONTHLY);
    
    return this.subscriptionsService.create({ 
      userId: getUserId(user), 
      planId: planId,
      statusId: defaultStatusId,
      billingCycleId: defaultBillingCycleId,
    } );
  }

  @Mutation(() => String)
  async cancelSubscription(@Args('id', { type: () => Int }) id: number, @CurrentUser() user: AuthenticatedUser) {
    await this.subscriptionsService.cancel(id);
    return 'Subscription cancelled successfully';
  }
}
