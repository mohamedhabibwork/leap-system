import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MinioService } from './minio.service';
import { R2Service } from './r2.service';
import { ImageProcessingService } from './image-processing.service';
import { MediaController } from './media.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [MediaController],
  providers: [MediaService, MinioService, R2Service, ImageProcessingService],
  exports: [MediaService, MinioService, R2Service, ImageProcessingService],
})
export class MediaModule {}
