import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CourseAccessGuard } from '../../../common/guards/course-access.guard';
import { RequiresCourseAccess } from '../../../common/decorators/subscription.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ProgressService, TrackLessonProgressDto } from './progress.service';

@ApiTags('lms/progress')
@Controller('lms/progress')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('lessons/:id')
  @UseGuards(CourseAccessGuard)
  @RequiresCourseAccess()
  @ApiOperation({ summary: 'Track lesson progress' })
  @ApiResponse({ status: 200, description: 'Progress tracked successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Lesson or enrollment not found' })
  async trackLessonProgress(
    @Param('id', ParseIntPipe) lessonId: number,
    @CurrentUser() user: any,
    @Body() data: TrackLessonProgressDto,
  ) {
    const userId = user.userId || user.sub || user.id;
    await this.progressService.trackLessonProgress(userId, lessonId, data);
    return { message: 'Progress tracked successfully' };
  }

  @Get('courses/:id')
  @UseGuards(CourseAccessGuard)
  @RequiresCourseAccess()
  @ApiOperation({ summary: 'Get course progress' })
  @ApiResponse({ status: 200, description: 'Course progress retrieved' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  async getCourseProgress(
    @Param('id', ParseIntPipe) courseId: number,
    @CurrentUser() user: any,
  ) {
    const userId = user.userId || user.sub || user.id;
    return this.progressService.getCourseProgress(userId, courseId);
  }

  @Get('lessons/:id')
  @UseGuards(CourseAccessGuard)
  @RequiresCourseAccess()
  @ApiOperation({ summary: 'Get lesson progress' })
  @ApiResponse({ status: 200, description: 'Lesson progress retrieved' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getLessonProgress(
    @Param('id', ParseIntPipe) lessonId: number,
    @CurrentUser() user: any,
  ) {
    const userId = user.userId || user.sub || user.id;
    return this.progressService.getLessonProgress(userId, lessonId);
  }
}
