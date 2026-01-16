import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get system analytics' })
  @ApiQuery({ name: 'start', required: false, type: String, description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'end', required: false, type: String, description: 'End date (ISO string)' })
  async getSystemAnalytics(
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    const startDate = start ? new Date(start) : undefined;
    const endDate = end ? new Date(end) : undefined;
    return this.adminService.getSystemAnalytics(startDate, endDate);
  }

  @Get('analytics/user-growth')
  @ApiOperation({ summary: 'Get user growth analytics' })
  @ApiQuery({ name: 'start', required: false, type: String, description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'end', required: false, type: String, description: 'End date (ISO string)' })
  @ApiQuery({ name: 'preset', required: false, type: String, description: 'Time preset (day, week, month, year)' })
  async getUserGrowthAnalytics(
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('preset') preset?: string,
  ) {
    const startDate = start ? new Date(start) : undefined;
    const endDate = end ? new Date(end) : undefined;
    return this.adminService.getUserGrowthAnalytics(startDate, endDate, preset);
  }

  @Get('analytics/engagement')
  @ApiOperation({ summary: 'Get engagement metrics' })
  @ApiQuery({ name: 'start', required: false, type: String, description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'end', required: false, type: String, description: 'End date (ISO string)' })
  @ApiQuery({ name: 'preset', required: false, type: String, description: 'Time preset (day, week, month, year)' })
  async getEngagementMetrics(
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('preset') preset?: string,
  ) {
    const startDate = start ? new Date(start) : undefined;
    const endDate = end ? new Date(end) : undefined;
    return this.adminService.getEngagementMetrics(startDate, endDate, preset);
  }

  @Get('analytics/revenue')
  @ApiOperation({ summary: 'Get revenue analytics' })
  @ApiQuery({ name: 'start', required: false, type: String, description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'end', required: false, type: String, description: 'End date (ISO string)' })
  @ApiQuery({ name: 'preset', required: false, type: String, description: 'Time preset (day, week, month, year)' })
  async getRevenueAnalytics(
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('preset') preset?: string,
  ) {
    const startDate = start ? new Date(start) : undefined;
    const endDate = end ? new Date(end) : undefined;
    return this.adminService.getRevenueAnalytics(startDate, endDate, preset);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get users with pagination (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Items per page' })
  async getUsers(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 20;
    return this.adminService.getUsers(pageNum, pageSizeNum);
  }
}
