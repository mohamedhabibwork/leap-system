import { pgTable, bigserial, uuid, varchar, text, timestamp, boolean, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { lookups } from './lookups.schema';

// CMS Pages Table
export const cmsPages = pgTable('cms_pages', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  pageTypeId: bigserial('page_type_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  statusId: bigserial('status_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  titleEn: varchar('title_en', { length: 255 }).notNull(),
  titleAr: varchar('title_ar', { length: 255 }),
  contentEn: text('content_en'),
  contentAr: text('content_ar'),
  metadata: jsonb('metadata'),
  settings: jsonb('settings'),
  isPublished: boolean('is_published').default(false).notNull(),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('cms_pages_uuid_idx').on(table.uuid),
  slugIdx: index('cms_pages_slug_idx').on(table.slug),
}));

// Relations
export const cmsPagesRelations = relations(cmsPages, ({ one }) => ({
  pageType: one(lookups, {
    fields: [cmsPages.pageTypeId],
    references: [lookups.id],
  }),
  status: one(lookups, {
    fields: [cmsPages.statusId],
    references: [lookups.id],
  }),
}));
