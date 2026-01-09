import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LookupsService } from './lookups.service';
import { AdminLookupQueryDto } from './dto/admin-lookup-query.dto';
import { BulkLookupOperationDto } from './dto/bulk-lookup-operation.dto';
import { ReorderLookupsDto } from './dto/reorder-lookups.dto';
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
  create(@Body() data: any) {
    return this.lookupsService.create(data);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update lookup' })
  update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.lookupsService.update(id, data);
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
