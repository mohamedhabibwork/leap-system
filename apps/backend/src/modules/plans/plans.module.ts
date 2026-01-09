import { Module } from '@nestjs/common';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';
import { PlansResolver } from './plans.resolver';
import { PlansGrpcController } from './plans.grpc-controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PlansController, PlansGrpcController],
  providers: [PlansService, PlansResolver],
  exports: [PlansService],
})
export class PlansModule {}
