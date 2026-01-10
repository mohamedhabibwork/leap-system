import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseIntPipe, Request } from '@nestjs/common';
import { AdsService } from './ads.service';
import { AdQueryDto } from './dto';
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
}
