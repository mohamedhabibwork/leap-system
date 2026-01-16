import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { LookupsService } from './lookups.service';
import { 
  AdminLookupQueryDto, 
  BulkLookupOperationDto, 
  ReorderLookupsDto,
  CreateLookupDto,
  UpdateLookupDto
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('admin/lookups')
@Controller('admin/lookups')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
@ApiBearerAuth()
export class AdminLookupsController {
  constructor(private readonly lookupsService: LookupsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all lookups with pagination and filtering (Admin)' })
  findAll(@Query() query: AdminLookupQueryDto) {
    return this.lookupsService.findAllAdmin(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get lookup statistics (Admin)' })
  getStatistics() {
    return this.lookupsService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lookup by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Lookup found' })
  @ApiResponse({ status: 404, description: 'Lookup not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lookupsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create lookup (Admin)' })
  @ApiResponse({ status: 201, description: 'Lookup created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  create(@Body() dto: CreateLookupDto) {
    return this.lookupsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update lookup (Admin)' })
  @ApiResponse({ status: 200, description: 'Lookup updated successfully' })
  @ApiResponse({ status: 404, description: 'Lookup not found' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLookupDto) {
    return this.lookupsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete lookup (soft delete) (Admin)' })
  @ApiResponse({ status: 200, description: 'Lookup deleted successfully' })
  @ApiResponse({ status: 404, description: 'Lookup not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.lookupsService.remove(id);
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Reorder lookups (Admin)' })
  @ApiResponse({ status: 200, description: 'Lookups reordered successfully' })
  reorder(@Body() dto: { items: Array<{ id: number; displayOrder: number }> }) {
    // Transform frontend format to service format
    const transformedDto = {
      items: dto.items.map(item => ({
        id: item.id,
        order: item.displayOrder,
      })),
    };
    return this.lookupsService.reorder(transformedDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Perform bulk operations on lookups (Admin)' })
  bulkOperation(@Body() dto: BulkLookupOperationDto) {
    return this.lookupsService.bulkOperation(dto);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export lookups to CSV (Admin)' })
  export(@Query() query: AdminLookupQueryDto) {
    return this.lookupsService.exportToCsv(query);
  }
}
