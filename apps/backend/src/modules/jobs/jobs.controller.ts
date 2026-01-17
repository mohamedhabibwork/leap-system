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
import { AuthenticatedUser, getUserId } from '../../common/types/request.types';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new job posting' })
  create(@Body() createJobDto: CreateJobDto, @CurrentUser() user: AuthenticatedUser) {
    return this.jobsService.create(createJobDto, getUserId(user));
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

  @Post('bulk')
  
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

  @Get('my-jobs')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my posted jobs' })
  getMyJobs(@CurrentUser() user: AuthenticatedUser, @Query() query: any) {
    return this.jobsService.findByUser(getUserId(user), query);
  }

  @Get('my-applications')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my job applications' })
  getMyApplications(@CurrentUser() user: AuthenticatedUser, @Query() query: any) {
    return this.jobsService.findApplicationsByUser(getUserId(user), query);
  }

  @Get('saved')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get saved jobs' })
  getSavedJobs(@CurrentUser() user: AuthenticatedUser, @Query() query: any) {
    return this.jobsService.findSavedJobs(getUserId(user), query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get job by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.jobsService.findOne(id);
  }

  @Post(':id/apply')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply for a job' })
  apply(@Param('id', ParseIntPipe) id: number, @Body() applicationData: any, @CurrentUser() user: AuthenticatedUser) {
    return this.jobsService.applyForJob(id, getUserId(user), applicationData);
  }

  @Get(':id/applications')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get job applications' })
  getApplications(@Param('id', ParseIntPipe) id: number, @Query() query: any) {
    return this.jobsService.getApplications(id, query);
  }

  @Post(':id/feature')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Feature a job' })
  feature(@Param('id', ParseIntPipe) id: number) {
    return this.jobsService.setFeatured(id, true);
  }

  @Delete(':id/feature')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unfeature a job' })
  unfeature(@Param('id', ParseIntPipe) id: number) {
    return this.jobsService.setFeatured(id, false);
  }

  @Patch(':id')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update job' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateJobDto: UpdateJobDto, @CurrentUser() user: AuthenticatedUser) {
    return this.jobsService.update(id, updateJobDto, getUserId(user));
  }

  @Delete(':id')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete job' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.jobsService.remove(id, getUserId(user));
  }

  @Post(':id/save')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save a job' })
  saveJob(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.jobsService.saveJob(id, getUserId(user));
  }

  @Delete(':id/save')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unsave a job' })
  unsaveJob(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.jobsService.unsaveJob(id, getUserId(user));
  }
}
