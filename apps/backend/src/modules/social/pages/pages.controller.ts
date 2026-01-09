import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { AdminPageQueryDto } from './dto/admin-page-query.dto';
import { BulkPageOperationDto } from './dto/bulk-page-operation.dto';
import { VerifyPageDto } from './dto/verify-page.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('social/pages')
@Controller('social/pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new page' })
  create(@Body() createPageDto: CreatePageDto, @CurrentUser() user: any) {
    return this.pagesService.create({ ...createPageDto, createdBy: user.userId });
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all pages with pagination and filtering' })
  findAll(@Query() query: AdminPageQueryDto) {
    return this.pagesService.findAllAdmin(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get page statistics' })
  getStatistics() {
    return this.pagesService.getStatistics();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get page by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pagesService.findOne(id);
  }

  @Post(':id/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify/unverify a page' })
  verify(@Param('id', ParseIntPipe) id: number, @Body() dto: VerifyPageDto) {
    return this.pagesService.verifyPage(id, dto.isVerified);
  }

  @Post(':id/feature')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Feature a page' })
  feature(@Param('id', ParseIntPipe) id: number) {
    return this.pagesService.setFeatured(id, true);
  }

  @Delete(':id/feature')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unfeature a page' })
  unfeature(@Param('id', ParseIntPipe) id: number) {
    return this.pagesService.setFeatured(id, false);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update page' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePageDto: UpdatePageDto) {
    return this.pagesService.update(id, updatePageDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete page' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pagesService.remove(id);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Perform bulk operations on pages' })
  bulkOperation(@Body() dto: BulkPageOperationDto) {
    return this.pagesService.bulkOperation(dto);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export pages to CSV' })
  export(@Query() query: AdminPageQueryDto) {
    return this.pagesService.exportToCsv(query);
  }
}
