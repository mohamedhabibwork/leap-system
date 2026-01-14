import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { QuestionBankService } from './question-bank.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/roles.enum';

@ApiTags('lms/question-bank')
@Controller('lms/question-bank')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class QuestionBankController {
  constructor(private readonly questionBankService: QuestionBankService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'Create a new question with options' })
  @ApiResponse({ status: 201, description: 'Question created successfully' })
  async create(@Body() dto: CreateQuestionDto, @Request() req) {
    return this.questionBankService.create(dto, req.user.id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'Get all questions (with optional course filter)' })
  @ApiQuery({ name: 'courseId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of questions' })
  async findAll(@Request() req, @Query('courseId') courseId?: string) {
    const isAdmin = [Role.ADMIN, Role.SUPER_ADMIN].includes(req.user.role);
    const parsedCourseId = courseId ? parseInt(courseId) : undefined;
    return this.questionBankService.findAll(req.user.id, isAdmin, parsedCourseId);
  }

  @Get('general')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'Get general/shared questions (courseId = null)' })
  @ApiResponse({ status: 200, description: 'List of general questions' })
  async findGeneral() {
    return this.questionBankService.findGeneral();
  }

  @Get('course/:courseId')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'Get course-specific questions' })
  @ApiResponse({ status: 200, description: 'List of course questions' })
  async findByCourse(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.questionBankService.findByCourse(courseId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'Get a single question with options' })
  @ApiResponse({ status: 200, description: 'Question details' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.questionBankService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'Update a question' })
  @ApiResponse({ status: 200, description: 'Question updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateQuestionDto,
    @Request() req,
  ) {
    const isAdmin = [Role.ADMIN, Role.SUPER_ADMIN].includes(req.user.role);
    return this.questionBankService.update(id, dto, req.user.id, isAdmin);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'Delete a question (soft delete)' })
  @ApiResponse({ status: 200, description: 'Question deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const isAdmin = [Role.ADMIN, Role.SUPER_ADMIN].includes(req.user.role);
    await this.questionBankService.remove(id, req.user.id, isAdmin);
    return { message: 'Question deleted successfully' };
  }
}
