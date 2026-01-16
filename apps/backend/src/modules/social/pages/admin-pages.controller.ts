import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PagesService } from './pages.service';
import { AdminPageQueryDto } from './dto/admin-page-query.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('admin/social-pages')
@Controller('admin/social-pages')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
@ApiBearerAuth()
export class AdminPagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all social pages (admin view) with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'createdBy', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, type: String, enum: ['asc', 'desc'] })
  findAll(@Query() query: AdminPageQueryDto) {
    return this.pagesService.findAllAdmin(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get social pages statistics' })
  getStatistics() {
    return this.pagesService.getStatistics();
  }
}
