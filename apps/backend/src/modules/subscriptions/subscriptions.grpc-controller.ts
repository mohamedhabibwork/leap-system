import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { SubscriptionsService } from './subscriptions.service';
import { LookupsService } from '../lookups/lookups.service';
import { LookupTypeCode, SubscriptionStatusCode, BillingCycleCode } from '@leap-lms/shared-types';

@Controller()
export class SubscriptionsGrpcController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly lookupsService: LookupsService,
  ) {}

  @GrpcMethod('SubscriptionsService', 'FindAll')
  async findAll() {
    const subscriptions = await this.subscriptionsService.findAll();
    return { subscriptions };
  }

  @GrpcMethod('SubscriptionsService', 'FindOne')
  async findOne(data: { id: number }) {
    return this.subscriptionsService.findOne(data.id);
  }

  @GrpcMethod('SubscriptionsService', 'FindByUser')
  async findByUser(data: { userId: number }) {
    const subscriptions = await this.subscriptionsService.findByUser(data.userId);
    return { subscriptions };
  }

  @GrpcMethod('SubscriptionsService', 'Create')
  async create(data: { userId: number; planId: number; statusId: number; billingCycleId: number }) {
    const defaultStatusId = data.statusId || await this.lookupsService.getLookupIdByCode(LookupTypeCode.SUBSCRIPTION_STATUS, SubscriptionStatusCode.ACTIVE);
    const defaultBillingCycleId = data.billingCycleId || await this.lookupsService.getLookupIdByCode(LookupTypeCode.BILLING_CYCLE, BillingCycleCode.MONTHLY);
    
    return this.subscriptionsService.create({
      userId: data.userId,
      planId: data.planId,
      statusId: defaultStatusId,
      billingCycleId: defaultBillingCycleId,
    } );
  }

  @GrpcMethod('SubscriptionsService', 'Cancel')
  async cancel(data: { id: number; userId: number }) {
    await this.subscriptionsService.cancel(data.id);
    return { message: 'Subscription cancelled successfully' };
  }
}
