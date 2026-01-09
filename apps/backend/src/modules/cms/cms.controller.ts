import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CmsService } from './cms.service';
import { CreateCmDto } from './dto/create-cm.dto';
import { UpdateCmDto } from './dto/update-cm.dto';
import { AdminCMSQueryDto } from './dto/admin-cms-query.dto';
import { BulkCMSOperationDto } from './dto/bulk-cms-operation.dto';

@ApiTags('CMS')
@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new CMS page' })
  create(@Body() createCmDto: CreateCmDto) {
    return this.cmsService.create(createCmDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all CMS pages with pagination and filtering' })
  findAll(@Query() query: AdminCMSQueryDto) {
    return this.cmsService.findAllAdmin(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get CMS page statistics' })
  getStatistics() {
    return this.cmsService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get CMS page by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cmsService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get CMS page by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.cmsService.findBySlug(slug);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish a CMS page' })
  publish(@Param('id', ParseIntPipe) id: number) {
    return this.cmsService.publish(id);
  }

  @Post(':id/unpublish')
  @ApiOperation({ summary: 'Unpublish a CMS page' })
  unpublish(@Param('id', ParseIntPipe) id: number) {
    return this.cmsService.unpublish(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update CMS page' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCmDto: UpdateCmDto) {
    return this.cmsService.update(id, updateCmDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete CMS page' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cmsService.remove(id);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Perform bulk operations on CMS pages' })
  bulkOperation(@Body() dto: BulkCMSOperationDto) {
    return this.cmsService.bulkOperation(dto);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export CMS pages to CSV' })
  export(@Query() query: AdminCMSQueryDto) {
    return this.cmsService.exportToCsv(query);
  }
}
