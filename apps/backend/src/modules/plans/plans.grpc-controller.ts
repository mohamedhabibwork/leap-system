import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PlansService } from './plans.service';

@Controller()
export class PlansGrpcController {
  constructor(private readonly plansService: PlansService) {}

  @GrpcMethod('PlansService', 'FindAll')
  async findAll() {
    const plans = await this.plansService.findAll();
    return { plans };
  }

  @GrpcMethod('PlansService', 'FindOne')
  async findOne(data: { id: number }) {
    return this.plansService.findOne(data.id);
  }
}
