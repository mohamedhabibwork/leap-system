import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { EnrollmentsService } from './enrollments.service';

@Controller()
export class EnrollmentsGrpcController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @GrpcMethod('EnrollmentsService', 'FindAll')
  async findAll() {
    const enrollments = await this.enrollmentsService.findAll();
    return { enrollments };
  }

  @GrpcMethod('EnrollmentsService', 'FindOne')
  async findOne(data: { id: number }) {
    return this.enrollmentsService.findOne(data.id);
  }

  @GrpcMethod('EnrollmentsService', 'FindByUser')
  async findByUser(data: { userId: number }) {
    const enrollments = await this.enrollmentsService.findByUser(data.userId);
    return { enrollments };
  }

  @GrpcMethod('EnrollmentsService', 'FindByCourse')
  async findByCourse(data: { courseId: number }) {
    const enrollments = await this.enrollmentsService.findByCourse(data.courseId);
    return { enrollments };
  }

  @GrpcMethod('EnrollmentsService', 'Create')
  async create(data: any) {
    return this.enrollmentsService.create(data);
  }

  @GrpcMethod('EnrollmentsService', 'Update')
  async update(data: any) {
    const { id, ...updateData } = data;
    return this.enrollmentsService.update(id, updateData);
  }

  @GrpcMethod('EnrollmentsService', 'Delete')
  async delete(data: { id: number }) {
    await this.enrollmentsService.remove(data.id);
    return { message: 'Enrollment deleted successfully' };
  }
}
