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
} from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/roles.enum';

@ApiTags('lms/resources')
@Controller('lms/resources')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'Create a new resource' })
  @ApiResponse({ status: 201, description: 'Resource created successfully' })
  async create(@Body() dto: CreateResourceDto, @Request() req) {
    const isAdmin = [Role.ADMIN, Role.SUPER_ADMIN].includes(req.user.role);
    return this.resourcesService.create(dto, req.user.id, isAdmin);
  }

  @Get('course/:courseId')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.INSTRUCTOR, Role.STUDENT)
  @ApiOperation({ summary: 'Get course-level resources' })
  @ApiResponse({ status: 200, description: 'List of course resources' })
  async findByCourse(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.resourcesService.findByCourse(courseId);
  }

  @Get('section/:sectionId')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.INSTRUCTOR, Role.STUDENT)
  @ApiOperation({ summary: 'Get section-level resources' })
  @ApiResponse({ status: 200, description: 'List of section resources' })
  async findBySection(@Param('sectionId', ParseIntPipe) sectionId: number) {
    return this.resourcesService.findBySection(sectionId);
  }

  @Get('lesson/:lessonId')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.INSTRUCTOR, Role.STUDENT)
  @ApiOperation({ summary: 'Get lesson-level resources' })
  @ApiResponse({ status: 200, description: 'List of lesson resources' })
  async findByLesson(@Param('lessonId', ParseIntPipe) lessonId: number) {
    return this.resourcesService.findByLesson(lessonId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.INSTRUCTOR, Role.STUDENT)
  @ApiOperation({ summary: 'Get a single resource' })
  @ApiResponse({ status: 200, description: 'Resource details' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.resourcesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'Update a resource' })
  @ApiResponse({ status: 200, description: 'Resource updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateResourceDto,
    @Request() req,
  ) {
    const isAdmin = [Role.ADMIN, Role.SUPER_ADMIN].includes(req.user.role);
    return this.resourcesService.update(id, dto, req.user.id, isAdmin);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'Delete a resource' })
  @ApiResponse({ status: 200, description: 'Resource deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const isAdmin = [Role.ADMIN, Role.SUPER_ADMIN].includes(req.user.role);
    await this.resourcesService.remove(id, req.user.id, isAdmin);
    return { message: 'Resource deleted successfully' };
  }

  @Post(':id/download')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.INSTRUCTOR, Role.STUDENT)
  @ApiOperation({ summary: 'Track resource download' })
  @ApiResponse({ status: 200, description: 'Download tracked' })
  async trackDownload(@Param('id', ParseIntPipe) id: number) {
    return this.resourcesService.trackDownload(id);
  }
}
