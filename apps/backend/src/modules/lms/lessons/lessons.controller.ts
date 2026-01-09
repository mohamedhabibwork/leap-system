import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { EnrollmentCheckGuard } from '../../../common/guards/enrollment-check.guard';
import { LessonAccessCheckDto } from './dto/lesson-access.dto';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('lms/lessons')
@Controller('lms/lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard, EnrollmentCheckGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get lesson details (with enrollment check)' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lessonsService.findOne(id);
  }

  @Get(':id/access-check')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if user has access to a lesson' })
  async checkAccess(
    @Param('id', ParseIntPipe) id: number,
    @Request() req
  ): Promise<LessonAccessCheckDto> {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const accessCheck = await this.lessonsService.checkLessonAccess(id, userId, userRole);
    
    return {
      lessonId: id,
      ...accessCheck,
    };
  }

  @Get('course/:courseId')
  @Public()
  @ApiOperation({ summary: 'Get all lessons for a course with access flags' })
  async getCourseLessons(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Request() req
  ) {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    
    return this.lessonsService.getCourseLessons(courseId, userId, userRole);
  }
}
