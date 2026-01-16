import { Module } from '@nestjs/common';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { DatabaseModule } from '../../../database/database.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [LessonsController],
  providers: [LessonsService],
  exports: [LessonsService],
})
export class LessonsModule {}
