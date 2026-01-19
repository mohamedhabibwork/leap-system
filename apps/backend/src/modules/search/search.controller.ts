import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { SearchService } from './search.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser, getUserId } from '../../common/types/request.types';
import { SearchQueryDto, SearchSuggestionsQueryDto } from './dto/search-query.dto';
import { QueryParams } from '../../common/types/request.types';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Global search across all content types' })
  search(
    @Query() query: SearchQueryDto,
    @CurrentUser() user?: AuthenticatedUser,
    @Req() req?: Request,
  ) {
    const userId = user?.userId || user?.id;
    const sessionId = (req as any)?.sessionID || (req?.headers['x-session-id'] as string);
    const ipAddress = req?.ip || req?.socket?.remoteAddress || (req?.headers['x-forwarded-for'] as string);
    const userAgent = req?.headers['user-agent'];

    return this.searchService.globalSearch(query, userId, sessionId, ipAddress, userAgent);
  }

  @Get('suggestions')
  @Public()
  @ApiOperation({ summary: 'Get search suggestions' })
  async getSuggestions(@Query() query: SearchSuggestionsQueryDto) {
    const suggestions = await this.searchService.getSuggestions(query);
    return suggestions;
  }

  @Get('trending')
  @Public()
  @ApiOperation({ summary: 'Get trending searches' })
  async getTrending(@Query() query: QueryParams) {
    const trending = await this.searchService.getTrending(query);
    return trending;
  }

  @Get('users')
  @Public()
  @ApiOperation({ summary: 'Search users' })
  searchUsers(@Query() query: QueryParams) {
    return this.searchService.searchUsers(query);
  }

  @Get('posts')
  @Public()
  @ApiOperation({ summary: 'Search posts' })
  searchPosts(@Query() query: QueryParams) {
    return this.searchService.searchPosts(query);
  }

  @Get('groups')
  @Public()
  @ApiOperation({ summary: 'Search groups' })
  searchGroups(@Query() query: QueryParams) {
    return this.searchService.searchGroups(query);
  }

  @Get('pages')
  @Public()
  @ApiOperation({ summary: 'Search pages' })
  searchPages(@Query() query: QueryParams) {
    return this.searchService.searchPages(query);
  }

  @Get('events')
  @Public()
  @ApiOperation({ summary: 'Search events' })
  searchEvents(@Query() query: QueryParams) {
    return this.searchService.searchEvents(query);
  }

  @Get('jobs')
  @Public()
  @ApiOperation({ summary: 'Search jobs' })
  searchJobs(@Query() query: QueryParams) {
    return this.searchService.searchJobs(query);
  }

  @Get('courses')
  @Public()
  @ApiOperation({ summary: 'Search courses' })
  searchCourses(@Query() query: QueryParams) {
    return this.searchService.searchCourses(query);
  }
}
