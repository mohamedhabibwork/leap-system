"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pagesRelations = exports.groupsRelations = exports.postsRelations = exports.friends = exports.pageFollows = exports.pageLikes = exports.pageMembers = exports.pages = exports.groupMembers = exports.groups = exports.postReactions = exports.posts = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const users_schema_1 = require("./users.schema");
const lookups_schema_1 = require("./lookups.schema");
exports.posts = (0, pg_core_1.pgTable)('posts', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    userId: (0, pg_core_1.bigserial)('userId', { mode: 'number' }).references(() => users_schema_1.users.id).notNull(),
    postTypeId: (0, pg_core_1.bigserial)('post_type_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    content: (0, pg_core_1.text)('content'),
    visibilityId: (0, pg_core_1.bigserial)('visibility_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    groupId: (0, pg_core_1.bigserial)('group_id', { mode: 'number' }).references(() => exports.groups.id),
    pageId: (0, pg_core_1.bigserial)('page_id', { mode: 'number' }).references(() => exports.pages.id),
    shareCount: (0, pg_core_1.integer)('share_count').default(0),
    commentCount: (0, pg_core_1.integer)('comment_count').default(0),
    reactionCount: (0, pg_core_1.integer)('reaction_count').default(0),
    viewCount: (0, pg_core_1.integer)('view_count').default(0),
    metadata: (0, pg_core_1.jsonb)('metadata'),
    settings: (0, pg_core_1.jsonb)('settings'),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    publishedAt: (0, pg_core_1.timestamp)('published_at', { withTimezone: true }),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { withTimezone: true }).defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('posts_uuid_idx').on(table.uuid),
    userIdx: (0, pg_core_1.index)('posts_userId_idx').on(table.userId),
    groupIdx: (0, pg_core_1.index)('posts_group_id_idx').on(table.groupId),
    pageIdx: (0, pg_core_1.index)('posts_page_id_idx').on(table.pageId),
}));
exports.postReactions = (0, pg_core_1.pgTable)('post_reactions', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    postId: (0, pg_core_1.bigserial)('post_id', { mode: 'number' }).references(() => exports.posts.id).notNull(),
    userId: (0, pg_core_1.bigserial)('userId', { mode: 'number' }).references(() => users_schema_1.users.id).notNull(),
    reactionTypeId: (0, pg_core_1.bigserial)('reaction_type_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('post_reactions_uuid_idx').on(table.uuid),
    postIdx: (0, pg_core_1.index)('post_reactions_post_id_idx').on(table.postId),
    userIdx: (0, pg_core_1.index)('post_reactions_userId_idx').on(table.userId),
}));
exports.groups = (0, pg_core_1.pgTable)('groups', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    slug: (0, pg_core_1.varchar)('slug', { length: 255 }).notNull().unique(),
    description: (0, pg_core_1.text)('description'),
    seo: (0, pg_core_1.jsonb)('seo'),
    privacyTypeId: (0, pg_core_1.bigserial)('privacy_type_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    coverImageUrl: (0, pg_core_1.varchar)('cover_image_url', { length: 500 }),
    createdBy: (0, pg_core_1.bigserial)('created_by', { mode: 'number' }).references(() => users_schema_1.users.id).notNull(),
    memberCount: (0, pg_core_1.integer)('member_count').default(0),
    favoriteCount: (0, pg_core_1.integer)('favorite_count').default(0),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { withTimezone: true }).defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('groups_uuid_idx').on(table.uuid),
    slugIdx: (0, pg_core_1.index)('groups_slug_idx').on(table.slug),
    createdByIdx: (0, pg_core_1.index)('groups_created_by_idx').on(table.createdBy),
}));
exports.groupMembers = (0, pg_core_1.pgTable)('group_members', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    groupId: (0, pg_core_1.bigserial)('group_id', { mode: 'number' }).references(() => exports.groups.id).notNull(),
    userId: (0, pg_core_1.bigserial)('userId', { mode: 'number' }).references(() => users_schema_1.users.id).notNull(),
    roleId: (0, pg_core_1.bigserial)('role_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    statusId: (0, pg_core_1.bigserial)('status_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    joinedAt: (0, pg_core_1.timestamp)('joined_at', { withTimezone: true }).defaultNow(),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { withTimezone: true }).defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('group_members_uuid_idx').on(table.uuid),
    groupIdx: (0, pg_core_1.index)('group_members_group_id_idx').on(table.groupId),
    userIdx: (0, pg_core_1.index)('group_members_userId_idx').on(table.userId),
}));
exports.pages = (0, pg_core_1.pgTable)('pages', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    slug: (0, pg_core_1.varchar)('slug', { length: 255 }).notNull().unique(),
    description: (0, pg_core_1.text)('description'),
    seo: (0, pg_core_1.jsonb)('seo'),
    categoryId: (0, pg_core_1.bigserial)('category_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id),
    coverImageUrl: (0, pg_core_1.varchar)('cover_image_url', { length: 500 }),
    profileImageUrl: (0, pg_core_1.varchar)('profile_image_url', { length: 500 }),
    createdBy: (0, pg_core_1.bigserial)('created_by', { mode: 'number' }).references(() => users_schema_1.users.id).notNull(),
    followerCount: (0, pg_core_1.integer)('follower_count').default(0),
    likeCount: (0, pg_core_1.integer)('like_count').default(0),
    favoriteCount: (0, pg_core_1.integer)('favorite_count').default(0),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { withTimezone: true }).defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('pages_uuid_idx').on(table.uuid),
    slugIdx: (0, pg_core_1.index)('pages_slug_idx').on(table.slug),
    createdByIdx: (0, pg_core_1.index)('pages_created_by_idx').on(table.createdBy),
}));
exports.pageMembers = (0, pg_core_1.pgTable)('page_members', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    pageId: (0, pg_core_1.bigserial)('page_id', { mode: 'number' }).references(() => exports.pages.id).notNull(),
    userId: (0, pg_core_1.bigserial)('userId', { mode: 'number' }).references(() => users_schema_1.users.id).notNull(),
    roleId: (0, pg_core_1.bigserial)('role_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    joinedAt: (0, pg_core_1.timestamp)('joined_at', { withTimezone: true }).defaultNow(),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { withTimezone: true }).defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('page_members_uuid_idx').on(table.uuid),
    pageIdx: (0, pg_core_1.index)('page_members_page_id_idx').on(table.pageId),
    userIdx: (0, pg_core_1.index)('page_members_userId_idx').on(table.userId),
}));
exports.pageLikes = (0, pg_core_1.pgTable)('page_likes', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    pageId: (0, pg_core_1.bigserial)('page_id', { mode: 'number' }).references(() => exports.pages.id).notNull(),
    userId: (0, pg_core_1.bigserial)('userId', { mode: 'number' }).references(() => users_schema_1.users.id).notNull(),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('page_likes_uuid_idx').on(table.uuid),
    pageIdx: (0, pg_core_1.index)('page_likes_page_id_idx').on(table.pageId),
    userIdx: (0, pg_core_1.index)('page_likes_userId_idx').on(table.userId),
}));
exports.pageFollows = (0, pg_core_1.pgTable)('page_follows', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    pageId: (0, pg_core_1.bigserial)('page_id', { mode: 'number' }).references(() => exports.pages.id).notNull(),
    userId: (0, pg_core_1.bigserial)('userId', { mode: 'number' }).references(() => users_schema_1.users.id).notNull(),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('page_follows_uuid_idx').on(table.uuid),
    pageIdx: (0, pg_core_1.index)('page_follows_page_id_idx').on(table.pageId),
    userIdx: (0, pg_core_1.index)('page_follows_userId_idx').on(table.userId),
}));
exports.friends = (0, pg_core_1.pgTable)('friends', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    userId: (0, pg_core_1.bigserial)('userId', { mode: 'number' }).references(() => users_schema_1.users.id).notNull(),
    friendId: (0, pg_core_1.bigserial)('friend_id', { mode: 'number' }).references(() => users_schema_1.users.id).notNull(),
    statusId: (0, pg_core_1.bigserial)('status_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    requestedAt: (0, pg_core_1.timestamp)('requested_at', { withTimezone: true }).defaultNow(),
    acceptedAt: (0, pg_core_1.timestamp)('accepted_at', { withTimezone: true }),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { withTimezone: true }).defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('friends_uuid_idx').on(table.uuid),
    userIdx: (0, pg_core_1.index)('friends_userId_idx').on(table.userId),
    friendIdx: (0, pg_core_1.index)('friends_friend_id_idx').on(table.friendId),
}));
exports.postsRelations = (0, drizzle_orm_1.relations)(exports.posts, ({ one, many }) => ({
    user: one(users_schema_1.users, {
        fields: [exports.posts.userId],
        references: [users_schema_1.users.id],
    }),
    postType: one(lookups_schema_1.lookups, {
        fields: [exports.posts.postTypeId],
        references: [lookups_schema_1.lookups.id],
    }),
    visibility: one(lookups_schema_1.lookups, {
        fields: [exports.posts.visibilityId],
        references: [lookups_schema_1.lookups.id],
    }),
    group: one(exports.groups, {
        fields: [exports.posts.groupId],
        references: [exports.groups.id],
    }),
    page: one(exports.pages, {
        fields: [exports.posts.pageId],
        references: [exports.pages.id],
    }),
    reactions: many(exports.postReactions),
}));
exports.groupsRelations = (0, drizzle_orm_1.relations)(exports.groups, ({ one, many }) => ({
    creator: one(users_schema_1.users, {
        fields: [exports.groups.createdBy],
        references: [users_schema_1.users.id],
    }),
    privacyType: one(lookups_schema_1.lookups, {
        fields: [exports.groups.privacyTypeId],
        references: [lookups_schema_1.lookups.id],
    }),
    members: many(exports.groupMembers),
    posts: many(exports.posts),
}));
exports.pagesRelations = (0, drizzle_orm_1.relations)(exports.pages, ({ one, many }) => ({
    creator: one(users_schema_1.users, {
        fields: [exports.pages.createdBy],
        references: [users_schema_1.users.id],
    }),
    category: one(lookups_schema_1.lookups, {
        fields: [exports.pages.categoryId],
        references: [lookups_schema_1.lookups.id],
    }),
    members: many(exports.pageMembers),
    likes: many(exports.pageLikes),
    follows: many(exports.pageFollows),
    posts: many(exports.posts),
}));
//# sourceMappingURL=social.schema.js.map