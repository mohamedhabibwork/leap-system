import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { ReviewAttemptDto } from './dto/review-attempt.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('lms/quizzes')
@Controller('lms/quizzes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('instructor', 'admin')
@ApiBearerAuth()
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get(':id/attempts')
  @ApiOperation({ summary: 'Get all attempts for a quiz' })
  getQuizAttempts(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const instructorId = req.user.id;
    return this.quizzesService.getQuizAttempts(id, instructorId);
  }

  @Get('attempts/:id')
  @ApiOperation({ summary: 'Get detailed attempt information' })
  getAttemptDetails(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const instructorId = req.user.id;
    return this.quizzesService.getAttemptDetails(id, instructorId);
  }

  @Post('attempts/:id/review')
  @ApiOperation({ summary: 'Add review/feedback to quiz attempt' })
  reviewAttempt(
    @Param('id', ParseIntPipe) id: number,
    @Body() reviewDto: ReviewAttemptDto,
    @Request() req
  ) {
    const instructorId = req.user.id;
    return this.quizzesService.reviewAttempt(id, reviewDto, instructorId);
  }

  @Get('attempts')
  @ApiOperation({ summary: 'Get all quiz attempts for instructor courses' })
  getAllAttempts(@Request() req, @Query('courseId') courseId?: string) {
    const instructorId = req.user.id;
    const parsedCourseId = courseId ? parseInt(courseId) : undefined;
    return this.quizzesService.getAllAttempts(instructorId, parsedCourseId);
  }
}
