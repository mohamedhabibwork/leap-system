import { Module, Global } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { KafkaService } from './kafka.service';

@Global()
@Module({
  providers: [RabbitMQService, KafkaService],
  exports: [RabbitMQService, KafkaService],
})
export class BackgroundJobsModule {}
