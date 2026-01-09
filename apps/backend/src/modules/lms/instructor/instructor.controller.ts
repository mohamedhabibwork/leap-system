import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import {
  InstructorDashboardDto,
  CourseStatsDto,
  StudentProgressDto,
  CourseAnalyticsDto,
} from './dto/instructor-dashboard.dto';

@ApiTags('lms/instructor')
@Controller('lms/instructor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('instructor', 'admin')
@ApiBearerAuth()
export class InstructorController {
  constructor(private readonly instructorService: InstructorService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get instructor dashboard overview' })
  @ApiResponse({ status: 200, type: InstructorDashboardDto })
  async getDashboard(@Request() req) {
    const instructorId = req.user.id;
    return this.instructorService.getDashboard(instructorId);
  }

  @Get('courses')
  @ApiOperation({ summary: 'Get all courses for instructor with stats' })
  @ApiResponse({ status: 200, type: [CourseStatsDto] })
  async getCourses(@Request() req) {
    const instructorId = req.user.id;
    return this.instructorService.getInstructorCourses(instructorId);
  }

  @Get('courses/:id/students')
  @ApiOperation({ summary: 'Get enrolled students for a course' })
  @ApiResponse({ status: 200, type: [StudentProgressDto] })
  async getCourseStudents(
    @Request() req,
    @Param('id', ParseIntPipe) courseId: number
  ) {
    const instructorId = req.user.id;
    return this.instructorService.getCourseStudents(instructorId, courseId);
  }

  @Get('courses/:id/analytics')
  @ApiOperation({ summary: 'Get course analytics' })
  @ApiResponse({ status: 200, type: CourseAnalyticsDto })
  async getCourseAnalytics(
    @Request() req,
    @Param('id', ParseIntPipe) courseId: number
  ) {
    const instructorId = req.user.id;
    return this.instructorService.getCourseAnalytics(instructorId, courseId);
  }

  @Get('sessions/upcoming')
  @ApiOperation({ summary: 'Get upcoming scheduled sessions' })
  async getUpcomingSessions(@Request() req) {
    const instructorId = req.user.id;
    return this.instructorService.getUpcomingSessions(instructorId);
  }

  @Get('sessions/calendar')
  @ApiOperation({ summary: 'Get all sessions for calendar view' })
  async getCalendarSessions(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const instructorId = req.user.id;
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.instructorService.getCalendarSessions(instructorId, start, end);
  }

  @Get('assignments/pending')
  @ApiOperation({ summary: 'Get pending assignments to grade' })
  async getPendingAssignments(@Request() req) {
    const instructorId = req.user.id;
    return this.instructorService.getPendingAssignments(instructorId);
  }

  @Get('quizzes/attempts')
  @ApiOperation({ summary: 'Get recent quiz attempts' })
  async getQuizAttempts(@Request() req) {
    const instructorId = req.user.id;
    return this.instructorService.getQuizAttempts(instructorId);
  }
}
