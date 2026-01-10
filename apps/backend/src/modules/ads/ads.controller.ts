import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Query, Request } from '@nestjs/common';
import { AdsService } from './ads.service';
import { AdsTargetingService } from './ads-targeting.service';
import { CreateAdDto, UpdateAdDto, AdQueryDto, GetActiveAdsDto } from './dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('ads')
@Controller('ads')
export class AdsController {
  constructor(
    private readonly adsService: AdsService,
    private readonly adsTargetingService: AdsTargetingService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor', 'user')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new ad (requires active subscription)' })
  create(@Body() createAdDto: CreateAdDto, @Request() req) {
    return this.adsService.create(createAdDto, req.user.id);
  }

  @Get('active')
  @Public()
  @ApiOperation({ 
    summary: 'Get active ads for display (public endpoint)',
    description: 'Returns active ads filtered by placement code (if provided). Supports optional user targeting when authenticated.'
  })
  @ApiQuery({ name: 'placement', required: false, description: 'Placement code to filter ads by (e.g., "sidebar", "banner", "modal")' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Maximum number of ads to return (default: 3)' })
  async getActiveAds(
    @Query() query: GetActiveAdsDto,
    @Request() req?: any,
  ) {
    const { placement, limit = 3 } = query;

    // If placement code is provided, use targeting service for better ad selection
    if (placement) {
      // Build user profile from request if user is authenticated
      let userProfile;
      if (req?.user) {
        userProfile = {
          id: req.user.id,
          role: req.user.roles?.[0] || req.user.role,
          subscriptionPlanId: req.user.subscriptionPlanId,
          // Additional profile data can be fetched if needed
        };
      }

      return this.adsTargetingService.getTargetedAds(placement, userProfile, limit);
    }

    // Fallback to simple active ads query when no placement is specified
    return this.adsService.getActiveAds(undefined, limit);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all ads (user sees their own ads)' })
  findAll(@Query() query: AdQueryDto, @Request() req) {
    return this.adsService.findAll(query, req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get single ad details' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update ad' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateAdDto: UpdateAdDto, @Request() req) {
    const isAdmin = req.user.roles?.includes('admin');
    return this.adsService.update(id, updateAdDto, req.user.id, isAdmin);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete ad (soft delete)' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const isAdmin = req.user.roles?.includes('admin');
    return this.adsService.remove(id, req.user.id, isAdmin);
  }

  @Post(':id/pause')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pause ad' })
  pause(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const isAdmin = req.user.roles?.includes('admin');
    return this.adsService.pause(id, req.user.id, isAdmin);
  }

  @Post(':id/resume')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resume paused ad' })
  resume(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const isAdmin = req.user.roles?.includes('admin');
    return this.adsService.resume(id, req.user.id, isAdmin);
  }

  @Get(':id/analytics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get ad analytics' })
  getAnalytics(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const isAdmin = req.user.roles?.includes('admin');
    return this.adsService.getAnalytics(id, req.user.id, isAdmin);
  }
}
