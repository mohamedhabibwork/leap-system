import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/roles.enum';

@ApiTags('lms/quizzes/student')
@Controller('lms/quizzes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class QuizStudentController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post(':id/start')
  @Roles(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Start a quiz attempt' })
  @ApiResponse({ status: 201, description: 'Quiz attempt started' })
  @ApiResponse({ status: 400, description: 'Maximum attempts reached' })
  @ApiResponse({ status: 403, description: 'Not enrolled in course' })
  async startQuiz(@Param('id', ParseIntPipe) quizId: number, @Request() req) {
    return this.quizzesService.startQuizAttempt(quizId, req.user.id);
  }

  @Get(':id/questions')
  @Roles(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get quiz questions for taking' })
  @ApiResponse({ status: 200, description: 'Quiz questions' })
  @ApiResponse({ status: 400, description: 'No active attempt found' })
  async getQuestions(@Param('id', ParseIntPipe) quizId: number, @Request() req) {
    return this.quizzesService.getQuizQuestionsForTaking(quizId, req.user.id);
  }

  @Post('attempts/:id/submit')
  @Roles(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Submit quiz answers' })
  @ApiResponse({ status: 200, description: 'Quiz submitted successfully' })
  @ApiResponse({ status: 400, description: 'Quiz already submitted' })
  async submitQuiz(@Param('id', ParseIntPipe) attemptId: number, @Body() dto: SubmitQuizDto, @Request() req) {
    // Override attemptId from path param
    dto.attemptId = attemptId;
    return this.quizzesService.submitQuizAttempt(dto, req.user.id);
  }

  @Get('attempts/:id/result')
  @Roles(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get quiz attempt result' })
  @ApiResponse({ status: 200, description: 'Quiz result' })
  @ApiResponse({ status: 404, description: 'Attempt not found' })
  async getResult(@Param('id', ParseIntPipe) attemptId: number, @Request() req) {
    return this.quizzesService.getStudentQuizResult(attemptId, req.user.id);
  }

  @Get('my-attempts')
  @Roles(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get my quiz attempts' })
  @ApiResponse({ status: 200, description: 'List of quiz attempts' })
  async getMyAttempts(@Request() req) {
    return this.quizzesService.getStudentQuizAttempts(req.user.id);
  }

  @Post('attempts/:id/pause')
  @Roles(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Pause a quiz attempt' })
  @ApiResponse({ status: 200, description: 'Quiz attempt paused' })
  @ApiResponse({ status: 404, description: 'Active attempt not found' })
  async pauseAttempt(@Param('id', ParseIntPipe) attemptId: number, @Request() req) {
    await this.quizzesService.pauseAttempt(attemptId, req.user.id);
    return { message: 'Quiz attempt paused' };
  }

  @Post('attempts/:id/resume')
  @Roles(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Resume a paused quiz attempt' })
  @ApiResponse({ status: 200, description: 'Quiz attempt resumed' })
  @ApiResponse({ status: 404, description: 'Active attempt not found' })
  async resumeAttempt(@Param('id', ParseIntPipe) attemptId: number, @Request() req) {
    await this.quizzesService.resumeAttempt(attemptId, req.user.id);
    return { message: 'Quiz attempt resumed' };
  }

  @Get('attempts/:id/time-remaining')
  @Roles(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get remaining time for quiz attempt' })
  @ApiResponse({ status: 200, description: 'Time remaining in seconds' })
  @ApiResponse({ status: 404, description: 'Active attempt not found' })
  async getTimeRemaining(@Param('id', ParseIntPipe) attemptId: number, @Request() req) {
    const timeRemaining = await this.quizzesService.getTimeRemaining(attemptId, req.user.id);
    return { timeRemaining };
  }

  @Post('attempts/:id/flag/:questionId')
  @Roles(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Flag a question for review' })
  @ApiResponse({ status: 200, description: 'Question flagged for review' })
  @ApiResponse({ status: 404, description: 'Active attempt not found' })
  async flagQuestion(
    @Param('id', ParseIntPipe) attemptId: number,
    @Param('questionId', ParseIntPipe) questionId: number,
    @Request() req,
  ) {
    await this.quizzesService.flagForReview(attemptId, questionId, req.user.id);
    return { message: 'Question flagged for review' };
  }
}
