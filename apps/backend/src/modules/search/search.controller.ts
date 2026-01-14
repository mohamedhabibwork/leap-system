import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Global search across all content types' })
  search(@Query() query: any) {
    return this.searchService.globalSearch(query);
  }

  @Get('suggestions')
  @Public()
  @ApiOperation({ summary: 'Get search suggestions' })
  getSuggestions(@Query() query: any) {
    return this.searchService.getSuggestions(query);
  }

  @Get('trending')
  @Public()
  @ApiOperation({ summary: 'Get trending searches' })
  getTrending(@Query() query: any) {
    return this.searchService.getTrending(query);
  }

  @Get('users')
  @Public()
  @ApiOperation({ summary: 'Search users' })
  searchUsers(@Query() query: any) {
    return this.searchService.searchUsers(query);
  }

  @Get('posts')
  @Public()
  @ApiOperation({ summary: 'Search posts' })
  searchPosts(@Query() query: any) {
    return this.searchService.searchPosts(query);
  }

  @Get('groups')
  @Public()
  @ApiOperation({ summary: 'Search groups' })
  searchGroups(@Query() query: any) {
    return this.searchService.searchGroups(query);
  }

  @Get('pages')
  @Public()
  @ApiOperation({ summary: 'Search pages' })
  searchPages(@Query() query: any) {
    return this.searchService.searchPages(query);
  }

  @Get('events')
  @Public()
  @ApiOperation({ summary: 'Search events' })
  searchEvents(@Query() query: any) {
    return this.searchService.searchEvents(query);
  }

  @Get('jobs')
  @Public()
  @ApiOperation({ summary: 'Search jobs' })
  searchJobs(@Query() query: any) {
    return this.searchService.searchJobs(query);
  }

  @Get('courses')
  @Public()
  @ApiOperation({ summary: 'Search courses' })
  searchCourses(@Query() query: any) {
    return this.searchService.searchCourses(query);
  }
}
