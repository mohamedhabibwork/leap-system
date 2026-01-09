import { Controller, Post, Body, Get, Param, Query, ParseIntPipe, Req } from '@nestjs/common';
import { AdsTrackingService } from './ads-tracking.service';
import { TrackImpressionDto, TrackClickDto, BulkTrackImpressionDto } from './dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { Request } from 'express';

@ApiTags('ads/tracking')
@Controller('ads/tracking')
@Public()
export class AdsTrackingController {
  constructor(private readonly trackingService: AdsTrackingService) {}

  @Post('impression')
  @ApiOperation({ summary: 'Track a single ad impression' })
  trackImpression(@Body() dto: TrackImpressionDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    return this.trackingService.trackImpression(dto, ipAddress, userAgent);
  }

  @Post('impressions/bulk')
  @ApiOperation({ summary: 'Track multiple ad impressions at once' })
  trackBulkImpressions(@Body() dto: BulkTrackImpressionDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    return this.trackingService.trackBulkImpressions(dto, ipAddress, userAgent);
  }

  @Post('click')
  @ApiOperation({ summary: 'Track an ad click' })
  trackClick(@Body() dto: TrackClickDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    return this.trackingService.trackClick(dto, ipAddress, userAgent);
  }

  @Get('analytics/:adId')
  @ApiOperation({ summary: 'Get analytics for a specific ad' })
  getAnalytics(
    @Param('adId', ParseIntPipe) adId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.trackingService.getAdAnalytics(adId, start, end);
  }
}
