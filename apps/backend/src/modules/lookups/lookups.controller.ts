import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { LookupsService } from './lookups.service';
import { 
  AdminLookupQueryDto, 
  BulkLookupOperationDto, 
  ReorderLookupsDto,
  CreateLookupDto,
  UpdateLookupDto
} from './dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Lookups')
@Controller('lookups')
export class LookupsController {
  constructor(private readonly lookupsService: LookupsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all lookups with pagination and filtering' })
  findAll(@Query() query: AdminLookupQueryDto) {
    return this.lookupsService.findAllAdmin(query);
  }

  @Public()
  @Get('type/:typeCode')
  @ApiOperation({ summary: 'Get lookups by type code' })
  findByType(@Param('typeCode') typeCode: string, @Query() query: AdminLookupQueryDto) {
    return this.lookupsService.findByType(typeCode, query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get lookup statistics' })
  getStatistics() {
    return this.lookupsService.getStatistics();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get lookup by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lookupsService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create lookup' })
  @ApiResponse({ status: 201, description: 'Lookup created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  create(@Body() dto: CreateLookupDto) {
    return this.lookupsService.create(dto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update lookup' })
  @ApiResponse({ status: 200, description: 'Lookup updated successfully' })
  @ApiResponse({ status: 404, description: 'Lookup not found' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLookupDto) {
    return this.lookupsService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete lookup (soft delete)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.lookupsService.remove(id);
  }

  @Post('reorder')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder lookups' })
  reorder(@Body() dto: ReorderLookupsDto) {
    return this.lookupsService.reorder(dto);
  }

  @Post('bulk')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Perform bulk operations on lookups' })
  bulkOperation(@Body() dto: BulkLookupOperationDto) {
    return this.lookupsService.bulkOperation(dto);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export lookups to CSV' })
  export(@Query() query: AdminLookupQueryDto) {
    return this.lookupsService.exportToCsv(query);
  }
}
