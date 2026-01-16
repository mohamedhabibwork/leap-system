import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Query, Request } from '@nestjs/common';
import { AdCampaignsService } from './ad-campaigns.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('ads/campaigns')
@Controller('ads/campaigns')

@ApiBearerAuth()
export class AdCampaignsController {
  constructor(private readonly adCampaignsService: AdCampaignsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'instructor', 'user')
  @ApiOperation({ summary: 'Create a new campaign' })
  create(@Body() createCampaignDto: CreateCampaignDto, @Request() req) {
    return this.adCampaignsService.create(createCampaignDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all campaigns' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Request() req, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adCampaignsService.findAll(req.user.id, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get campaign details with ads' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adCampaignsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update campaign' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCampaignDto: UpdateCampaignDto, @Request() req) {
    const isAdmin = req.user.roles?.includes('admin');
    return this.adCampaignsService.update(id, updateCampaignDto, req.user.id, isAdmin);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete campaign' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const isAdmin = req.user.roles?.includes('admin');
    return this.adCampaignsService.remove(id, req.user.id, isAdmin);
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get campaign analytics' })
  getAnalytics(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const isAdmin = req.user.roles?.includes('admin');
    return this.adCampaignsService.getAnalytics(id, req.user.id, isAdmin);
  }
}
