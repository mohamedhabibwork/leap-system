import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { ReorderSectionsDto } from './dto/reorder-sections.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/roles.enum';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser, getUserId } from '../../../common/types/request.types';

@ApiTags('lms/sections')
@Controller('lms/sections')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  @Roles(Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new course section' })
  @ApiResponse({ status: 201, description: 'Section created successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  create(@Body() createSectionDto: CreateSectionDto, @CurrentUser() user: AuthenticatedUser) {
    const userId = getUserId(user);
    const userRole = user.role || '';
    return this.sectionsService.create(createSectionDto, userId, userRole);
  }

  @Get('course/:courseId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all sections for a course' })
  @ApiResponse({ status: 200, description: 'List of sections' })
  findAll(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.sectionsService.findAll(courseId);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a section by ID' })
  @ApiResponse({ status: 200, description: 'Section details' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sectionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a section' })
  @ApiResponse({ status: 200, description: 'Section updated successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSectionDto: UpdateSectionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const userId = getUserId(user);
    const userRole = user.role || '';
    return this.sectionsService.update(id, updateSectionDto, userId, userRole);
  }

  @Delete(':id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a section' })
  @ApiResponse({ status: 200, description: 'Section deleted successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    const userId = getUserId(user);
    const userRole = user.role || '';
    return this.sectionsService.remove(id, userId, userRole);
  }

  @Patch('course/:courseId/reorder')
  @Roles(Role.INSTRUCTOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder sections in a course' })
  @ApiResponse({ status: 200, description: 'Sections reordered successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  reorder(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() reorderDto: ReorderSectionsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const userId = getUserId(user);
    const userRole = user.role || '';
    return this.sectionsService.reorder(courseId, reorderDto, userId, userRole);
  }
}
