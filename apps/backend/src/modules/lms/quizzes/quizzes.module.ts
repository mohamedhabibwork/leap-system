import { Module } from '@nestjs/common';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';
import { QuizzesResolver } from './quizzes.resolver';
import { QuizzesGrpcController } from './quizzes.grpc-controller';

@Module({
  controllers: [QuizzesController, QuizzesGrpcController],
  providers: [QuizzesService, QuizzesResolver],
  exports: [QuizzesService],
})
export class QuizzesModule {}
