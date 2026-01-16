import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { EnrollmentCheckGuard } from '../../../common/guards/enrollment-check.guard';
import { LessonAccessCheckDto } from './dto/lesson-access.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/roles.enum';

@ApiTags('lms/lessons')
@Controller('lms/lessons')
@UseGuards(JwtAuthGuard)
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

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new lesson' })
  @ApiResponse({ status: 201, description: 'Lesson created successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  create(@Body() createLessonDto: CreateLessonDto, @Request() req: any) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    return this.lessonsService.create(createLessonDto, userId);
  }

  @Get('section/:sectionId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all lessons for a section' })
  @ApiResponse({ status: 200, description: 'List of lessons' })
  findAll(@Param('sectionId', ParseIntPipe) sectionId: number) {
    return this.lessonsService.findAll(sectionId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a lesson' })
  @ApiResponse({ status: 200, description: 'Lesson updated successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLessonDto: UpdateLessonDto,
    @Request() req: any,
  ) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    return this.lessonsService.update(id, updateLessonDto, userId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a lesson' })
  @ApiResponse({ status: 200, description: 'Lesson deleted successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    return this.lessonsService.remove(id, userId);
  }
}
