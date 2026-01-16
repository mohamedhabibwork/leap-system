import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { QuizzesService } from './quizzes.service';
import { Quiz } from './types/quiz.type';
import { CreateQuizInput, UpdateQuizInput } from './types/quiz.input';

@Resolver(() => Quiz)

export class QuizzesResolver {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Query(() => [Quiz], { name: 'quizzes' })
  async findAll() {
    return this.quizzesService.findAll();
  }

  @Query(() => Quiz, { name: 'quiz' })
  async findOne(@Args('id', { type: () => Int }) id: number) {
    return this.quizzesService.findOne(id);
  }

  @Query(() => [Quiz], { name: 'quizzesBySection' })
  async findBySection(@Args('sectionId', { type: () => Int }) sectionId: number) {
    return this.quizzesService.findBySection(sectionId);
  }

  @Mutation(() => Quiz)
  @Roles('admin', 'instructor')
  async createQuiz(@Args('input') input: CreateQuizInput) {
    return this.quizzesService.create(input as any);
  }

  @Mutation(() => Quiz)
  @Roles('admin', 'instructor')
  async updateQuiz(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateQuizInput,
  ) {
    return this.quizzesService.update(id, input as any);
  }

  @Mutation(() => String)
  @Roles('admin', 'instructor')
  async removeQuiz(@Args('id', { type: () => Int }) id: number) {
    await this.quizzesService.remove(id);
    return 'Quiz deleted successfully';
  }
}
