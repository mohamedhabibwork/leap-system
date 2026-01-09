import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { QuizzesService } from './quizzes.service';

@Controller()
export class QuizzesGrpcController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @GrpcMethod('QuizzesService', 'FindAll')
  async findAll() {
    const quizzes = await this.quizzesService.findAll();
    return { quizzes };
  }

  @GrpcMethod('QuizzesService', 'FindOne')
  async findOne(data: { id: number }) {
    return this.quizzesService.findOne(data.id);
  }

  @GrpcMethod('QuizzesService', 'FindBySection')
  async findBySection(data: { sectionId: number }) {
    const quizzes = await this.quizzesService.findBySection(data.sectionId);
    return { quizzes };
  }

  @GrpcMethod('QuizzesService', 'Create')
  async create(data: any) {
    return this.quizzesService.create(data);
  }

  @GrpcMethod('QuizzesService', 'Update')
  async update(data: any) {
    const { id, ...updateData } = data;
    return this.quizzesService.update(id, updateData);
  }

  @GrpcMethod('QuizzesService', 'Delete')
  async delete(data: { id: number }) {
    await this.quizzesService.remove(data.id);
    return { message: 'Quiz deleted successfully' };
  }
}
