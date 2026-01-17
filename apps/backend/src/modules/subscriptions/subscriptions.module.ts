import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsResolver } from './subscriptions.resolver';
import { SubscriptionsGrpcController } from './subscriptions.grpc-controller';
import { DatabaseModule } from '../../database/database.module';
import { LookupsModule } from '../lookups/lookups.module';

@Module({
  imports: [DatabaseModule, LookupsModule],
  controllers: [SubscriptionsController, SubscriptionsGrpcController],
  providers: [SubscriptionsService, SubscriptionsResolver],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
