import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LookupsService } from './lookups.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Lookups')
@Controller('lookups')
export class LookupsController {
  constructor(private readonly lookupsService: LookupsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all lookups' })
  findAll() {
    return this.lookupsService.findAll();
  }

  @Public()
  @Get('type/:typeCode')
  @ApiOperation({ summary: 'Get lookups by type code' })
  findByType(@Param('typeCode') typeCode: string) {
    return this.lookupsService.findByType(typeCode);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get lookup by ID' })
  findOne(@Param('id') id: string) {
    return this.lookupsService.findOne(+id);
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
  update(@Param('id') id: string, @Body() data: any) {
    return this.lookupsService.update(+id, data);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete lookup (soft delete)' })
  remove(@Param('id') id: string) {
    return this.lookupsService.remove(+id);
  }
}
