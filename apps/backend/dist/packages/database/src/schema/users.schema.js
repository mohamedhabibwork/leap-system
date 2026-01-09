"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRelations = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const lookups_schema_1 = require("./lookups.schema");
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    username: (0, pg_core_1.varchar)('username', { length: 50 }).notNull().unique(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull().unique(),
    passwordHash: (0, pg_core_1.varchar)('password_hash', { length: 255 }),
    firstName: (0, pg_core_1.varchar)('firstName', { length: 100 }),
    lastName: (0, pg_core_1.varchar)('lastName', { length: 100 }),
    phone: (0, pg_core_1.varchar)('phone', { length: 20 }),
    bio: (0, pg_core_1.text)('bio'),
    avatarUrl: (0, pg_core_1.varchar)('avatar_url', { length: 500 }),
    resumeUrl: (0, pg_core_1.varchar)('resume_url', { length: 500 }),
    roleId: (0, pg_core_1.bigserial)('role_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    statusId: (0, pg_core_1.bigserial)('status_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    preferredLanguage: (0, pg_core_1.varchar)('preferred_language', { length: 5 }).default('en'),
    timezone: (0, pg_core_1.varchar)('timezone', { length: 50 }),
    emailVerifiedAt: (0, pg_core_1.timestamp)('email_verified_at', { withTimezone: true }),
    lastLoginAt: (0, pg_core_1.timestamp)('last_login_at', { withTimezone: true }),
    lastSeenAt: (0, pg_core_1.timestamp)('last_seen_at', { withTimezone: true }),
    isOnline: (0, pg_core_1.boolean)('isOnline').default(false).notNull(),
    isActive: (0, pg_core_1.boolean)('isActive').default(true).notNull(),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { withTimezone: true }).defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('users_uuid_idx').on(table.uuid),
    emailIdx: (0, pg_core_1.index)('users_email_idx').on(table.email),
    usernameIdx: (0, pg_core_1.index)('users_username_idx').on(table.username),
    roleIdx: (0, pg_core_1.index)('users_role_id_idx').on(table.roleId),
    statusIdx: (0, pg_core_1.index)('users_status_id_idx').on(table.statusId),
}));
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ one }) => ({
    role: one(lookups_schema_1.lookups, {
        fields: [exports.users.roleId],
        references: [lookups_schema_1.lookups.id],
        relationName: 'userRole',
    }),
    status: one(lookups_schema_1.lookups, {
        fields: [exports.users.statusId],
        references: [lookups_schema_1.lookups.id],
        relationName: 'userStatus',
    }),
}));
//# sourceMappingURL=users.schema.js.map