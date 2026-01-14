import { Module } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsResolver } from './enrollments.resolver';
import { EnrollmentsGrpcController } from './enrollments.grpc-controller';
import { DatabaseModule } from '../../../database/database.module';
import { BackgroundJobsModule } from '../../background-jobs/background-jobs.module';

@Module({
  imports: [DatabaseModule, BackgroundJobsModule],
  controllers: [EnrollmentsController, EnrollmentsGrpcController],
  providers: [EnrollmentsService, EnrollmentsResolver],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
