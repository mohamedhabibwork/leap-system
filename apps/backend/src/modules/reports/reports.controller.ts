import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ReviewReportDto } from './dto/review-report.dto';
import { AdminReportQueryDto } from './dto/admin-report-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new report' })
  create(@Body() dto: CreateReportDto, @CurrentUser() user: any) {
    return this.reportsService.create(dto, user.userId || user.sub || user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all reports (admin only)' })
  findAll(@Query() query: AdminReportQueryDto) {
    return this.reportsService.findAllAdmin(query);
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get report statistics (admin only)' })
  getStatistics() {
    return this.reportsService.getStatistics();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get report by ID (admin only)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.findOne(id);
  }

  @Post(':id/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Review a report (admin only)' })
  review(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReviewReportDto,
    @CurrentUser() user: any,
  ) {
    return this.reportsService.review(id, dto, user.userId || user.sub || user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a report (admin only)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.remove(id);
  }
}
