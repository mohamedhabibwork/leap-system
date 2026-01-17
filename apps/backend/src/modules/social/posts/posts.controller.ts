import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Query, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AdminPostQueryDto } from './dto/admin-post-query.dto';
import { BulkPostOperationDto } from './dto/bulk-post-operation.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { AuthenticatedUser, getUserId } from '../../../common/types/request.types';

@ApiTags('social/posts')
@Controller('social/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10)) // Allow up to 10 files
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new post with optional file uploads' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string' },
        post_type: { type: 'string', enum: ['text', 'image', 'video', 'link'] },
        visibility: { type: 'string', enum: ['public', 'friends', 'private'] },
        group_id: { type: 'number', required: false },
        page_id: { type: 'number', required: false },
        mentionIds: { type: 'array', items: { type: 'number' }, required: false },
        fileIds: { type: 'array', items: { type: 'number' }, required: false, description: 'Array of existing file IDs from media_library' },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          required: false,
          description: 'Files to upload and attach to the post',
        },
      },
      required: ['content', 'post_type', 'visibility'],
    },
  })
  async create(
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const userId = getUserId(user);
    
    // Parse fileIds from form data (it comes as string or array of strings)
    let fileIds: number[] | undefined;
    if (body.fileIds) {
      if (typeof body.fileIds === 'string') {
        try {
          fileIds = JSON.parse(body.fileIds);
        } catch {
          // If not JSON, try comma-separated
          fileIds = body.fileIds.split(',').map((id: string) => parseInt(id.trim(), 10)).filter((id: number) => !isNaN(id));
        }
      } else if (Array.isArray(body.fileIds)) {
        fileIds = body.fileIds.map((id: any) => typeof id === 'string' ? parseInt(id, 10) : id).filter((id: number) => !isNaN(id));
      }
    }

    // Parse mentionIds similarly
    let mentionIds: number[] | undefined;
    if (body.mentionIds) {
      if (typeof body.mentionIds === 'string') {
        try {
          mentionIds = JSON.parse(body.mentionIds);
        } catch {
          mentionIds = body.mentionIds.split(',').map((id: string) => parseInt(id.trim(), 10)).filter((id: number) => !isNaN(id));
        }
      } else if (Array.isArray(body.mentionIds)) {
        mentionIds = body.mentionIds.map((id: any) => typeof id === 'string' ? parseInt(id, 10) : id).filter((id: number) => !isNaN(id));
      }
    }

    // Parse group_id and page_id, ensuring they're valid positive integers or undefined
    let groupId: number | undefined;
    if (body.group_id) {
      const parsed = parseInt(body.group_id, 10);
      if (!isNaN(parsed) && parsed > 0) {
        groupId = parsed;
      }
    }

    let pageId: number | undefined;
    if (body.page_id) {
      const parsed = parseInt(body.page_id, 10);
      if (!isNaN(parsed) && parsed > 0) {
        pageId = parsed;
      }
    }

    const createPostDto: CreatePostDto = {
      content: body.content,
      post_type: body.post_type,
      visibility: body.visibility,
      group_id: groupId,
      page_id: pageId,
      mentionIds,
      fileIds,
    };

    return this.postsService.create({
      ...createPostDto,
      userId,
      files: files || [],
    });
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
  getMyPosts(@CurrentUser() user: AuthenticatedUser, @Query() query: any) {
    return this.postsService.findByUser(getUserId(user), query);
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
  like(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.postsService.toggleLike(id, getUserId(user));
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
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePostDto: UpdatePostDto, @CurrentUser() user: AuthenticatedUser) {
    return this.postsService.update(id, updatePostDto, getUserId(user));
  }

  @Delete(':id')
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete post' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.postsService.remove(id, getUserId(user));
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
