import { Module } from '@nestjs/common';
import { SectionsController } from './sections.controller';
import { SectionsService } from './sections.service';
import { DatabaseModule } from '../../../database/database.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [SectionsController],
  providers: [SectionsService],
  exports: [SectionsService],
})
export class SectionsModule {}
