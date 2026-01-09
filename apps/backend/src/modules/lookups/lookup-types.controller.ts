import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LookupTypesService } from './lookup-types.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Lookup Types')
@Controller('lookup-types')
export class LookupTypesController {
  constructor(private readonly lookupTypesService: LookupTypesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all lookup types' })
  findAll() {
    return this.lookupTypesService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get lookup type by ID' })
  findOne(@Param('id') id: string) {
    return this.lookupTypesService.findOne(+id);
  }

  @Public()
  @Get('code/:code')
  @ApiOperation({ summary: 'Get lookup type by code' })
  findByCode(@Param('code') code: string) {
    return this.lookupTypesService.findByCode(code);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create lookup type' })
  create(@Body() data: any) {
    return this.lookupTypesService.create(data);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update lookup type' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.lookupTypesService.update(+id, data);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete lookup type (soft delete)' })
  remove(@Param('id') id: string) {
    return this.lookupTypesService.remove(+id);
  }
}
