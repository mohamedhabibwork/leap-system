"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventRegistrationsRelations = exports.eventsRelations = exports.eventRegistrations = exports.events = exports.eventCategories = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const users_schema_1 = require("./users.schema");
const lookups_schema_1 = require("./lookups.schema");
exports.eventCategories = (0, pg_core_1.pgTable)('event_categories', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    nameEn: (0, pg_core_1.varchar)('name_en', { length: 255 }).notNull(),
    nameAr: (0, pg_core_1.varchar)('name_ar', { length: 255 }),
    slug: (0, pg_core_1.varchar)('slug', { length: 255 }).notNull().unique(),
    descriptionEn: (0, pg_core_1.text)('description_en'),
    descriptionAr: (0, pg_core_1.text)('description_ar'),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { withTimezone: true }).defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('event_categories_uuid_idx').on(table.uuid),
    slugIdx: (0, pg_core_1.index)('event_categories_slug_idx').on(table.slug),
}));
exports.events = (0, pg_core_1.pgTable)('events', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    titleEn: (0, pg_core_1.varchar)('title_en', { length: 255 }).notNull(),
    titleAr: (0, pg_core_1.varchar)('title_ar', { length: 255 }),
    slug: (0, pg_core_1.varchar)('slug', { length: 255 }).notNull().unique(),
    descriptionEn: (0, pg_core_1.text)('description_en'),
    descriptionAr: (0, pg_core_1.text)('description_ar'),
    seo: (0, pg_core_1.jsonb)('seo'),
    eventTypeId: (0, pg_core_1.bigserial)('event_type_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    statusId: (0, pg_core_1.bigserial)('status_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    categoryId: (0, pg_core_1.bigserial)('category_id', { mode: 'number' }).references(() => exports.eventCategories.id),
    startDate: (0, pg_core_1.timestamp)('start_date', { withTimezone: true }).notNull(),
    endDate: (0, pg_core_1.timestamp)('end_date', { withTimezone: true }),
    location: (0, pg_core_1.varchar)('location', { length: 500 }),
    timezone: (0, pg_core_1.varchar)('timezone', { length: 100 }),
    meetingUrl: (0, pg_core_1.varchar)('meeting_url', { length: 500 }),
    capacity: (0, pg_core_1.integer)('capacity'),
    createdBy: (0, pg_core_1.bigserial)('created_by', { mode: 'number' }).references(() => users_schema_1.users.id).notNull(),
    bannerUrl: (0, pg_core_1.varchar)('banner_url', { length: 500 }),
    isFeatured: (0, pg_core_1.boolean)('is_featured').default(false).notNull(),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    registrationCount: (0, pg_core_1.integer)('registration_count').default(0),
    favoriteCount: (0, pg_core_1.integer)('favorite_count').default(0),
    shareCount: (0, pg_core_1.integer)('share_count').default(0),
    goingCount: (0, pg_core_1.integer)('going_count').default(0),
    interestedCount: (0, pg_core_1.integer)('interested_count').default(0),
    maybeCount: (0, pg_core_1.integer)('maybe_count').default(0),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { withTimezone: true }).defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('events_uuid_idx').on(table.uuid),
    slugIdx: (0, pg_core_1.index)('events_slug_idx').on(table.slug),
    createdByIdx: (0, pg_core_1.index)('events_created_by_idx').on(table.createdBy),
    categoryIdx: (0, pg_core_1.index)('events_category_id_idx').on(table.categoryId),
}));
exports.eventRegistrations = (0, pg_core_1.pgTable)('event_registrations', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    eventId: (0, pg_core_1.bigserial)('event_id', { mode: 'number' }).references(() => exports.events.id).notNull(),
    userId: (0, pg_core_1.bigserial)('userId', { mode: 'number' }).references(() => users_schema_1.users.id).notNull(),
    statusId: (0, pg_core_1.bigserial)('status_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    attendanceStatusId: (0, pg_core_1.bigserial)('attendance_status_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    registeredAt: (0, pg_core_1.timestamp)('registered_at', { withTimezone: true }).defaultNow(),
    attendedAt: (0, pg_core_1.timestamp)('attended_at', { withTimezone: true }),
    cancelledAt: (0, pg_core_1.timestamp)('cancelled_at', { withTimezone: true }),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { withTimezone: true }).defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('event_registrations_uuid_idx').on(table.uuid),
    eventIdx: (0, pg_core_1.index)('event_registrations_event_id_idx').on(table.eventId),
    userIdx: (0, pg_core_1.index)('event_registrations_userId_idx').on(table.userId),
}));
exports.eventsRelations = (0, drizzle_orm_1.relations)(exports.events, ({ one, many }) => ({
    creator: one(users_schema_1.users, {
        fields: [exports.events.createdBy],
        references: [users_schema_1.users.id],
    }),
    eventType: one(lookups_schema_1.lookups, {
        fields: [exports.events.eventTypeId],
        references: [lookups_schema_1.lookups.id],
    }),
    status: one(lookups_schema_1.lookups, {
        fields: [exports.events.statusId],
        references: [lookups_schema_1.lookups.id],
    }),
    category: one(exports.eventCategories, {
        fields: [exports.events.categoryId],
        references: [exports.eventCategories.id],
    }),
    registrations: many(exports.eventRegistrations),
}));
exports.eventRegistrationsRelations = (0, drizzle_orm_1.relations)(exports.eventRegistrations, ({ one }) => ({
    event: one(exports.events, {
        fields: [exports.eventRegistrations.eventId],
        references: [exports.events.id],
    }),
    user: one(users_schema_1.users, {
        fields: [exports.eventRegistrations.userId],
        references: [users_schema_1.users.id],
    }),
    status: one(lookups_schema_1.lookups, {
        fields: [exports.eventRegistrations.statusId],
        references: [lookups_schema_1.lookups.id],
    }),
    attendanceStatus: one(lookups_schema_1.lookups, {
        fields: [exports.eventRegistrations.attendanceStatusId],
        references: [lookups_schema_1.lookups.id],
    }),
}));
//# sourceMappingURL=events.schema.js.map