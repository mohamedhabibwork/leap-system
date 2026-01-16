import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CoursesService } from './courses.service';
import { GrpcAuthInterceptor } from '../../../grpc/interceptors/grpc-auth.interceptor';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/roles.enum';

@Controller()
@UseInterceptors(GrpcAuthInterceptor)
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
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.INSTRUCTOR)
  async delete(data: { id: number }) {
    await this.coursesService.remove(data.id);
    return { message: 'Course deleted successfully' };
  }

  // Admin-specific RPCs
  @GrpcMethod('CoursesService', 'ApproveCourse')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async approveCourse(data: { courseId: number }) {
    // Update course status to approved/published (statusId typically 2 = published)
    return this.coursesService.update(data.courseId, { statusId: 2 });
  }

  @GrpcMethod('CoursesService', 'RejectCourse')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async rejectCourse(data: { courseId: number; reason?: string }) {
    // Update course status to rejected (statusId typically 4 = rejected)
    return this.coursesService.update(data.courseId, { statusId: 4 });
  }

  @GrpcMethod('CoursesService', 'GetCourseStats')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async getCourseStats() {
    const allCourses = await this.coursesService.findAll(1, 10000);
    const courses = allCourses.data;
    
    return {
      totalCourses: allCourses.pagination.total,
      publishedCourses: (courses?.filter((c: { statusId: number }) => c.statusId === 2) || []).length,
      draftCourses: (courses?.filter((c: { statusId: number }) => c.statusId === 1) || []).length,
      pendingApproval: (courses?.filter((c: { statusId: number }) => c.statusId === 3) || []).length,
      rejectedCourses: (courses?.filter((c: { statusId: number }) => c.statusId === 4) || []).length,
      featuredCourses: (courses?.filter((c: { isFeatured: boolean }) => c.isFeatured) || []).length,
    };
  }
}
