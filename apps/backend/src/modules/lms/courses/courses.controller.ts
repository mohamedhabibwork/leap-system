import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ResourceOwnerGuard } from '../../../common/guards/resource-owner.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { ResourceType, SkipOwnership } from '../../../common/decorators/resource-type.decorator';
import { Role } from '../../../common/enums/roles.enum';

/**
 * Courses Controller
 * Handles all course-related endpoints with proper RBAC and ownership verification
 */
@ApiTags('lms/courses')
@Controller('lms/courses')
@UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles(Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  @Public()
  @SkipOwnership()
  @ApiOperation({ summary: 'Get all courses (public)' })
  @ApiResponse({ status: 200, description: 'List of courses' })
  findAll(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('sort') sort?: string,
  ) {
    return this.coursesService.findAll(page, limit, sort);
  }

  @Get('published')
  @Public()
  @SkipOwnership()
  @ApiOperation({ summary: 'Get published courses only' })
  @ApiResponse({ status: 200, description: 'List of published courses' })
  findPublished() {
    return this.coursesService.findPublished();
  }

  @Get(':id')
  @Public()
  @ResourceType('course')
  @ApiOperation({ summary: 'Get course by ID (public for published, restricted for drafts)' })
  @ApiResponse({ status: 200, description: 'Course details' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ResourceType('course')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update course (owner or admin only)' })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  @ApiResponse({ status: 403, description: 'Not the course owner' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ResourceType('course')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete course (admin only)' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.remove(id);
  }
}
