import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlansService } from './plans.service';
import { Plan } from '../subscriptions/types/subscription.type';

@Resolver(() => Plan)
@UseGuards(JwtAuthGuard)
export class PlansResolver {
  constructor(private readonly plansService: PlansService) {}

  @Query(() => [Plan], { name: 'plans' })
  async findAll() {
    return this.plansService.findAll();
  }

  @Query(() => Plan, { name: 'plan' })
  async findOne(@Args('id', { type: () => Int }) id: number) {
    return this.plansService.findOne(id);
  }
}
