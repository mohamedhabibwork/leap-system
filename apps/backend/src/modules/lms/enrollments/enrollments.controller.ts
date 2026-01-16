import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ResourceOwnerGuard } from '../../../common/guards/resource-owner.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ResourceType, SkipOwnership } from '../../../common/decorators/resource-type.decorator';
import { Role } from '../../../common/enums/roles.enum';

/**
 * Enrollments Controller
 * Handles course enrollment operations with strict ownership verification
 * - Students can only access their own enrollments
 * - Instructors can access enrollments in their courses
 * - Admins have full access
 */
@ApiTags('lms/enrollments')
@Controller('lms/enrollments')
@UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
@ApiBearerAuth()
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @Roles(Role.STUDENT, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Enroll in a course' })
  @ApiResponse({ status: 201, description: 'Enrolled successfully' })
  @ApiResponse({ status: 400, description: 'Already enrolled or invalid course' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  create(@Body() createEnrollmentDto: CreateEnrollmentDto, @CurrentUser() user: any) {
    // Ensure students can only enroll themselves
    if (user.role === Role.STUDENT) {
      createEnrollmentDto.userId = user.userId;
    }
    return this.enrollmentsService.create(createEnrollmentDto);
  }

  @Get('my-enrollments')
  @SkipOwnership()
  @ApiOperation({ summary: 'Get current user enrollments' })
  @ApiResponse({ status: 200, description: 'User enrollments retrieved' })
  getMyEnrollments(@CurrentUser() user: any) {
    return this.enrollmentsService.findByUser(user.userId);
  }

  @Get('course/:courseId')
  @SkipOwnership()
  @ApiOperation({ summary: 'Get current user enrollment for a specific course' })
  @ApiResponse({ status: 200, description: 'Enrollment retrieved' })
  @ApiResponse({ status: 404, description: 'Not enrolled in this course' })
  async getMyEnrollmentByCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
    @CurrentUser() user: any
  ) {
    const userId = user.userId || user.sub || user.id;
    return this.enrollmentsService.findByUserAndCourse(userId, courseId);
  }

  @Get('by-course/:courseId')
  @Roles(Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN)
  @SkipOwnership()
  @ApiOperation({ summary: 'Get enrollments by course (Instructor/Admin only)' })
  @ApiResponse({ status: 200, description: 'Course enrollments retrieved' })
  @ApiResponse({ status: 403, description: 'Not the course instructor' })
  getByCourse(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.enrollmentsService.findByCourse(courseId);
  }

  @Get(':id')
  @ResourceType('enrollment')
  @ApiOperation({ summary: 'Get enrollment by ID (owner/instructor/admin only)' })
  @ApiResponse({ status: 200, description: 'Enrollment retrieved' })
  @ApiResponse({ status: 403, description: 'Not authorized to view this enrollment' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ResourceType('enrollment')
  @ApiOperation({ summary: 'Update enrollment (Instructor/Admin only - for grading/progress)' })
  @ApiResponse({ status: 200, description: 'Enrollment updated' })
  @ApiResponse({ status: 403, description: 'Not authorized to update this enrollment' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateEnrollmentDto: UpdateEnrollmentDto) {
    return this.enrollmentsService.update(id, updateEnrollmentDto);
  }

  @Delete(':id')
  @Roles(Role.STUDENT, Role.ADMIN, Role.SUPER_ADMIN)
  @ResourceType('enrollment')
  @ApiOperation({ summary: 'Unenroll from course (owner/admin only)' })
  @ApiResponse({ status: 200, description: 'Unenrolled successfully' })
  @ApiResponse({ status: 403, description: 'Cannot unenroll (completed course or not owner)' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.remove(id);
  }
}
