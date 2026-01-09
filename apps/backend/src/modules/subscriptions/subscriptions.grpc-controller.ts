import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { SubscriptionsService } from './subscriptions.service';

@Controller()
export class SubscriptionsGrpcController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

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
  async create(data: { userId: number; planId: number; status?: string }) {
    return this.subscriptionsService.create({
      userId: data.userId,
      plan_id: data.planId,
      status: data.status || 'active',
    } as any);
  }

  @GrpcMethod('SubscriptionsService', 'Cancel')
  async cancel(data: { id: number; userId: number }) {
    await this.subscriptionsService.cancel(data.id);
    return { message: 'Subscription cancelled successfully' };
  }
}
