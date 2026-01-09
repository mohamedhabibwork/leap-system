"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaLibraryRelations = exports.mediaLibrary = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const users_schema_1 = require("./users.schema");
const lookups_schema_1 = require("./lookups.schema");
exports.mediaLibrary = (0, pg_core_1.pgTable)('media_library', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    uuid: (0, pg_core_1.uuid)('uuid').defaultRandom().notNull().unique(),
    uploadedBy: (0, pg_core_1.bigserial)('uploaded_by', { mode: 'number' }).references(() => users_schema_1.users.id).notNull(),
    mediableType: (0, pg_core_1.varchar)('mediable_type', { length: 50 }),
    mediableId: (0, pg_core_1.bigserial)('mediable_id', { mode: 'number' }),
    providerId: (0, pg_core_1.bigserial)('provider_id', { mode: 'number' }).references(() => lookups_schema_1.lookups.id).notNull(),
    fileName: (0, pg_core_1.varchar)('file_name', { length: 255 }).notNull(),
    originalName: (0, pg_core_1.varchar)('original_name', { length: 255 }).notNull(),
    filePath: (0, pg_core_1.varchar)('file_path', { length: 500 }).notNull(),
    fileType: (0, pg_core_1.varchar)('file_type', { length: 50 }),
    mimeType: (0, pg_core_1.varchar)('mime_type', { length: 100 }),
    fileSize: (0, pg_core_1.integer)('file_size'),
    altText: (0, pg_core_1.text)('alt_text'),
    metadata: (0, pg_core_1.jsonb)('metadata'),
    isTemporary: (0, pg_core_1.boolean)('is_temporary').default(false).notNull(),
    tempExpiresAt: (0, pg_core_1.timestamp)('temp_expires_at', { withTimezone: true }),
    downloadCount: (0, pg_core_1.integer)('download_count').default(0),
    isDeleted: (0, pg_core_1.boolean)('isDeleted').default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { withTimezone: true }).defaultNow(),
    deletedAt: (0, pg_core_1.timestamp)('deletedAt', { withTimezone: true }),
}, (table) => ({
    uuidIdx: (0, pg_core_1.index)('media_library_uuid_idx').on(table.uuid),
    uploadedByIdx: (0, pg_core_1.index)('media_library_uploaded_by_idx').on(table.uploadedBy),
    mediableIdx: (0, pg_core_1.index)('media_library_mediable_idx').on(table.mediableType, table.mediableId),
    temporaryIdx: (0, pg_core_1.index)('media_library_temporary_idx').on(table.isTemporary, table.tempExpiresAt),
}));
exports.mediaLibraryRelations = (0, drizzle_orm_1.relations)(exports.mediaLibrary, ({ one }) => ({
    uploader: one(users_schema_1.users, {
        fields: [exports.mediaLibrary.uploadedBy],
        references: [users_schema_1.users.id],
    }),
    provider: one(lookups_schema_1.lookups, {
        fields: [exports.mediaLibrary.providerId],
        references: [lookups_schema_1.lookups.id],
    }),
}));
//# sourceMappingURL=media.schema.js.map