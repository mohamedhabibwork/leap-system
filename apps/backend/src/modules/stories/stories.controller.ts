import { Controller, Get, Post, Delete, Param, Body, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { AuthenticatedUser, QueryParams } from '../../common/types/request.types';

@ApiTags('stories')
@Controller('stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all active stories (not expired)' })
  getAll(@Query() query: QueryParams) {
    return this.storiesService.findAll(query);
  }

  @Get('user/:id')
  @Public()
  @ApiOperation({ summary: 'Get stories from a specific user' })
  getUserStories(@Param('id', ParseIntPipe) userId: number) {
    return this.storiesService.findByUser(userId);
  }

  @Get('my-stories')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my stories' })
  getMyStories(@CurrentUser() user: AuthenticatedUser) {
    return this.storiesService.findByUser(getUserId(user));
  }

  @Get('archived')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get archived stories' })
  getArchived(@CurrentUser() user: AuthenticatedUser, @Query() query: QueryParams) {
    return this.storiesService.findArchivedByUser(getUserId(user), query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get story by ID' })
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.storiesService.findOne(id);
  }

  @Post()
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new story' })
  create(@Body() createStoryDto: Record<string, unknown>, @CurrentUser() user: AuthenticatedUser) {
    return this.storiesService.create({ ...createStoryDto, userId: getUserId(user) });
  }

  @Delete(':id')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a story' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.storiesService.remove(id, getUserId(user));
  }

  @Post(':id/view')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark story as viewed' })
  markAsViewed(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.storiesService.markAsViewed(id, getUserId(user));
  }

  @Get(':id/viewers')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get story viewers' })
  getViewers(@Param('id', ParseIntPipe) id: number, @Query() query: QueryParams) {
    return this.storiesService.getViewers(id, query);
  }

  @Post(':id/archive')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Archive a story' })
  archive(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.storiesService.archive(id, getUserId(user));
  }
}
