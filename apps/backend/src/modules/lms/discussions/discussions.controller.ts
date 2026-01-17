import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CourseAccessGuard } from '../../../common/guards/course-access.guard';
import { RequiresCourseAccess } from '../../../common/decorators/subscription.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser, getUserId } from '../../../common/types/request.types';
import { DiscussionsService, CreateThreadDto, ReplyDto, PaginationDto } from './discussions.service';

@ApiTags('lms/discussions')
@Controller('lms/discussions')

@ApiBearerAuth()
export class DiscussionsController {
  constructor(private readonly discussionsService: DiscussionsService) {}

  @Post('courses/:id')
  @UseGuards(CourseAccessGuard)
  @RequiresCourseAccess()
  @ApiOperation({ summary: 'Create a new discussion thread in a course' })
  @ApiResponse({ status: 201, description: 'Thread created successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async createThread(
    @Param('id', ParseIntPipe) courseId: number,
    @CurrentUser() user: AuthenticatedUser,
    @Body() data: CreateThreadDto,
  ) {
    const userId = getUserId(user);
    return this.discussionsService.createThread(courseId, userId, data);
  }

  @Post('threads/:id/replies')
  @UseGuards(CourseAccessGuard)
  @RequiresCourseAccess()
  @ApiOperation({ summary: 'Reply to a discussion thread' })
  @ApiResponse({ status: 201, description: 'Reply created successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Thread not found' })
  async replyToThread(
    @Param('id', ParseIntPipe) threadId: number,
    @CurrentUser() user: AuthenticatedUser,
    @Body() data: ReplyDto,
  ) {
    const userId = getUserId(user);
    return this.discussionsService.replyToThread(threadId, userId, data);
  }

  @Get('courses/:id')
  @UseGuards(CourseAccessGuard)
  @RequiresCourseAccess()
  @ApiOperation({ summary: 'Get all discussion threads for a course' })
  @ApiResponse({ status: 200, description: 'List of threads' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getCourseThreads(
    @Param('id', ParseIntPipe) courseId: number,
    @Query() query: PaginationDto,
  ) {
    return this.discussionsService.getCourseThreads(courseId, query);
  }

  @Get('lessons/:id')
  @UseGuards(CourseAccessGuard)
  @RequiresCourseAccess()
  @ApiOperation({ summary: 'Get all discussion threads for a lesson' })
  @ApiResponse({ status: 200, description: 'List of threads' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getLessonThreads(
    @Param('id', ParseIntPipe) lessonId: number,
    @Query() query: PaginationDto,
  ) {
    return this.discussionsService.getLessonThreads(lessonId, query);
  }

  @Post('threads/:id/solution/:replyId')
  @UseGuards(CourseAccessGuard)
  @RequiresCourseAccess()
  @ApiOperation({ summary: 'Mark a reply as the solution to a thread' })
  @ApiResponse({ status: 200, description: 'Reply marked as solution' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Thread or reply not found' })
  async markSolution(
    @Param('id', ParseIntPipe) threadId: number,
    @Param('replyId', ParseIntPipe) replyId: number,
  ) {
    await this.discussionsService.markSolution(threadId, replyId);
    return { message: 'Reply marked as solution' };
  }

  @Post('threads/:id/upvote')
  @UseGuards(CourseAccessGuard)
  @RequiresCourseAccess()
  @ApiOperation({ summary: 'Upvote a discussion thread' })
  @ApiResponse({ status: 200, description: 'Thread upvoted' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Thread not found' })
  async upvoteThread(
    @Param('id', ParseIntPipe) threadId: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const userId = getUserId(user);
    await this.discussionsService.upvoteThread(threadId, userId);
    return { message: 'Thread upvoted' };
  }

  @Post('replies/:id/upvote')
  @UseGuards(CourseAccessGuard)
  @RequiresCourseAccess()
  @ApiOperation({ summary: 'Upvote a reply' })
  @ApiResponse({ status: 200, description: 'Reply upvoted' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Reply not found' })
  async upvoteReply(
    @Param('id', ParseIntPipe) replyId: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const userId = getUserId(user);
    await this.discussionsService.upvoteReply(replyId, userId);
    return { message: 'Reply upvoted' };
  }
}
