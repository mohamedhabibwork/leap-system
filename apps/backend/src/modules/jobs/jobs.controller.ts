import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { AdminJobQueryDto } from './dto/admin-job-query.dto';
import { BulkJobOperationDto } from './dto/bulk-job-operation.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new job posting' })
  create(@Body() createJobDto: CreateJobDto, @CurrentUser() user: any) {
    return this.jobsService.create(createJobDto, user.userId);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all jobs with pagination and filtering' })
  findAll(@Query() query: AdminJobQueryDto) {
    return this.jobsService.findAllAdmin(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get job statistics' })
  getStatistics() {
    return this.jobsService.getStatistics();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get job by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.jobsService.findOne(id);
  }

  @Post(':id/apply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply for a job' })
  apply(@Param('id', ParseIntPipe) id: number, @Body() applicationData: any, @CurrentUser() user: any) {
    return this.jobsService.applyForJob(id, user.userId, applicationData);
  }

  @Get(':id/applications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get job applications' })
  getApplications(@Param('id', ParseIntPipe) id: number, @Query() query: any) {
    return this.jobsService.getApplications(id, query);
  }

  @Post(':id/feature')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Feature a job' })
  feature(@Param('id', ParseIntPipe) id: number) {
    return this.jobsService.setFeatured(id, true);
  }

  @Delete(':id/feature')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unfeature a job' })
  unfeature(@Param('id', ParseIntPipe) id: number) {
    return this.jobsService.setFeatured(id, false);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update job' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateJobDto: UpdateJobDto, @CurrentUser() user: any) {
    return this.jobsService.update(id, updateJobDto, user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete job' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.jobsService.remove(id, user.userId);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Perform bulk operations on jobs' })
  bulkOperation(@Body() dto: BulkJobOperationDto) {
    return this.jobsService.bulkOperation(dto);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export jobs to CSV' })
  export(@Query() query: AdminJobQueryDto) {
    return this.jobsService.exportToCsv(query);
  }
}
