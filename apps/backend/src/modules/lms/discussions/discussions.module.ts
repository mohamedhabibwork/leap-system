import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../database/database.module';
import { DiscussionsService } from './discussions.service';
import { DiscussionsController } from './discussions.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [DiscussionsController],
  providers: [DiscussionsService],
  exports: [DiscussionsService],
})
export class DiscussionsModule {}
