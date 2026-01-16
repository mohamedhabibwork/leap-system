import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { AdminPageQueryDto } from './dto/admin-page-query.dto';
import { BulkPageOperationDto } from './dto/bulk-page-operation.dto';
import { VerifyPageDto } from './dto/verify-page.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('social/pages')
@Controller('social/pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
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

  @Get('my-pages')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user's pages" })
  getMyPages(@CurrentUser() user: any, @Query() query: any) {
    return this.pagesService.findByUser(user.userId || user.sub || user.id, query);
  }

  @Get(':id/analytics')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get page analytics' })
  getAnalytics(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.pagesService.getAnalytics(id, user.userId || user.sub || user.id);
  }

  @Get(':id/followers')
  @ApiOperation({ summary: 'Get page followers' })
  getFollowers(@Param('id', ParseIntPipe) id: number, @Query() query: any) {
    return this.pagesService.getFollowers(id, query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get page by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pagesService.findOne(id);
  }

  @Post(':id/verify')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify/unverify a page' })
  verify(@Param('id', ParseIntPipe) id: number, @Body() dto: VerifyPageDto) {
    return this.pagesService.verifyPage(id, dto.isVerified);
  }

  @Post(':id/feature')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Feature a page' })
  feature(@Param('id', ParseIntPipe) id: number) {
    return this.pagesService.setFeatured(id, true);
  }

  @Delete(':id/feature')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unfeature a page' })
  unfeature(@Param('id', ParseIntPipe) id: number) {
    return this.pagesService.setFeatured(id, false);
  }

  @Post(':id/follow')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Follow a page' })
  follow(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const userId = user?.userId || user?.sub || user?.id;
    return this.pagesService.followPage(id, userId);
  }

  @Delete(':id/follow')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unfollow a page' })
  unfollow(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const userId = user?.userId || user?.sub || user?.id;
    return this.pagesService.unfollowPage(id, userId);
  }

  @Post(':id/like')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle like on page' })
  like(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const userId = user?.userId || user?.sub || user?.id;
    return this.pagesService.likePage(id, userId);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update page' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePageDto: UpdatePageDto) {
    return this.pagesService.update(id, updatePageDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete page' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pagesService.remove(id);
  }

  @Post('bulk')
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
