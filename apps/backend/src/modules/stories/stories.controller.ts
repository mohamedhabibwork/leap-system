import { Controller, Get, Post, Delete, Param, Body, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('stories')
@Controller('stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all active stories (not expired)' })
  getAll(@Query() query: any) {
    return this.storiesService.findAll(query);
  }

  @Get('user/:id')
  @Public()
  @ApiOperation({ summary: 'Get stories from a specific user' })
  getUserStories(@Param('id', ParseIntPipe) userId: number) {
    return this.storiesService.findByUser(userId);
  }

  @Get('my-stories')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my stories' })
  getMyStories(@CurrentUser() user: any) {
    return this.storiesService.findByUser(user.userId || user.sub || user.id);
  }

  @Get('archived')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get archived stories' })
  getArchived(@CurrentUser() user: any, @Query() query: any) {
    return this.storiesService.findArchivedByUser(user.userId || user.sub || user.id, query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get story by ID' })
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.storiesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new story' })
  create(@Body() createStoryDto: any, @CurrentUser() user: any) {
    return this.storiesService.create({ ...createStoryDto, userId: user.userId || user.sub || user.id });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a story' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.storiesService.remove(id, user.userId || user.sub || user.id);
  }

  @Post(':id/view')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark story as viewed' })
  markAsViewed(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.storiesService.markAsViewed(id, user.userId || user.sub || user.id);
  }

  @Get(':id/viewers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get story viewers' })
  getViewers(@Param('id', ParseIntPipe) id: number, @Query() query: any) {
    return this.storiesService.getViewers(id, query);
  }

  @Post(':id/archive')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Archive a story' })
  archive(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.storiesService.archive(id, user.userId || user.sub || user.id);
  }
}
