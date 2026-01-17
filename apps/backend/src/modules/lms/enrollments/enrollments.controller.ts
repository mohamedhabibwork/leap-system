import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Query, Inject, Logger } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ResourceOwnerGuard } from '../../../common/guards/resource-owner.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser, getUserId } from '../../../common/types/request.types';
import { ResourceType, SkipOwnership } from '../../../common/decorators/resource-type.decorator';
import { Role } from '../../../common/enums/roles.enum';
import { PaymentsService } from '../../payments/payments.service';
import { LookupsService } from '../../lookups/lookups.service';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@leap-lms/database';

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
  private readonly logger = new Logger(EnrollmentsController.name);

  constructor(
    private readonly enrollmentsService: EnrollmentsService,
    private readonly paymentsService: PaymentsService,
    private readonly lookupsService: LookupsService,
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  @Post()
  @Roles(Role.STUDENT, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Enroll in a course' })
  @ApiResponse({ status: 201, description: 'Enrolled successfully' })
  @ApiResponse({ status: 400, description: 'Already enrolled or invalid course' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async create(
    @Body() createEnrollmentDto: CreateEnrollmentDto & { amount?: string; orderId?: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    // Ensure students can only enroll themselves
    const currentUserRole = user.role || user.roles?.[0];
    const userId = currentUserRole === Role.STUDENT ? getUserId(user) : (createEnrollmentDto.userId || getUserId(user));
    const courseId = (createEnrollmentDto as any).courseId || createEnrollmentDto.course_id;
    const enrollmentType = createEnrollmentDto.enrollment_type || 'purchase';

    // Validate required fields
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (!courseId) {
      throw new Error('Course ID is required');
    }

    // For purchase enrollments, use createEnrollment method which properly handles amount
    if (enrollmentType === 'purchase') {
      const amount = createEnrollmentDto.amount 
        ? parseFloat(createEnrollmentDto.amount) 
        : undefined;

      // Create enrollment using the proper method
      const enrollment = await this.enrollmentsService.createEnrollment(
        userId,
        courseId,
        'purchase',
        { amountPaid: amount },
      );

      // Create payment record if amount is provided (mock payment)
      if (amount && amount > 0) {
        try {
          // Get payment status lookup (completed for successful payments)
          const paymentStatusLookups = await this.lookupsService.findByType('payment_status');
          const completedStatus = paymentStatusLookups.find((l) => l.code === 'completed');

          if (completedStatus) {
            await this.paymentsService.create({
              userId,
              amount,
              currency: 'USD',
              payment_method: 'paypal',
              payment_type: 'course',
              course_id: courseId,
              description: `Course enrollment payment - Order: ${createEnrollmentDto.orderId || 'N/A'}`,
              statusId: completedStatus.id,
            });
            this.logger.log(`Payment record created for course enrollment: course ${courseId}, user ${userId}`);
          }
        } catch (error) {
          // Log error but don't fail enrollment if payment record creation fails
          this.logger.error(`Failed to create payment record for enrollment:`, error);
        }
      }

      return enrollment;
    }

    // For other enrollment types, use the original create method
    const enrollmentUserRole = user.role || user.roles?.[0];
    if (enrollmentUserRole === Role.STUDENT) {
      createEnrollmentDto.userId = getUserId(user);
    }
    return this.enrollmentsService.create(createEnrollmentDto);
  }

  @Get('my-enrollments')
  @SkipOwnership()
  @ApiOperation({ summary: 'Get current user enrollments' })
  @ApiResponse({ status: 200, description: 'User enrollments retrieved' })
  getMyEnrollments(@CurrentUser() user: AuthenticatedUser) {
    return this.enrollmentsService.findByUser(getUserId(user));
  }

  @Get('course/:courseId')
  @SkipOwnership()
  @ApiOperation({ summary: 'Get current user enrollment for a specific course' })
  @ApiResponse({ status: 200, description: 'Enrollment retrieved' })
  @ApiResponse({ status: 404, description: 'Not enrolled in this course' })
  async getMyEnrollmentByCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
    @CurrentUser() user: AuthenticatedUser
  ) {
    const userId = getUserId(user);
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
