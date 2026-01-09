import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreatePlanDto, UpdatePlanDto, CreatePlanFeatureDto } from './dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('plans')
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new plan (Admin only)' })
  @ApiResponse({ status: 201, description: 'Plan created successfully' })
  create(@Body() createPlanDto: CreatePlanDto) {
    return this.plansService.create(createPlanDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all plans' })
  @ApiResponse({ status: 200, description: 'Plans retrieved successfully' })
  findAll() {
    return this.plansService.findAll();
  }

  @Get('active')
  @Public()
  @ApiOperation({ summary: 'Get all active plans' })
  @ApiResponse({ status: 200, description: 'Active plans retrieved successfully' })
  findActive() {
    return this.plansService.findActive();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get plan by ID' })
  @ApiResponse({ status: 200, description: 'Plan retrieved successfully' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.plansService.findOne(id);
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get plan by slug' })
  @ApiResponse({ status: 200, description: 'Plan retrieved successfully' })
  findBySlug(@Param('slug') slug: string) {
    return this.plansService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update plan (Admin only)' })
  @ApiResponse({ status: 200, description: 'Plan updated successfully' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePlanDto: UpdatePlanDto,
  ) {
    return this.plansService.update(id, updatePlanDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete plan (Admin only)' })
  @ApiResponse({ status: 200, description: 'Plan deleted successfully' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.plansService.remove(id);
  }

  @Post('features')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add feature to plan (Admin only)' })
  @ApiResponse({ status: 201, description: 'Feature added successfully' })
  addFeature(@Body() createFeatureDto: CreatePlanFeatureDto) {
    return this.plansService.addFeature(createFeatureDto);
  }

  @Get(':id/features')
  @Public()
  @ApiOperation({ summary: 'Get plan features' })
  @ApiResponse({ status: 200, description: 'Features retrieved successfully' })
  getFeatures(@Param('id', ParseIntPipe) id: number) {
    return this.plansService.getFeatures(id);
  }
}
