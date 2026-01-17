import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, sql, like, or, desc, gte } from 'drizzle-orm';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { users, courses, jobs, events, posts, groups, pages, searchQueries } from '@leap-lms/database';
import * as schema from '@leap-lms/database';
import { SearchQueryDto, SearchSuggestionsQueryDto } from './dto/search-query.dto';
import { QueryParams } from '../../common/types/request.types';

@Injectable()
export class SearchService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<typeof schema>) {}

  async globalSearch(query: SearchQueryDto, userId?: number, sessionId?: string, ipAddress?: string, userAgent?: string) {
    const { query: searchQuery, type = 'all', limit = 10, offset = 0, sort = 'relevance' } = query;
    
    if (!searchQuery) {
      return { results: [], total: 0, facets: { types: {} } };
    }

    const results: unknown[] = [];
    const searchPromises: Promise<unknown[]>[] = [];
    const typeCounts: Record<string, number> = {};

    // Helper to map and count results
    const mapAndCount = (type: string, data: unknown[], mapper: (item: unknown) => unknown) => {
      const mapped = data.map(mapper);
      typeCounts[type] = (typeCounts[type] || 0) + mapped.length;
      return mapped;
    };

    if (type === 'all' || type === 'course') {
      searchPromises.push(
        this.searchCourses({ query: searchQuery, limit }).then(res => 
          mapAndCount('course', res.data, (c: unknown) => {
            const course = c as { id: number; titleEn: string; descriptionEn?: string; thumbnailUrl?: string; price?: number; categoryId?: number };
            return { 
            type: 'course', 
            id: c.id, 
            title: c.titleEn, 
            description: c.descriptionEn, 
            image: c.thumbnailUrl,
            metadata: {
              price: course.price,
              category: course.categoryId,
            }
          };
          })
        )
      );
    }

    if (type === 'all' || type === 'user') {
      searchPromises.push(
        this.searchUsers({ query: searchQuery, limit }).then(res => 
          mapAndCount('user', res.data, (u: unknown) => {
            const user = u as { id: number; username?: string; firstName?: string; lastName?: string; bio?: string; avatarUrl?: string };
            return { 
            type: 'user', 
            id: u.id, 
            title: user.username || `${user.firstName || ''} ${user.lastName || ''}`.trim(), 
            description: user.bio, 
            image: user.avatarUrl 
          };
          })
        )
      );
    }

    if (type === 'all' || type === 'post') {
      searchPromises.push(
        this.searchPosts({ query: searchQuery, limit }).then(res => 
          mapAndCount('post', res.data, (p: InferSelectModel<typeof posts>) => {
            const post = p as { id: number; content?: string | null };
            return { 
              type: 'post', 
              id: post.id, 
              title: post.content?.substring(0, 50) || 'Post', 
              description: post.content 
            };
          })
        )
      );
    }

    if (type === 'all' || type === 'group') {
      searchPromises.push(
        this.searchGroups({ query: searchQuery, limit }).then(res => 
          mapAndCount('group', res.data, (g: unknown) => {
            const group = g as { id: number; name?: string; description?: string; coverImageUrl?: string; memberCount?: number };
            return { 
              type: 'group', 
              id: group.id, 
              title: group.name, 
              description: group.description, 
              image: group.coverImageUrl,
              metadata: {
                memberCount: group.memberCount,
              }
            };
          })
        )
      );
    }

    if (type === 'all' || type === 'page') {
      searchPromises.push(
        this.searchPages({ query: searchQuery, limit }).then(res => 
          mapAndCount('page', res.data, (p: unknown) => {
            const page = p as { id: number; name?: string; description?: string; profileImageUrl?: string };
            return { 
              type: 'page', 
              id: page.id, 
              title: page.name, 
              description: page.description, 
              image: page.profileImageUrl 
            };
          })
        )
      );
    }

    if (type === 'all' || type === 'event') {
      searchPromises.push(
        this.searchEvents({ query: searchQuery, limit }).then(res => 
          mapAndCount('event', res.data, (e: unknown) => {
            const event = e as { id: number; titleEn?: string; descriptionEn?: string; coverImageUrl?: string; location?: string; startDate?: Date };
            return { 
              type: 'event', 
              id: event.id, 
              title: event.titleEn, 
              description: event.descriptionEn, 
              image: event.coverImageUrl,
              metadata: {
                location: event.location,
                date: event.startDate,
              }
            };
          })
        )
      );
    }

    if (type === 'all' || type === 'job') {
      searchPromises.push(
        this.searchJobs({ query: searchQuery, limit }).then(res => 
          mapAndCount('job', res.data, (j: unknown) => {
            const job = j as { id: number; titleEn?: string; descriptionEn?: string; companyLogo?: string; location?: string; companyName?: string };
            return { 
              type: 'job', 
              id: job.id, 
              title: job.titleEn, 
              description: job.descriptionEn, 
              image: job.companyLogo,
              metadata: {
                location: job.location,
                company: job.companyName,
              }
            };
          })
        )
      );
    }

    const allResults = await Promise.all(searchPromises);
    allResults.forEach(r => results.push(...r));

    // Apply sorting
    if (sort === 'date') {
      // Note: This is a simplified sort. In production, you'd want to sort by actual date fields
      results.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    // Apply pagination
    const paginatedResults = results.slice(offset, offset + limit);

    // Track the search query asynchronously (don't await to avoid slowing down response)
    this.trackSearch(
      searchQuery,
      type,
      results.length,
      userId,
      sessionId,
      ipAddress,
      userAgent,
      { sort, limit, offset },
    ).catch(err => {
      // Silently handle tracking errors
      console.error('Search tracking error:', err);
    });

    return { 
      results: paginatedResults, 
      total: results.length,
      facets: {
        types: typeCounts,
      }
    };
  }

  async getSuggestions(query: SearchSuggestionsQueryDto) {
    const { query: searchQuery, limit = 5 } = query;
    if (!searchQuery) return [];

    // Fetch suggestions from multiple sources
    const [coursesList, usersList, eventsList, jobsList] = await Promise.all([
      this.db
        .select({ text: courses.titleEn })
        .from(courses)
        .where(and(eq(courses.isDeleted, false), like(courses.titleEn, `${searchQuery}%`)))
        .limit(limit),
      this.db
        .select({ text: users.username })
        .from(users)
        .where(and(eq(users.isDeleted, false), like(users.username, `${searchQuery}%`)))
        .limit(limit),
      this.db
        .select({ text: events.titleEn })
        .from(events)
        .where(and(eq(events.isDeleted, false), like(events.titleEn, `${searchQuery}%`)))
        .limit(limit),
      this.db
        .select({ text: jobs.titleEn })
        .from(jobs)
        .where(and(eq(jobs.isDeleted, false), like(jobs.titleEn, `${searchQuery}%`)))
        .limit(limit),
    ]);

    const suggestions = [
      ...coursesList.map(c => ({ query: c.text, type: 'course' })),
      ...usersList.map(u => ({ query: u.text, type: 'user' })),
      ...eventsList.map(e => ({ query: e.text, type: 'event' })),
      ...jobsList.map(j => ({ query: j.text, type: 'job' })),
    ].slice(0, limit);

    return suggestions;
  }

  async getTrending(query: QueryParams) {
    const { limit = 10, days = 7 } = query;
    
    // Calculate the date threshold (e.g., last 7 days)
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - (days as number));

    // Get trending searches from the last N days, grouped by query and ordered by count
    const trending = await this.db
      .select({
        query: searchQueries.query,
        count: sql<number>`count(*)::int`.as('count'),
      })
      .from(searchQueries)
      .where(gte(searchQueries.searchedAt, dateThreshold))
      .groupBy(searchQueries.query)
      .orderBy(desc(sql<number>`count(*)`))
      .limit(limit);

    return trending.map(item => ({
      query: item.query,
      count: item.count,
    }));
  }

  /**
   * Track a search query for analytics and trending calculations
   * This is called asynchronously to not slow down the search response
   */
  async trackSearch(
    searchQuery: string,
    searchType: string = 'all',
    resultCount: number = 0,
    userId?: number,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string,
    metadata?: Record<string, unknown>,
  ) {
    if (!searchQuery || searchQuery.trim().length === 0) {
      return;
    }

    try {
      await this.db.insert(searchQueries).values({
        query: searchQuery.trim(),
        searchType: searchType || null,
        userId: userId || null,
        sessionId: sessionId || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        resultCount,
        metadata: metadata || null,
      } as InferInsertModel<typeof searchQueries>);
    } catch (error) {
      // Log error but don't throw - tracking should not break search functionality
      console.error('Failed to track search query:', error);
    }
  }

  async searchUsers(query: QueryParams) {
    const { query: searchQuery, limit = 10 } = query;
    
    if (!searchQuery) {
      return { data: [] };
    }

    const results = await this.db
      .select()
      .from(users)
      .where(
        and(
          eq(users.isDeleted, false),
          or(
            like(users.username, `%${searchQuery}%`),
            like(users.firstName, `%${searchQuery}%`),
            like(users.lastName, `%${searchQuery}%`)
          )
        )
      )
      .limit(limit);

    return { data: results };
  }

  async searchPosts(query: QueryParams) {
    const { query: searchQuery, limit = 10 } = query;
    if (!searchQuery) return { data: [] };

    const results = await this.db
      .select()
      .from(posts)
      .where(and(eq(posts.isDeleted, false), like(posts.content, `%${searchQuery}%`)))
      .limit(limit);

    return { data: results };
  }

  async searchGroups(query: QueryParams) {
    const { query: searchQuery, limit = 10 } = query;
    if (!searchQuery) return { data: [] };

    const results = await this.db
      .select()
      .from(groups)
      .where(and(eq(groups.isDeleted, false), or(like(groups.name, `%${searchQuery}%`), like(groups.description, `%${searchQuery}%`))))
      .limit(limit);

    return { data: results };
  }

  async searchPages(query: QueryParams) {
    const { query: searchQuery, limit = 10 } = query;
    if (!searchQuery) return { data: [] };

    const results = await this.db
      .select()
      .from(pages)
      .where(and(eq(pages.isDeleted, false), or(like(pages.name, `%${searchQuery}%`), like(pages.description, `%${searchQuery}%`))))
      .limit(limit);

    return { data: results };
  }

  async searchEvents(query: QueryParams) {
    const { query: searchQuery, limit = 10 } = query;
    
    if (!searchQuery) {
      return { data: [] };
    }

    const results = await this.db
      .select()
      .from(events)
      .where(
        and(
          eq(events.isDeleted, false),
          or(
            like(events.titleEn, `%${searchQuery}%`),
            like(events.titleAr, `%${searchQuery}%`),
            like(events.location, `%${searchQuery}%`)
          )
        )
      )
      .limit(limit);

    return { data: results };
  }

  async searchJobs(query: QueryParams) {
    const { query: searchQuery, limit = 10 } = query;
    
    if (!searchQuery) {
      return { data: [] };
    }

    const results = await this.db
      .select()
      .from(jobs)
      .where(
        and(
          eq(jobs.isDeleted, false),
          or(
            like(jobs.titleEn, `%${searchQuery}%`),
            like(jobs.titleAr, `%${searchQuery}%`),
            like(jobs.location, `%${searchQuery}%`)
          )
        )
      )
      .limit(limit);

    return { data: results };
  }

  async searchCourses(query: QueryParams) {
    const { query: searchQuery, limit = 10 } = query;
    
    if (!searchQuery) {
      return { data: [] };
    }

    const results = await this.db
      .select()
      .from(courses)
      .where(
        and(
          eq(courses.isDeleted, false),
          or(
            like(courses.titleEn, `%${searchQuery}%`),
            like(courses.titleAr, `%${searchQuery}%`),
            like(courses.descriptionEn, `%${searchQuery}%`),
            like(courses.descriptionAr, `%${searchQuery}%`)
          )
        )
      )
      .limit(limit);

    return { data: results };
  }
}
