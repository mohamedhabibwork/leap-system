import { pgTable, bigserial, uuid, varchar, text, timestamp, boolean, integer, jsonb, index, bigint } from 'drizzle-orm/pg-core';
import { relations, isNull } from 'drizzle-orm';
import { users } from './users.schema';
import { lookups } from './lookups.schema';

// Posts Table
export const posts = pgTable('posts', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  userId: bigserial('userId', { mode: 'number' }).references(() => users.id).notNull(),
  postTypeId: bigserial('post_type_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  content: text('content'),
  visibilityId: bigserial('visibility_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  groupId: bigserial('group_id', { mode: 'number' }).references(() => groups.id),
  pageId: bigserial('page_id', { mode: 'number' }).references(() => pages.id),
  shareCount: integer('share_count').default(0),
  commentCount: integer('comment_count').default(0),
  reactionCount: integer('reaction_count').default(0),
  viewCount: integer('view_count').default(0),
  metadata: jsonb('metadata'),
  settings: jsonb('settings'),
  mentionIds: jsonb('mention_ids'),
  fileIds: jsonb('file_ids'),
  sharedPostId: bigserial('shared_post_id', { mode: 'number' }),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ([
  index('posts_uuid_idx').on(table.uuid),
  index('posts_userId_idx').on(table.userId),
  index('posts_group_id_idx').on(table.groupId),
  index('posts_page_id_idx').on(table.pageId),
  index('posts_shared_post_id_idx').on(table.sharedPostId),
]));

// Post Reactions Table
export const postReactions = pgTable('post_reactions', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  postId: bigserial('post_id', { mode: 'number' }).references(() => posts.id).notNull(),
  userId: bigserial('userId', { mode: 'number' }).references(() => users.id).notNull(),
  reactionTypeId: bigserial('reaction_type_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ([
  index('post_reactions_uuid_idx').on(table.uuid),
  index('post_reactions_post_id_idx').on(table.postId),
  index('post_reactions_userId_idx').on(table.userId),
]));

// Groups Table
export const groups = pgTable('groups', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  seo: jsonb('seo'),
  privacyTypeId: bigserial('privacy_type_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  coverImageUrl: varchar('cover_image_url', { length: 500 }),
  createdBy: bigserial('created_by', { mode: 'number' }).references(() => users.id).notNull(),
  memberCount: integer('member_count').default(0),
  favoriteCount: integer('favorite_count').default(0),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ([
  index('groups_uuid_idx').on(table.uuid),
  index('groups_slug_idx').on(table.slug),
  index('groups_created_by_idx').on(table.createdBy),
]));

// Group Members Table
export const groupMembers = pgTable('group_members', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  groupId: bigserial('group_id', { mode: 'number' }).references(() => groups.id).notNull(),
  userId: bigserial('userId', { mode: 'number' }).references(() => users.id).notNull(),
  roleId: bigserial('role_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  statusId: bigserial('status_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow(),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ([
  index('group_members_uuid_idx').on(table.uuid),
  index('group_members_group_id_idx').on(table.groupId),
  index('group_members_userId_idx').on(table.userId),
]));

// Pages Table
export const pages = pgTable('pages', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  seo: jsonb('seo'),
  categoryId: bigserial('category_id', { mode: 'number' }).references(() => lookups.id),
  coverImageUrl: varchar('cover_image_url', { length: 500 }),
  profileImageUrl: varchar('profile_image_url', { length: 500 }),
  createdBy: bigserial('created_by', { mode: 'number' }).references(() => users.id).notNull(),
  followerCount: integer('follower_count').default(0),
  likeCount: integer('like_count').default(0),
  favoriteCount: integer('favorite_count').default(0),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ([
  index('pages_uuid_idx').on(table.uuid),
  index('pages_slug_idx').on(table.slug),
  index('pages_created_by_idx').on(table.createdBy),
]));

// Page Members Table
export const pageMembers = pgTable('page_members', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  pageId: bigserial('page_id', { mode: 'number' }).references(() => pages.id).notNull(),
  userId: bigserial('userId', { mode: 'number' }).references(() => users.id).notNull(),
  roleId: bigserial('role_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow(),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ([
  index('page_members_uuid_idx').on(table.uuid),
  index('page_members_page_id_idx').on(table.pageId),
  index('page_members_userId_idx').on(table.userId),
]));

// Page Likes Table
export const pageLikes = pgTable('page_likes', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  pageId: bigserial('page_id', { mode: 'number' }).references(() => pages.id).notNull(),
  userId: bigserial('userId', { mode: 'number' }).references(() => users.id).notNull(),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ([
  index('page_likes_uuid_idx').on(table.uuid),
  index('page_likes_page_id_idx').on(table.pageId),
  index('page_likes_userId_idx').on(table.userId),
]));

// Page Follows Table
export const pageFollows = pgTable('page_follows', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  pageId: bigserial('page_id', { mode: 'number' }).references(() => pages.id).notNull(),
  userId: bigserial('userId', { mode: 'number' }).references(() => users.id).notNull(),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ([
  index('page_follows_uuid_idx').on(table.uuid),
  index('page_follows_page_id_idx').on(table.pageId),
  index('page_follows_userId_idx').on(table.userId),
]));

// Friends Table
export const friends = pgTable('friends', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  userId: bigserial('userId', { mode: 'number' }).references(() => users.id).notNull(),
  friendId: bigserial('friend_id', { mode: 'number' }).references(() => users.id).notNull(),
  statusId: bigserial('status_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  requestedAt: timestamp('requested_at', { withTimezone: true }).defaultNow(),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ([
  index('friends_uuid_idx').on(table.uuid),
  index('friends_userId_idx').on(table.userId),
  index('friends_friend_id_idx').on(table.friendId),
]));

// Relations
export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  postType: one(lookups, {
    fields: [posts.postTypeId],
    references: [lookups.id],
  }),
  visibility: one(lookups, {
    fields: [posts.visibilityId],
    references: [lookups.id],
  }),
  group: one(groups, {
    fields: [posts.groupId],
    references: [groups.id],
  }),
  page: one(pages, {
    fields: [posts.pageId],
    references: [pages.id],
  }),
  reactions: many(postReactions),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  creator: one(users, {
    fields: [groups.createdBy],
    references: [users.id],
  }),
  privacyType: one(lookups, {
    fields: [groups.privacyTypeId],
    references: [lookups.id],
  }),
  members: many(groupMembers),
  posts: many(posts),
}));

export const pagesRelations = relations(pages, ({ one, many }) => ({
  creator: one(users, {
    fields: [pages.createdBy],
    references: [users.id],
  }),
  category: one(lookups, {
    fields: [pages.categoryId],
    references: [lookups.id],
  }),
  members: many(pageMembers),
  likes: many(pageLikes),
  follows: many(pageFollows),
  posts: many(posts),
}));
