import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { DatabaseModule } from '../../database/database.module';
import { LookupsModule } from '../lookups/lookups.module';

@Module({
  imports: [DatabaseModule, LookupsModule],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
