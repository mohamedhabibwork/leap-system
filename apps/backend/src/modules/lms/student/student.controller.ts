import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { StudentService } from './student.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  StudentDashboardDto,
  StudentActivityDto,
} from './dto/student-dashboard.dto';
import {
  StudentCourseProgressDto,
  DetailedCourseProgressDto,
} from './dto/student-course-progress.dto';
import {
  LearningStatsDto,
  PendingAssignmentDto,
  PendingQuizDto,
  AchievementDto,
} from './dto/student-stats.dto';
import {
  CourseRecommendationDto,
} from './dto/course-recommendation.dto';

@ApiTags('lms/student')
@Controller('lms/student')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get student dashboard overview' })
  @ApiResponse({ status: 200, type: StudentDashboardDto })
  async getDashboard(@Request() req: ExpressRequest & { user: { id: number } }) {
    const userId = req.user.id;
    return this.studentService.getDashboard(userId);
  }

  @Get('my-courses')
  @ApiOperation({ summary: 'Get student enrolled courses with progress' })
  @ApiResponse({ status: 200, type: [StudentCourseProgressDto] })
  async getMyCourses(@Request() req: ExpressRequest & { user: { id: number } }) {
    const userId = req.user.id;
    return this.studentService.getMyCourses(userId);
  }

  @Get('assignments/pending')
  @ApiOperation({ summary: 'Get student pending assignments' })
  @ApiResponse({ status: 200, type: [PendingAssignmentDto] })
  async getPendingAssignments(@Request() req: ExpressRequest & { user: { id: number } }) {
    const userId = req.user.id;
    return this.studentService.getPendingAssignments(userId);
  }

  @Get('quizzes/pending')
  @ApiOperation({ summary: 'Get student pending quizzes' })
  @ApiResponse({ status: 200, type: [PendingQuizDto] })
  async getPendingQuizzes(@Request() req: ExpressRequest & { user: { id: number } }) {
    const userId = req.user.id;
    return this.studentService.getPendingQuizzes(userId);
  }

  @Get('progress/:courseId')
  @ApiOperation({ summary: 'Get detailed progress for a course' })
  @ApiResponse({ status: 200, type: DetailedCourseProgressDto })
  async getCourseProgress(
    @Request() req: ExpressRequest & { user: { id: number } },
    @Param('courseId', ParseIntPipe) courseId: number
  ) {
    const userId = req.user.id;
    return this.studentService.getCourseProgress(userId, courseId);
  }

  @Get('recommendations')
  @ApiOperation({ summary: 'Get course recommendations' })
  @ApiResponse({ status: 200, type: [CourseRecommendationDto] })
  async getRecommendations(@Request() req: ExpressRequest & { user: { id: number } }) {
    const userId = req.user.id;
    return this.studentService.getRecommendations(userId);
  }

  @Get('achievements')
  @ApiOperation({ summary: 'Get student achievements and certificates' })
  @ApiResponse({ status: 200, type: [AchievementDto] })
  async getAchievements(@Request() req: ExpressRequest & { user: { id: number } }) {
    const userId = req.user.id;
    return this.studentService.getAchievements(userId);
  }

  @Get('learning-stats')
  @ApiOperation({ summary: 'Get student learning statistics' })
  @ApiResponse({ status: 200, type: LearningStatsDto })
  async getLearningStats(@Request() req: ExpressRequest & { user: { id: number } }) {
    const userId = req.user.id;
    return this.studentService.getLearningStats(userId);
  }
}
