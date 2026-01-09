import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CoursesService } from './courses.service';

@Controller()
export class CoursesGrpcController {
  constructor(private readonly coursesService: CoursesService) {}

  @GrpcMethod('CoursesService', 'FindAll')
  async findAll(data: { page?: number; limit?: number }) {
    const result = await this.coursesService.findAll(data.page || 1, data.limit || 10);
    return {
      courses: result.data,
      total: result.pagination.total,
      page: result.pagination.page,
      limit: result.pagination.limit,
      totalPages: result.pagination.totalPages,
    };
  }

  @GrpcMethod('CoursesService', 'FindOne')
  async findOne(data: { id: number }) {
    return this.coursesService.findOne(data.id);
  }

  @GrpcMethod('CoursesService', 'FindPublished')
  async findPublished() {
    const courses = await this.coursesService.findPublished();
    return { courses };
  }

  @GrpcMethod('CoursesService', 'Create')
  async create(data: any) {
    return this.coursesService.create(data);
  }

  @GrpcMethod('CoursesService', 'Update')
  async update(data: any) {
    const { id, ...updateData } = data;
    return this.coursesService.update(id, updateData);
  }

  @GrpcMethod('CoursesService', 'Delete')
  async delete(data: { id: number }) {
    await this.coursesService.remove(data.id);
    return { message: 'Course deleted successfully' };
  }
}
