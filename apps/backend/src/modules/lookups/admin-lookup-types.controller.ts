import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { LookupTypesService } from './lookup-types.service';
import { CreateLookupTypeDto, UpdateLookupTypeDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('admin/lookup-types')
@Controller('admin/lookup-types')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
@ApiBearerAuth()
export class AdminLookupTypesController {
  constructor(private readonly lookupTypesService: LookupTypesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all lookup types (Admin)' })
  async findAll() {
    const data = await this.lookupTypesService.findAll();
    return { data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lookup type by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Lookup type found' })
  @ApiResponse({ status: 404, description: 'Lookup type not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lookupTypesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create lookup type (Admin)' })
  @ApiResponse({ status: 201, description: 'Lookup type created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  create(@Body() dto: CreateLookupTypeDto) {
    return this.lookupTypesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update lookup type (Admin)' })
  @ApiResponse({ status: 200, description: 'Lookup type updated successfully' })
  @ApiResponse({ status: 404, description: 'Lookup type not found' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLookupTypeDto) {
    return this.lookupTypesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete lookup type (soft delete) (Admin)' })
  @ApiResponse({ status: 200, description: 'Lookup type deleted successfully' })
  @ApiResponse({ status: 404, description: 'Lookup type not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.lookupTypesService.remove(id);
  }
}
