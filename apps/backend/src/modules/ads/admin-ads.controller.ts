import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseIntPipe, Request, Patch, Delete } from '@nestjs/common';
import { AdsService } from './ads.service';
import { AdQueryDto, CreateAdDto, UpdateAdDto } from './dto';
import { BulkAdOperationDto } from './dto/bulk-ad-operation.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('admin/ads')
@Controller('admin/ads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class AdminAdsController {
  constructor(private readonly adsService: AdsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new ad (admin)' })
  create(@Body() createAdDto: CreateAdDto, @Request() req) {
    return this.adsService.create(createAdDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all ads (admin view) with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'statusId', required: false, type: Number })
  @ApiQuery({ name: 'adTypeId', required: false, type: Number })
  @ApiQuery({ name: 'campaignId', required: false, type: Number })
  findAll(@Query() query: AdQueryDto) {
    return this.adsService.findAllAdmin(query);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get ads pending review' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getPending(@Query() query: AdQueryDto) {
    return this.adsService.getPendingAds(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get platform-wide ad statistics' })
  getStatistics() {
    return this.adsService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ad by ID (admin)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update ad (admin)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateAdDto: UpdateAdDto, @Request() req) {
    return this.adsService.update(id, updateAdDto, req.user.id, true);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete ad (admin)' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.adsService.remove(id, req.user.id, true);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve a pending ad' })
  approve(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.adsService.approveAd(id, req.user.id);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject a pending ad with optional reason' })
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason: string | undefined,
    @Request() req
  ) {
    return this.adsService.rejectAd(id, req.user.id, reason);
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Pause an ad (admin)' })
  pause(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.adsService.pause(id, req.user.id, true);
  }

  @Post(':id/resume')
  @ApiOperation({ summary: 'Resume a paused ad (admin)' })
  resume(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.adsService.resume(id, req.user.id, true);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Perform bulk operations on ads' })
  bulkOperation(@Body() dto: BulkAdOperationDto, @Request() req) {
    return this.adsService.bulkOperation(dto, req.user.id);
  }
}
