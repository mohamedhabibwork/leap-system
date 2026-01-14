import { pgTable, bigserial, uuid, varchar, text, timestamp, boolean, index, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';

// User Profiles Table
export const userProfiles = pgTable('user_profiles', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  userId: bigserial('user_id', { mode: 'number' }).references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  bio: text('bio'),
  dateOfBirth: date('date_of_birth'),
  gender: varchar('gender', { length: 20 }),
  avatar: varchar('avatar', { length: 500 }),
  coverPhoto: varchar('cover_photo', { length: 500 }),
  location: varchar('location', { length: 255 }),
  website: varchar('website', { length: 255 }),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('user_profiles_uuid_idx').on(table.uuid),
  userIdx: index('user_profiles_user_id_idx').on(table.userId),
}));

// Relations
export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));
