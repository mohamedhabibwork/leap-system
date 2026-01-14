import { Module, Global } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { KafkaService } from './kafka.service';
import { QueueProcessorsService } from './queue-processors.service';
import { DatabaseModule } from '../../database/database.module';

@Global()
@Module({
  imports: [
    DatabaseModule,
  ],
  providers: [RabbitMQService, KafkaService, QueueProcessorsService],
  exports: [RabbitMQService, KafkaService],
})
export class BackgroundJobsModule {}
