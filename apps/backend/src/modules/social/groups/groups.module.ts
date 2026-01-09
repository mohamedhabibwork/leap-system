import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { GroupsResolver } from './groups.resolver';
import { GroupsGrpcController } from './groups.grpc-controller';
import { DatabaseModule} from '../../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [GroupsController, GroupsGrpcController],
  providers: [GroupsService, GroupsResolver],
  exports: [GroupsService],
})
export class GroupsModule {}
