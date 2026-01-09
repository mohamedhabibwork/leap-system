import { pgTable, bigserial, uuid, varchar, text, timestamp, boolean, integer, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { lookups } from './lookups.schema';

// Event Categories Table
export const eventCategories = pgTable('event_categories', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  nameEn: varchar('name_en', { length: 255 }).notNull(),
  nameAr: varchar('name_ar', { length: 255 }),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  descriptionEn: text('description_en'),
  descriptionAr: text('description_ar'),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('event_categories_uuid_idx').on(table.uuid),
  slugIdx: index('event_categories_slug_idx').on(table.slug),
}));

// Events Table
export const events = pgTable('events', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  titleEn: varchar('title_en', { length: 255 }).notNull(),
  titleAr: varchar('title_ar', { length: 255 }),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  descriptionEn: text('description_en'),
  descriptionAr: text('description_ar'),
  seo: jsonb('seo'),
  eventTypeId: bigserial('event_type_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  statusId: bigserial('status_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  categoryId: bigserial('category_id', { mode: 'number' }).references(() => eventCategories.id),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }),
  location: varchar('location', { length: 500 }),
  timezone: varchar('timezone', { length: 100 }),
  meetingUrl: varchar('meeting_url', { length: 500 }),
  capacity: integer('capacity'),
  createdBy: bigserial('created_by', { mode: 'number' }).references(() => users.id).notNull(),
  bannerUrl: varchar('banner_url', { length: 500 }),
  isFeatured: boolean('is_featured').default(false).notNull(),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  registrationCount: integer('registration_count').default(0),
  favoriteCount: integer('favorite_count').default(0),
  shareCount: integer('share_count').default(0),
  goingCount: integer('going_count').default(0),
  interestedCount: integer('interested_count').default(0),
  maybeCount: integer('maybe_count').default(0),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('events_uuid_idx').on(table.uuid),
  slugIdx: index('events_slug_idx').on(table.slug),
  createdByIdx: index('events_created_by_idx').on(table.createdBy),
  categoryIdx: index('events_category_id_idx').on(table.categoryId),
}));

// Event Registrations Table
export const eventRegistrations = pgTable('event_registrations', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  eventId: bigserial('event_id', { mode: 'number' }).references(() => events.id).notNull(),
  userId: bigserial('userId', { mode: 'number' }).references(() => users.id).notNull(),
  statusId: bigserial('status_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  attendanceStatusId: bigserial('attendance_status_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  registeredAt: timestamp('registered_at', { withTimezone: true }).defaultNow(),
  attendedAt: timestamp('attended_at', { withTimezone: true }),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('event_registrations_uuid_idx').on(table.uuid),
  eventIdx: index('event_registrations_event_id_idx').on(table.eventId),
  userIdx: index('event_registrations_userId_idx').on(table.userId),
}));

// Relations
export const eventsRelations = relations(events, ({ one, many }) => ({
  creator: one(users, {
    fields: [events.createdBy],
    references: [users.id],
  }),
  eventType: one(lookups, {
    fields: [events.eventTypeId],
    references: [lookups.id],
  }),
  status: one(lookups, {
    fields: [events.statusId],
    references: [lookups.id],
  }),
  category: one(eventCategories, {
    fields: [events.categoryId],
    references: [eventCategories.id],
  }),
  registrations: many(eventRegistrations),
}));

export const eventRegistrationsRelations = relations(eventRegistrations, ({ one }) => ({
  event: one(events, {
    fields: [eventRegistrations.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventRegistrations.userId],
    references: [users.id],
  }),
  status: one(lookups, {
    fields: [eventRegistrations.statusId],
    references: [lookups.id],
  }),
  attendanceStatus: one(lookups, {
    fields: [eventRegistrations.attendanceStatusId],
    references: [lookups.id],
  }),
}));
