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
import { CourseAccessGuard } from '../../../common/guards/course-access.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RequiresCourseAccess } from '../../../common/decorators/subscription.decorator';
import { Role } from '../../../common/enums/roles.enum';
import { Res } from '@nestjs/common';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { existsSync } from 'fs';

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

  @Get(':id/download')
  @UseGuards(CourseAccessGuard)
  @RequiresCourseAccess()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.INSTRUCTOR, Role.STUDENT)
  @ApiOperation({ summary: 'Download resource file (requires course access)' })
  @ApiResponse({ status: 200, description: 'Resource file' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async downloadResource(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Res() res: Response,
  ) {
    const userId = req.user.id;
    
    // Check access permission
    const hasAccess = await this.resourcesService.checkAccessPermission(userId, id);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have permission to download this resource');
    }

    const resource = await this.resourcesService.findOne(id);
    
    if (!resource.fileUrl) {
      throw new NotFoundException('Resource file not found');
    }

    // Track download
    await this.resourcesService.trackDownload(id, userId);

    // If fileUrl is a local path, serve it directly
    if (existsSync(resource.fileUrl)) {
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${resource.fileName || 'resource'}"`);
      const fileStream = createReadStream(resource.fileUrl);
      fileStream.pipe(res);
    } else {
      // If it's a URL, redirect to it
      res.redirect(resource.fileUrl);
    }
  }

  @Post(':id/track-download')
  @UseGuards(CourseAccessGuard)
  @RequiresCourseAccess()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.INSTRUCTOR, Role.STUDENT)
  @ApiOperation({ summary: 'Track resource download (requires course access)' })
  @ApiResponse({ status: 200, description: 'Download tracked' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async trackDownload(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user.id;
    
    // Check access permission
    const hasAccess = await this.resourcesService.checkAccessPermission(userId, id);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return this.resourcesService.trackDownload(id, userId);
  }
}
