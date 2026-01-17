import { Module } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsResolver } from './enrollments.resolver';
import { EnrollmentsGrpcController } from './enrollments.grpc-controller';
import { DatabaseModule } from '../../../database/database.module';
import { BackgroundJobsModule } from '../../background-jobs/background-jobs.module';
import { PaymentsModule } from '../../payments/payments.module';
import { LookupsModule } from '../../lookups/lookups.module';

@Module({
  imports: [DatabaseModule, BackgroundJobsModule, PaymentsModule, LookupsModule],
  controllers: [EnrollmentsController, EnrollmentsGrpcController],
  providers: [EnrollmentsService, EnrollmentsResolver],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
