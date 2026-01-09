import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SubscriptionsService } from './subscriptions.service';
import { Subscription, PaymentHistory } from './types/subscription.type';

@Resolver(() => Subscription)
@UseGuards(JwtAuthGuard)
export class SubscriptionsResolver {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

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
  async getMySubscriptions(@CurrentUser() user: any) {
    return this.subscriptionsService.findByUser(user.sub || user.id);
  }

  @Mutation(() => Subscription)
  async createSubscription(@Args('planId', { type: () => Int }) planId: number, @CurrentUser() user: any) {
    return this.subscriptionsService.create({ 
      userId: user.sub || user.id, 
      plan_id: planId,
      status: 'active'
    } as any);
  }

  @Mutation(() => String)
  async cancelSubscription(@Args('id', { type: () => Int }) id: number, @CurrentUser() user: any) {
    await this.subscriptionsService.cancel(id);
    return 'Subscription cancelled successfully';
  }
}
