import { pgTable, bigserial, uuid, varchar, text, timestamp, boolean, integer, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Lookup Types Table
export const lookupTypes = pgTable('lookup_types', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  description: text('description'),
  parentId: bigserial('parent_id', { mode: 'number' }).references((): any => lookupTypes.id),
  metadata: jsonb('metadata'),
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('isActive').default(true).notNull(),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('lookup_types_uuid_idx').on(table.uuid),
  codeIdx: index('lookup_types_code_idx').on(table.code),
  parentIdx: index('lookup_types_parent_id_idx').on(table.parentId),
}));

// Lookups Table
export const lookups = pgTable('lookups', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  lookupTypeId: bigserial('lookup_type_id', { mode: 'number' }).references(() => lookupTypes.id).notNull(),
  parentId: bigserial('parent_id', { mode: 'number' }).references((): any => lookups.id),
  code: varchar('code', { length: 50 }).notNull().unique(),
  nameEn: varchar('name_en', { length: 255 }).notNull(),
  nameAr: varchar('name_ar', { length: 255 }),
  descriptionEn: text('description_en'),
  descriptionAr: text('description_ar'),
  timezone: varchar('timezone', { length: 100 }),
  metadata: jsonb('metadata'),
  sortOrder: integer('sort_order').default(0),
  displayOrder: integer('display_order').default(0),
  isActive: boolean('isActive').default(true).notNull(),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('lookups_uuid_idx').on(table.uuid),
  codeIdx: index('lookups_code_idx').on(table.code),
  typeIdx: index('lookups_type_id_idx').on(table.lookupTypeId),
  parentIdx: index('lookups_parent_id_idx').on(table.parentId),
}));

// Relations
export const lookupTypesRelations = relations(lookupTypes, ({ many, one }) => ({
  lookups: many(lookups),
  parent: one(lookupTypes, {
    fields: [lookupTypes.parentId],
    references: [lookupTypes.id],
  }),
  children: many(lookupTypes),
}));

export const lookupsRelations = relations(lookups, ({ one, many }) => ({
  lookupType: one(lookupTypes, {
    fields: [lookups.lookupTypeId],
    references: [lookupTypes.id],
  }),
  parent: one(lookups, {
    fields: [lookups.parentId],
    references: [lookups.id],
  }),
  children: many(lookups),
}));
