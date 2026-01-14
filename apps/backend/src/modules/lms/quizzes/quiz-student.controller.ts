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
}
