import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AdminPostQueryDto } from './dto/admin-post-query.dto';
import { BulkPostOperationDto } from './dto/bulk-post-operation.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('social/posts')
@Controller('social/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new post' })
  create(@Body() createPostDto: CreatePostDto, @CurrentUser() user: any) {
    return this.postsService.create({ ...createPostDto, userId: user.userId } as any);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all posts with pagination and filtering' })
  async findAll(@Query() query: AdminPostQueryDto) {
    try {
      return await this.postsService.findAllAdmin(query);
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
        throw new Error('Database connection failed. Please check if the database is running.');
      }
      throw error;
    }
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get post statistics' })
  getStatistics() {
    return this.postsService.getStatistics();
  }

  @Get('my-posts')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user's posts" })
  getMyPosts(@CurrentUser() user: any, @Query() query: any) {
    return this.postsService.findByUser(user.userId || user.sub || user.id, query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get post by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  @Post(':id/like')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle like on post' })
  like(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.postsService.toggleLike(id, user.userId);
  }

  @Post(':id/hide')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hide a post (moderation)' })
  hide(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.hidePost(id);
  }

  @Delete(':id/hide')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unhide a post (moderation)' })
  unhide(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.unhidePost(id);
  }

  @Patch(':id')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update post' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePostDto: UpdatePostDto, @CurrentUser() user: any) {
    return this.postsService.update(id, updatePostDto, user.userId);
  }

  @Delete(':id')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete post' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.postsService.remove(id, user.userId);
  }

  @Post('bulk')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Perform bulk operations on posts' })
  bulkOperation(@Body() dto: BulkPostOperationDto) {
    return this.postsService.bulkOperation(dto);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export posts to CSV' })
  export(@Query() query: AdminPostQueryDto) {
    return this.postsService.exportToCsv(query);
  }
}
