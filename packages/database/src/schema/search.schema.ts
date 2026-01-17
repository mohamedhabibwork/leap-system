import { pgTable, bigserial, bigint, uuid, varchar, text, timestamp, index, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

// Search Queries Table (Track all search queries)
export const searchQueries = pgTable('search_queries', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  query: varchar('query', { length: 500 }).notNull(),
  searchType: varchar('search_type', { length: 50 }), // 'all', 'course', 'user', 'post', 'group', 'page', 'event', 'job'
  userId: bigserial('userId', { mode: 'number' }).references(() => users.id), // Nullable for anonymous users
  sessionId: varchar('session_id', { length: 255 }),
  ipAddress: varchar('ip_address', { length: 45 }), // IPv4 or IPv6
  userAgent: text('user_agent'),
  resultCount: bigint('result_count', { mode: 'number' }).default(0).notNull(),
  metadata: jsonb('metadata'), // Additional tracking data (e.g., filters, sort order)
  searchedAt: timestamp('searched_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uuidIdx: index('search_queries_uuid_idx').on(table.uuid),
  queryIdx: index('search_queries_query_idx').on(table.query),
  userIdIdx: index('search_queries_userId_idx').on(table.userId),
  sessionIdx: index('search_queries_session_id_idx').on(table.sessionId),
  searchTypeIdx: index('search_queries_search_type_idx').on(table.searchType),
  searchedAtIdx: index('search_queries_searched_at_idx').on(table.searchedAt),
  // Composite index for trending queries
  querySearchedAtIdx: index('search_queries_query_searched_at_idx').on(table.query, table.searchedAt),
}));
