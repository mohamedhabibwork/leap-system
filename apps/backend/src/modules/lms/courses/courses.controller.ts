import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Query, Res } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseQueryDto } from './dto/course-query.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ResourceOwnerGuard } from '../../../common/guards/resource-owner.guard';
import { CourseAccessGuard } from '../../../common/guards/course-access.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { ResourceType, SkipOwnership } from '../../../common/decorators/resource-type.decorator';
import { RequiresCourseAccess } from '../../../common/decorators/subscription.decorator';
import { Role } from '../../../common/enums/roles.enum';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { LessonsService } from '../lessons/lessons.service';
import { StudentService } from '../student/student.service';
import { Response } from 'express';

/**
 * Courses Controller
 * Handles all course-related endpoints with proper RBAC and ownership verification
 */
@ApiTags('lms/courses')
@Controller('lms/courses')
@UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly enrollmentsService: EnrollmentsService,
    private readonly lessonsService: LessonsService,
    private readonly studentService: StudentService,
  ) {}

  @Post()
  @Roles(Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  @Public()
  @SkipOwnership()
  @ApiOperation({ summary: 'Get all courses (public)' })
  @ApiResponse({ status: 200, description: 'List of courses' })
  findAll(@Query() query: CourseQueryDto) {
    const { page = 1, limit = 10, sort = 'desc', search, category, sortBy = 'createdAt' } = query;
    return this.coursesService.findAll(page, limit, sort, search, sortBy, category);
  }

  @Get('published')
  @Public()
  @SkipOwnership()
  @ApiOperation({ summary: 'Get published courses only' })
  @ApiResponse({ status: 200, description: 'List of published courses' })
  findPublished() {
    return this.coursesService.findPublished();
  }

  @Get(':id')
  @Public()
  @ResourceType('course')
  @ApiOperation({ summary: 'Get course by ID (public for published, restricted for drafts)' })
  @ApiResponse({ status: 200, description: 'Course details' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const course = await this.coursesService.findOne(id);
    const userId = user?.userId || user?.sub || user?.id;
    
    // Add access status if user is authenticated
    if (userId) {
      const hasAccess = await this.enrollmentsService.checkAccess(userId, id);
      return {
        ...course,
        accessStatus: {
          hasAccess,
          canEnroll: !hasAccess,
        },
      };
    }
    
    return course;
  }

  @Patch(':id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ResourceType('course')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update course (owner or admin only)' })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  @ApiResponse({ status: 403, description: 'Not the course owner' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ResourceType('course')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete course (admin only)' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.remove(id);
  }

  @Get('my-enrollments')
  @SkipOwnership()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user enrollments (delegated to EnrollmentsService)' })
  @ApiResponse({ status: 200, description: 'User enrollments retrieved' })
  getMyEnrollments(@CurrentUser() user: any) {
    return this.enrollmentsService.findByUser(user.userId || user.sub || user.id);
  }

  @Get('my-courses')
  @Roles(Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN)
  @SkipOwnership()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get instructor created courses' })
  @ApiResponse({ status: 200, description: 'Instructor courses retrieved' })
  getMyCourses(@CurrentUser() user: any, @Query() query: CourseQueryDto) {
    return this.coursesService.findByInstructor(user.userId || user.sub || user.id, query);
  }

  @Post(':id/enroll')
  @Roles(Role.STUDENT, Role.ADMIN, Role.SUPER_ADMIN)
  @SkipOwnership()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enroll in a course' })
  @ApiResponse({ status: 201, description: 'Enrolled successfully' })
  @ApiResponse({ status: 400, description: 'Already enrolled or invalid course' })
  enrollInCourse(@Param('id', ParseIntPipe) courseId: number, @CurrentUser() user: any, @Body() body: any) {
    const userId = user.userId || user.sub || user.id;
    return this.coursesService.enrollStudent(courseId, userId, body);
  }

  @Delete(':id/enroll')
  @Roles(Role.STUDENT, Role.ADMIN, Role.SUPER_ADMIN)
  @SkipOwnership()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unenroll from a course' })
  @ApiResponse({ status: 200, description: 'Unenrolled successfully' })
  unenrollFromCourse(@Param('id', ParseIntPipe) courseId: number, @CurrentUser() user: any) {
    const userId = user.userId || user.sub || user.id;
    return this.coursesService.unenrollStudent(courseId, userId);
  }

  @Get(':id/lessons')
  @Public()
  @SkipOwnership()
  @ApiOperation({ summary: 'Get course lessons (delegated to LessonsService)' })
  @ApiResponse({ status: 200, description: 'Course lessons retrieved' })
  getCourseLessons(@Param('id', ParseIntPipe) courseId: number, @CurrentUser() user: any) {
    const userId = user?.userId || user?.sub || user?.id;
    const userRole = user?.role;
    return this.lessonsService.getCourseLessons(courseId, userId, userRole);
  }

  @Get(':id/access-status')
  @ApiBearerAuth()
  @SkipOwnership()
  @ApiOperation({ summary: 'Get course access status for current user' })
  @ApiResponse({ status: 200, description: 'Access status retrieved' })
  async getAccessStatus(@Param('id', ParseIntPipe) courseId: number, @CurrentUser() user: any) {
    const userId = user.userId || user.sub || user.id;
    const hasAccess = await this.enrollmentsService.checkAccess(userId, courseId);
    const enrollment = await this.enrollmentsService.getActiveEnrollment(userId, courseId);
    
    return {
      hasAccess,
      enrollment: enrollment ? {
        id: enrollment.id,
        enrolledAt: enrollment.enrolledAt,
        progressPercentage: enrollment.progressPercentage,
        enrollmentType: enrollment.enrollmentTypeId,
      } : null,
    };
  }

  @Get(':id/lessons/:lessonId')
  @UseGuards(CourseAccessGuard)
  @RequiresCourseAccess()
  @ApiBearerAuth()
  @SkipOwnership()
  @ApiOperation({ summary: 'Get single lesson (requires course access)' })
  @ApiResponse({ status: 200, description: 'Lesson retrieved' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  getLesson(@Param('lessonId', ParseIntPipe) lessonId: number) {
    return this.lessonsService.findOne(lessonId);
  }

  @Post(':id/lessons/:lessonId/complete')
  @UseGuards(CourseAccessGuard)
  @RequiresCourseAccess()
  @ApiBearerAuth()
  @SkipOwnership()
  @ApiOperation({ summary: 'Mark lesson as complete (requires course access)' })
  @ApiResponse({ status: 200, description: 'Lesson marked as complete' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  markLessonComplete(
    @Param('id', ParseIntPipe) courseId: number,
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @CurrentUser() user: any,
  ) {
    const userId = user.userId || user.sub || user.id;
    return this.coursesService.markLessonComplete(courseId, lessonId, userId);
  }

  @Get(':id/progress')
  @UseGuards(CourseAccessGuard)
  @RequiresCourseAccess()
  @ApiBearerAuth()
  @SkipOwnership()
  @ApiOperation({ summary: 'Get course progress (requires course access)' })
  @ApiResponse({ status: 200, description: 'Course progress retrieved' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  getCourseProgress(@Param('id', ParseIntPipe) courseId: number, @CurrentUser() user: any) {
    const userId = user.userId || user.sub || user.id;
    return this.studentService.getCourseProgress(userId, courseId);
  }

  @Get(':id/reviews')
  @Public()
  @SkipOwnership()
  @ApiOperation({ summary: 'Get course reviews' })
  @ApiResponse({ status: 200, description: 'Course reviews retrieved' })
  getCourseReviews(@Param('id', ParseIntPipe) courseId: number, @Query() query: any) {
    return this.coursesService.getCourseReviews(courseId, query);
  }

  @Post(':id/reviews')
  @ApiBearerAuth()
  @SkipOwnership()
  @ApiOperation({ summary: 'Submit course review' })
  @ApiResponse({ status: 201, description: 'Review submitted successfully' })
  submitCourseReview(
    @Param('id', ParseIntPipe) courseId: number,
    @CurrentUser() user: any,
    @Body() reviewDto: any,
  ) {
    const userId = user.userId || user.sub || user.id;
    return this.coursesService.submitReview(courseId, userId, reviewDto);
  }

  @Patch(':id/reviews/:reviewId')
  @ApiBearerAuth()
  @SkipOwnership()
  @ApiOperation({ summary: 'Update course review' })
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  updateCourseReview(
    @Param('id', ParseIntPipe) courseId: number,
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @CurrentUser() user: any,
    @Body() reviewDto: any,
  ) {
    const userId = user.userId || user.sub || user.id;
    return this.coursesService.updateReview(reviewId, userId, reviewDto);
  }

  @Delete(':id/reviews/:reviewId')
  @ApiBearerAuth()
  @SkipOwnership()
  @ApiOperation({ summary: 'Delete course review' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  deleteCourseReview(
    @Param('id', ParseIntPipe) courseId: number,
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @CurrentUser() user: any,
  ) {
    const userId = user.userId || user.sub || user.id;
    return this.coursesService.deleteReview(reviewId, userId);
  }

  @Post(':id/feature')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @SkipOwnership()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Feature a course' })
  @ApiResponse({ status: 200, description: 'Course featured successfully' })
  featureCourse(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.featureCourse(id, true);
  }

  @Delete(':id/feature')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @SkipOwnership()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unfeature a course' })
  @ApiResponse({ status: 200, description: 'Course unfeatured successfully' })
  unfeatureCourse(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.featureCourse(id, false);
  }

  @Get('statistics')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.INSTRUCTOR)
  @SkipOwnership()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get course statistics' })
  @ApiResponse({ status: 200, description: 'Course statistics retrieved' })
  getCourseStatistics(@CurrentUser() user: any) {
    const userId = user.userId || user.sub || user.id;
    const userRole = user.role;
    return this.coursesService.getStatistics(userId, userRole);
  }

  @Get('export/csv')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @SkipOwnership()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export courses to CSV' })
  @ApiResponse({ status: 200, description: 'CSV file generated' })
  async exportCoursesToCsv(@Res() res: Response, @Query() query: any) {
    const csv = await this.coursesService.exportToCsv(query);
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename=courses.csv');
    res.send(csv);
  }
}
