import { pgTable, bigserial, uuid, varchar, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { lookups } from './lookups.schema';

// Users Table
export const users = pgTable('users', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  firstName: varchar('firstName', { length: 100 }),
  lastName: varchar('lastName', { length: 100 }),
  phone: varchar('phone', { length: 20 }),
  bio: text('bio'),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  resumeUrl: varchar('resume_url', { length: 500 }),
  roleId: bigserial('role_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  statusId: bigserial('status_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  preferredLanguage: varchar('preferred_language', { length: 5 }).default('en'),
  timezone: varchar('timezone', { length: 50 }),
  emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  isOnline: boolean('isOnline').default(false).notNull(),
  isActive: boolean('isActive').default(true).notNull(),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('users_uuid_idx').on(table.uuid),
  emailIdx: index('users_email_idx').on(table.email),
  usernameIdx: index('users_username_idx').on(table.username),
  roleIdx: index('users_role_id_idx').on(table.roleId),
  statusIdx: index('users_status_id_idx').on(table.statusId),
}));

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  role: one(lookups, {
    fields: [users.roleId],
    references: [lookups.id],
    relationName: 'userRole',
  }),
  status: one(lookups, {
    fields: [users.statusId],
    references: [lookups.id],
    relationName: 'userStatus',
  }),
}));
