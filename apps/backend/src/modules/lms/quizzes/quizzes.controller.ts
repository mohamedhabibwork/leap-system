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
  Patch,
  Delete,
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { ReviewAttemptDto } from './dto/review-attempt.dto';
import { AddQuestionsToQuizDto } from './dto/add-questions.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/roles.enum';

@ApiTags('lms/quizzes')
@Controller('lms/quizzes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'Create a new quiz' })
  @ApiResponse({ status: 201, description: 'Quiz created successfully' })
  async create(@Body() dto: any) {
    return this.quizzesService.create(dto);
  }

  @Get('section/:sectionId')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'Get quizzes by section' })
  @ApiResponse({ status: 200, description: 'List of section quizzes' })
  async findBySection(@Param('sectionId', ParseIntPipe) sectionId: number) {
    return this.quizzesService.findBySection(sectionId);
  }

  @Get('lesson/:lessonId')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'Get quizzes by lesson' })
  @ApiResponse({ status: 200, description: 'List of lesson quizzes' })
  async findByLesson(@Param('lessonId', ParseIntPipe) lessonId: number) {
    return this.quizzesService.findByLesson(lessonId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'Get quiz details' })
  @ApiResponse({ status: 200, description: 'Quiz details' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.quizzesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'Update quiz' })
  @ApiResponse({ status: 200, description: 'Quiz updated successfully' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.quizzesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'Delete quiz' })
  @ApiResponse({ status: 200, description: 'Quiz deleted successfully' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.quizzesService.remove(id);
    return { message: 'Quiz deleted successfully' };
  }

  @Post(':id/questions')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'Add questions to quiz' })
  @ApiResponse({ status: 200, description: 'Questions added successfully' })
  async addQuestions(@Param('id', ParseIntPipe) id: number, @Body() dto: AddQuestionsToQuizDto) {
    return this.quizzesService.addQuestionsToQuiz(id, dto);
  }

  @Get(':id/questions')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'Get quiz questions' })
  @ApiResponse({ status: 200, description: 'List of quiz questions' })
  async getQuestions(@Param('id', ParseIntPipe) id: number) {
    return this.quizzesService.getQuizQuestions(id);
  }

  @Delete(':id/questions/:questionId')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'Remove question from quiz' })
  @ApiResponse({ status: 200, description: 'Question removed successfully' })
  async removeQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Param('questionId', ParseIntPipe) questionId: number,
  ) {
    return this.quizzesService.removeQuestionFromQuiz(id, questionId);
  }

  @Get(':id/attempts')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'Get all attempts for a quiz' })
  getQuizAttempts(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const instructorId = req.user.id;
    return this.quizzesService.getQuizAttempts(id, instructorId);
  }

  @Get('attempts/:id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'Get detailed attempt information' })
  getAttemptDetails(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const instructorId = req.user.id;
    return this.quizzesService.getAttemptDetails(id, instructorId);
  }

  @Post('attempts/:id/review')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.INSTRUCTOR)
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
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'Get all quiz attempts for instructor courses' })
  getAllAttempts(@Request() req, @Query('courseId') courseId?: string) {
    const instructorId = req.user.id;
    const parsedCourseId = courseId ? parseInt(courseId) : undefined;
    return this.quizzesService.getAllAttempts(instructorId, parsedCourseId);
  }
}
