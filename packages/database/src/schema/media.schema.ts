import { pgTable, bigserial, uuid, varchar, text, timestamp, boolean, integer, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { lookups } from './lookups.schema';

// Media Library Table (Polymorphic)
export const mediaLibrary = pgTable('media_library', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  uploadedBy: bigserial('uploaded_by', { mode: 'number' }).references(() => users.id).notNull(),
  mediableType: varchar('mediable_type', { length: 50 }),
  mediableId: bigserial('mediable_id', { mode: 'number' }),
  providerId: bigserial('provider_id', { mode: 'number' }).references(() => lookups.id).notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  filePath: varchar('file_path', { length: 500 }).notNull(),
  fileType: varchar('file_type', { length: 50 }),
  mimeType: varchar('mime_type', { length: 100 }),
  fileSize: integer('file_size'),
  altText: text('alt_text'),
  metadata: jsonb('metadata'),
  isTemporary: boolean('is_temporary').default(false).notNull(),
  tempExpiresAt: timestamp('temp_expires_at', { withTimezone: true }),
  downloadCount: integer('download_count').default(0),
  isDeleted: boolean('isDeleted').default(false).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deletedAt', { withTimezone: true }),
}, (table) => ({
  uuidIdx: index('media_library_uuid_idx').on(table.uuid),
  uploadedByIdx: index('media_library_uploaded_by_idx').on(table.uploadedBy),
  mediableIdx: index('media_library_mediable_idx').on(table.mediableType, table.mediableId),
  temporaryIdx: index('media_library_temporary_idx').on(table.isTemporary, table.tempExpiresAt),
}));

// Relations
export const mediaLibraryRelations = relations(mediaLibrary, ({ one }) => ({
  uploader: one(users, {
    fields: [mediaLibrary.uploadedBy],
    references: [users.id],
  }),
  provider: one(lookups, {
    fields: [mediaLibrary.providerId],
    references: [lookups.id],
  }),
}));
