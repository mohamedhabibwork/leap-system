import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { CoursesResolver } from './courses.resolver';
import { CoursesGrpcController } from './courses.grpc-controller';
import { DatabaseModule } from '../../../database/database.module';
import { AuthModule } from '../../auth/auth.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { LessonsModule } from '../lessons/lessons.module';
import { StudentModule } from '../student/student.module';

@Module({
  imports: [DatabaseModule, AuthModule, EnrollmentsModule, LessonsModule, StudentModule],
  controllers: [CoursesController, CoursesGrpcController],
  providers: [CoursesService, CoursesResolver],
  exports: [CoursesService],
})
export class CoursesModule {}
