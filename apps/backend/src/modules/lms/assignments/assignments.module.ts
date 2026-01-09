import { Module } from '@nestjs/common';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { AssignmentsResolver } from './assignments.resolver';
import { AssignmentsGrpcController } from './assignments.grpc-controller';

@Module({
  controllers: [AssignmentsController, AssignmentsGrpcController],
  providers: [AssignmentsService, AssignmentsResolver],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}
