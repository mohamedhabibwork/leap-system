import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, sql, like, or } from 'drizzle-orm';
import { users, courses, jobs, events, posts, groups, pages } from '@leap-lms/database';

@Injectable()
export class SearchService {
  constructor(@Inject('DRIZZLE_DB') private readonly db: NodePgDatabase<any>) {}

  async globalSearch(query: any) {
    const { query: searchQuery, type = 'all', limit = 10 } = query;
    
    if (!searchQuery) {
      return { results: [], total: 0 };
    }

    const results: any[] = [];

    const searchPromises = [];

    if (type === 'all' || type === 'course') {
      searchPromises.push(this.searchCourses({ query: searchQuery, limit }).then(res => 
        res.data.map((c: any) => ({ type: 'course', id: c.id, title: c.titleEn, description: c.descriptionEn, image: c.thumbnailUrl }))
      ));
    }

    if (type === 'all' || type === 'user') {
      searchPromises.push(this.searchUsers({ query: searchQuery, limit }).then(res => 
        res.data.map((u: any) => ({ type: 'user', id: u.id, title: u.username, description: u.bio, image: u.avatarUrl }))
      ));
    }

    if (type === 'all' || type === 'post') {
      searchPromises.push(this.searchPosts({ query: searchQuery, limit }).then(res => 
        res.data.map((p: any) => ({ type: 'post', id: p.id, title: p.content?.substring(0, 50), description: p.content }))
      ));
    }

    if (type === 'all' || type === 'group') {
      searchPromises.push(this.searchGroups({ query: searchQuery, limit }).then(res => 
        res.data.map((g: any) => ({ type: 'group', id: g.id, title: g.name, description: g.description, image: g.coverImageUrl }))
      ));
    }

    if (type === 'all' || type === 'page') {
      searchPromises.push(this.searchPages({ query: searchQuery, limit }).then(res => 
        res.data.map((p: any) => ({ type: 'page', id: p.id, title: p.name, description: p.description, image: p.profileImageUrl }))
      ));
    }

    const allResults = await Promise.all(searchPromises);
    allResults.forEach(r => results.push(...r));

    return { results, total: results.length };
  }

  async getSuggestions(query: any) {
    const { query: searchQuery, limit = 5 } = query;
    if (!searchQuery) return { data: [] };

    // Fetch suggestions from multiple sources
    const [coursesList, usersList, eventsList] = await Promise.all([
      this.db.select({ text: courses.titleEn }).from(courses).where(like(courses.titleEn, `${searchQuery}%`)).limit(limit),
      this.db.select({ text: users.username }).from(users).where(like(users.username, `${searchQuery}%`)).limit(limit),
      this.db.select({ text: events.titleEn }).from(events).where(like(events.titleEn, `${searchQuery}%`)).limit(limit),
    ]);

    const suggestions = [
      ...coursesList.map(c => ({ text: c.text, type: 'course' })),
      ...usersList.map(u => ({ text: u.text, type: 'user' })),
      ...eventsList.map(e => ({ text: e.text, type: 'event' })),
    ].slice(0, limit);

    return { data: suggestions };
  }

  async getTrending(query: any) {
    // Mock trending searches - in real world this would come from a tracking table
    const trending = [
      { text: 'React Development', count: 120 },
      { text: 'Next.js 14', count: 95 },
      { text: 'AI in Education', count: 88 },
      { text: 'Marketing Basics', count: 72 },
      { text: 'Graphic Design', count: 65 },
    ];
    return { data: trending };
  }

  async searchUsers(query: any) {
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

  async searchPosts(query: any) {
    const { query: searchQuery, limit = 10 } = query;
    if (!searchQuery) return { data: [] };

    const results = await this.db
      .select()
      .from(posts)
      .where(and(eq(posts.isDeleted, false), like(posts.content, `%${searchQuery}%`)))
      .limit(limit);

    return { data: results };
  }

  async searchGroups(query: any) {
    const { query: searchQuery, limit = 10 } = query;
    if (!searchQuery) return { data: [] };

    const results = await this.db
      .select()
      .from(groups)
      .where(and(eq(groups.isDeleted, false), or(like(groups.name, `%${searchQuery}%`), like(groups.description, `%${searchQuery}%`))))
      .limit(limit);

    return { data: results };
  }

  async searchPages(query: any) {
    const { query: searchQuery, limit = 10 } = query;
    if (!searchQuery) return { data: [] };

    const results = await this.db
      .select()
      .from(pages)
      .where(and(eq(pages.isDeleted, false), or(like(pages.name, `%${searchQuery}%`), like(pages.description, `%${searchQuery}%`))))
      .limit(limit);

    return { data: results };
  }

  async searchEvents(query: any) {
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

  async searchJobs(query: any) {
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

  async searchCourses(query: any) {
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
