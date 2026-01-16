import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { LookupTypesService } from './lookup-types.service';
import { CreateLookupTypeDto, UpdateLookupTypeDto } from './dto';
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
  @ApiResponse({ status: 200, description: 'Lookup type found' })
  @ApiResponse({ status: 404, description: 'Lookup type not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lookupTypesService.findOne(id);
  }

  @Public()
  @Get('code/:code')
  @ApiOperation({ summary: 'Get lookup type by code' })
  @ApiResponse({ status: 200, description: 'Lookup type found' })
  @ApiResponse({ status: 404, description: 'Lookup type not found' })
  findByCode(@Param('code') code: string) {
    return this.lookupTypesService.findByCode(code);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create lookup type' })
  @ApiResponse({ status: 201, description: 'Lookup type created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  create(@Body() dto: CreateLookupTypeDto) {
    return this.lookupTypesService.create(dto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update lookup type' })
  @ApiResponse({ status: 200, description: 'Lookup type updated successfully' })
  @ApiResponse({ status: 404, description: 'Lookup type not found' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLookupTypeDto) {
    return this.lookupTypesService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete lookup type (soft delete)' })
  @ApiResponse({ status: 200, description: 'Lookup type deleted successfully' })
  @ApiResponse({ status: 404, description: 'Lookup type not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.lookupTypesService.remove(id);
  }
}
